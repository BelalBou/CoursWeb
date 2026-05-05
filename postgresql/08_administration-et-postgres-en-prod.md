# Cours 08 — Administration et Postgres en prod

## Ce qu'on va voir

- Les **rôles** et permissions : qui peut faire quoi
- **Sauvegarder** et **restaurer** une base : `pg_dump` / `pg_restore`
- Les **variables d'environnement** : ne **jamais** mettre un mot de passe dans le code
- La **connexion sécurisée** (SSL en prod)
- **Bascule du projet** : Prisma SQLite → PostgreSQL
- Préview Linux : on déploiera bientôt sur un vrai serveur

---

## Les rôles et permissions

Dans Postgres, un **rôle** est un compte. Il peut représenter un humain ou un service. Un rôle peut avoir des **droits** : se connecter, créer des tables, lire, écrire...

### Créer un rôle

```sql
CREATE ROLE backend_app
WITH LOGIN
     PASSWORD 'mot-de-passe-fort'
     NOSUPERUSER
     NOCREATEDB
     NOCREATEROLE;
```

Décodage :

- `LOGIN` : le rôle peut se connecter (sinon c'est un groupe).
- `PASSWORD` : son mot de passe.
- `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE` : le strict minimum, par sécurité.

### Donner des droits avec `GRANT`

```sql
-- Droit de se connecter à la base
GRANT CONNECT ON DATABASE portfolio TO backend_app;

-- Droit d'utiliser le schéma public
GRANT USAGE ON SCHEMA public TO backend_app;

-- Droit de lire/écrire/modifier toutes les tables existantes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO backend_app;

-- Idem pour les futures tables (créées plus tard)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO backend_app;
```

### Le principe du moindre privilège

Règle d'or : **un rôle doit avoir le minimum de droits dont il a besoin**.

- Ton **backend** : SELECT, INSERT, UPDATE, DELETE. Pas plus.
- Un script de **lecture seule** (rapports) : SELECT seulement.
- L'utilisateur "admin" qui fait les migrations : tous les droits.

Comme ça, si un rôle est compromis (mot de passe volé), les dégâts sont limités.

> En cours, on utilise le rôle `cours` (créé par défaut au cours 03) qui a tous les droits. C'est ok pour apprendre. **Pas en prod.**

---

## Sauvegardes : `pg_dump`

Une base sans sauvegarde, c'est une base condamnée. Tôt ou tard, quelqu'un fait un `DELETE FROM projets;` sans `WHERE`. Tu dois pouvoir restaurer.

### Faire un dump

```bash
docker exec -t postgres-cours \
  pg_dump -U cours -d portfolio > portfolio_$(date +%Y%m%d).sql
```

Ça produit un fichier `.sql` avec **toutes** les commandes pour recréer ta base.

### Restaurer

Sur une base vide :

```bash
docker exec -i postgres-cours \
  psql -U cours -d portfolio < portfolio_20251204.sql
```

### Format binaire (plus rapide pour les grosses bases)

```bash
docker exec -t postgres-cours \
  pg_dump -U cours -d portfolio -F c -f /tmp/portfolio.dump
```

Et pour restaurer :

```bash
docker exec -i postgres-cours \
  pg_restore -U cours -d portfolio < portfolio.dump
```

> En prod : un cron quotidien qui dump, et qui pousse le fichier dans un endroit sûr (S3, sauvegarde distante). **Et** tu testes que la restauration fonctionne, sinon tu n'as pas de sauvegarde, tu as un fichier.

---

## Variables d'environnement : jamais le mot de passe en dur

Une règle absolue : **un mot de passe ne se met JAMAIS dans le code source committé**. Sinon il finit sur GitHub, et 5 minutes plus tard il est dans la nature.

### La méthode propre : `.env`

Dans ton projet `mon-backend/`, à la racine :

**`.env`** (ne pas committer) :

```
DATABASE_URL="postgresql://cours:secret@localhost:5432/portfolio"
```

**`.env.example`** (à committer, sans la vraie valeur) :

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"
```

**`.gitignore`** doit contenir :

```
.env
```

Comme ça, ton `.env` reste local, et tes coéquipiers savent **quelles** variables il leur faut grâce à `.env.example`.

> Prisma et NestJS lisent automatiquement le `.env` quand ton appli démarre. Tu n'as rien à faire de spécial.

### En production

Sur un serveur (Linux qu'on verra bientôt), tu ne mets **pas** un fichier `.env` non plus. Tu utilises les **variables d'environnement** du système, ou un gestionnaire de secrets (AWS Secrets Manager, Vault, etc.). On en reparlera.

---

## Connexion sécurisée : SSL

En local, ta base écoute sur `localhost`. Aucun risque que quelqu'un intercepte. En prod, ta base est sur un autre serveur, et la communication transite par Internet. Là, **chiffrement obligatoire** : SSL/TLS.

URL avec SSL :

```
postgresql://user:pass@host:5432/db?sslmode=require
```

Les hébergeurs sérieux (Neon, Supabase, Railway, AWS RDS, etc.) imposent SSL par défaut. C'est tant mieux.

> Pour ton projet local, on s'en passe. Mais le jour où tu déploies, **n'oublie pas `?sslmode=require`** dans ton URL.

---

## Migrations : versionner le schéma

Quand on était sur SQLite avec Prisma, tu lançais `npx prisma migrate dev`. Ça créait un dossier `prisma/migrations/` avec un fichier `.sql` par changement de schéma.

C'est l'**historique** de ta base, comme Git pour ton code. Chaque équipier peut rejouer ces migrations dans l'ordre pour avoir la bonne structure.

**Règle d'or** : on **commit** les migrations. On ne les modifie **jamais** après coup. Si on s'est trompé, on crée une **nouvelle** migration qui corrige.

---

## Bascule du projet : SQLite → PostgreSQL

C'est le moment qu'on attendait. Tu vas passer ton backend Prisma de SQLite à PostgreSQL.

### Étape 1 : vérifier que Postgres tourne

```bash
docker ps
```

Tu dois voir `postgres-cours`. Sinon :

```bash
docker start postgres-cours
```

### Étape 2 : modifier `schema.prisma`

Dans `mon-backend/prisma/schema.prisma`, change le `datasource` :

**Avant** (SQLite) :

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Après** (PostgreSQL) :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

C'est tout : un seul mot à changer.

### Étape 3 : modifier le `.env`

Dans `mon-backend/.env` :

**Avant** :

```
DATABASE_URL="file:./dev.db"
```

**Après** :

```
DATABASE_URL="postgresql://cours:secret@localhost:5432/portfolio"
```

### Étape 4 : nettoyer l'ancien historique de migrations

Comme on change de SGBD, l'historique SQLite n'est plus valide. Pour cet apprentissage, le plus simple :

```bash
rm -rf prisma/migrations
```

> En vrai projet, on **ne supprime jamais** les migrations comme ça. On change de SGBD avec une stratégie complète (export, import, migrations dédiées). Ici, on apprend, donc on simplifie.

### Étape 5 : (optionnel) repartir d'une base propre

Pour cet exercice, on enlève les tables qu'on a créées à la main :

```bash
docker exec -it postgres-cours psql -U cours -d portfolio
```

```sql
DROP TABLE IF EXISTS projets_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS projets;
\q
```

### Étape 6 : créer la première migration Postgres

```bash
npx prisma migrate dev --name passage_postgres
```

Prisma :

1. Lit ton `schema.prisma`.
2. Se connecte à Postgres avec ta nouvelle `DATABASE_URL`.
3. Crée toutes les tables (avec les bons types Postgres).
4. Génère le client Prisma TypeScript.

### Étape 7 : vérifier

Lance ton backend :

```bash
npm run start:dev
```

Et fais une requête à ton API. Si tout marche : **bravo, tu tournes sur PostgreSQL** !

Tu peux aussi vérifier dans `psql` que les tables sont là :

```bash
docker exec -it postgres-cours psql -U cours -d portfolio -c "\dt"
```

### Quelques différences SQLite → Postgres à connaître

| Sujet | SQLite | PostgreSQL |
|---|---|---|
| Casse des identifiants | Insensible | Sensible (utilise `snake_case`) |
| Types | Très souples | Stricts |
| Concurrence | Un seul écrivain | Plusieurs en parallèle |
| Migrations | Souvent permissives | Plus rigoureuses |

Si Prisma râle au moment de la migration, lis le message attentivement : il indique généralement la colonne en cause.

---

## Une checklist "prod"

Avant de mettre une base Postgres en production, vérifie :

- [ ] Le mot de passe est dans une **variable d'environnement**, pas dans le code.
- [ ] La connexion est en **SSL** (`?sslmode=require`).
- [ ] Le **rôle applicatif** n'a que les droits qu'il faut (pas superuser).
- [ ] Une **sauvegarde automatique** quotidienne tourne, et la **restauration a été testée**.
- [ ] Les **migrations** sont versionnées dans Git.
- [ ] Les **clés étrangères** importantes ont des **index**.
- [ ] Tu as un plan en cas de panne (où sont les backups, qui prévenir).

Tu peux mettre cette liste en favori. C'est exactement ce qu'on attend dans une équipe sérieuse.

---

## Et après ? Préview Linux

Maintenant tu sais :

- Pourquoi une base de données.
- Pourquoi PostgreSQL.
- Comment écrire du SQL.
- Comment relier des tables.
- Comment optimiser avec des index.
- Comment passer ton projet en Postgres.

L'étape suivante : **déployer tout ça sur un vrai serveur**. Pour ça, il faut comprendre **Linux** : où vivent les fichiers, comment lancer un service en arrière-plan, comment ouvrir un port, comment installer Postgres et Node sur une machine distante.

C'est le sujet du module suivant.

---

## Application sur le projet

À ce stade, ton projet doit :

1. Avoir un **conteneur Postgres** qui tourne (`docker ps` le confirme).
2. Avoir un `schema.prisma` avec `provider = "postgresql"`.
3. Avoir une `DATABASE_URL` en `.env` qui pointe sur Postgres.
4. Avoir une migration `passage_postgres` créée.
5. Démarrer normalement avec `npm run start:dev`.

Si une de ces étapes échoue : relis le message d'erreur, vérifie ton URL, vérifie que Docker tourne. C'est presque toujours une virgule, un mot de passe ou un port.

---

## Résumé

- **Rôles** = comptes Postgres. Donne le minimum de droits avec `GRANT`.
- **`pg_dump`** sauvegarde, **`psql` ou `pg_restore`** restaurent. Sauvegarde = test de restauration.
- **Mot de passe** dans `.env`, jamais dans le code. `.env.example` à committer, `.env` au `.gitignore`.
- **SSL en prod** : `?sslmode=require`.
- Bascule SQLite → Postgres : changer `provider` dans `schema.prisma`, ajuster `DATABASE_URL`, `npx prisma migrate dev`.
- Préview : on apprend Linux pour déployer tout ça sur un vrai serveur.

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 07 — Index et performance](./07_index-et-performance.md)
- → Suivant : [Cours 01 — C'est quoi Linux](../linux/01_cest-quoi-linux.md)
- Sommaire : [README](../README.md)
