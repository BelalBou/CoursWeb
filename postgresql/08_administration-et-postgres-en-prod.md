# Cours 08 — Administration et Postgres en prod

## Ce qu'on va voir

- Les **rôles** et permissions : qui peut faire quoi
- **Sauvegarder** et **restaurer** une base : `pg_dump` / `pg_restore`
- Les **variables d'environnement** : ne **jamais** mettre un mot de passe dans le code
- La **connexion sécurisée** (SSL en prod)
- Préparer la connexion du backend à PostgreSQL avec Prisma
- Prochaine étape : brancher NestJS à PostgreSQL avec Prisma

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
DATABASE_URL="postgresql://cours:secret@localhost:5433/portfolio"
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

Quand on sera dans le bloc Prisma, tu lanceras `npx prisma migrate dev`. Ça créera un dossier `prisma/migrations/` avec un fichier `.sql` par changement de schéma.

C'est l'**historique** de ta base, comme Git pour ton code. Chaque équipier peut rejouer ces migrations dans l'ordre pour avoir la bonne structure.

**Règle d'or** : on **commit** les migrations. On ne les modifie **jamais** après coup. Si on s'est trompé, on crée une **nouvelle** migration qui corrige.

---

## Préparer le projet pour Prisma + PostgreSQL

C'est le moment de préparer le terrain : PostgreSQL tourne, la base `portfolio` existe, et le bloc suivant branchera Prisma dessus.

### Étape 1 : vérifier que Postgres tourne

```bash
docker ps
```

Tu dois voir `postgres-cours`. Sinon :

```bash
docker start postgres-cours
```

### Étape 2 : garder l'URL sous la main

Dans le bloc Prisma, le `schema.prisma` utilisera directement PostgreSQL :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Étape 3 : modifier le `.env`

Dans `mon-backend/.env` :

```
DATABASE_URL="postgresql://cours:secret@localhost:5433/portfolio"
```

### Étape 4 : (optionnel) repartir d'une base propre

Pour cet exercice, on enlève les tables qu'on a créées à la main :

```bash
docker exec -it postgres-cours psql -U cours -d portfolio
```

```sql
DROP TABLE IF EXISTS projets_tags;
DROP TABLE IF EXISTS projets_technologies;
DROP TABLE IF EXISTS technologies;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS projets;
\q
```

### Étape 5 : créer la première migration Prisma

```bash
npx prisma migrate dev --name init_postgres
```

Prisma :

1. Lit ton `schema.prisma`.
2. Se connecte à Postgres avec ta nouvelle `DATABASE_URL`.
3. Crée toutes les tables (avec les bons types Postgres).
4. Génère le client Prisma TypeScript.

### Étape 6 : vérifier

Lance ton backend :

```bash
npm run start:dev
```

Et fais une requête à ton API. Si tout marche : **bravo, tu tournes sur PostgreSQL** !

Tu peux aussi vérifier dans `psql` que les tables sont là :

```bash
docker exec -it postgres-cours psql -U cours -d portfolio -c "\dt"
```

### Quelques différences SQLite / Postgres à connaître

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

## Et après ? Prisma

Maintenant tu sais :

- Pourquoi une base de données.
- Pourquoi PostgreSQL.
- Comment écrire du SQL.
- Comment relier des tables.
- Comment optimiser avec des index.
- Comment préparer ton projet pour Postgres.

L'étape suivante : **Prisma**. On va garder PostgreSQL comme vraie base, mais arrêter d'écrire toutes les requêtes SQL à la main dans le backend. Prisma fera le pont entre NestJS, TypeScript et Postgres.

C'est le sujet du module suivant.

---

## Application sur le projet

À ce stade, ton projet doit :

1. Avoir un **conteneur Postgres** qui tourne (`docker ps` le confirme).
2. Avoir une base `portfolio` accessible avec l'utilisateur `cours`.
3. Avoir testé les tables `projets`, `technologies`, `projets_technologies` et `messages`.
4. Avoir compris la `DATABASE_URL` qu'on donnera à Prisma juste après.
5. Avoir encore un backend NestJS qui démarre normalement.

Si une de ces étapes échoue : relis le message d'erreur, vérifie ton URL, vérifie que Docker tourne. C'est presque toujours une virgule, un mot de passe ou un port.

---

## Résumé

- **Rôles** = comptes Postgres. Donne le minimum de droits avec `GRANT`.
- **`pg_dump`** sauvegarde, **`psql` ou `pg_restore`** restaurent. Sauvegarde = test de restauration.
- **Mot de passe** dans `.env`, jamais dans le code. `.env.example` à committer, `.env` au `.gitignore`.
- **SSL en prod** : `?sslmode=require`.
- Prisma utilisera directement Postgres : `provider = "postgresql"`, `DATABASE_URL`, puis `npx prisma migrate dev`.
- Ensuite seulement, on apprendra Linux pour déployer tout ça sur un vrai serveur.

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 07 — Index et performance](./07_index-et-performance.md)
- → Suivant : [Cours 01 Prisma — C'est quoi un ORM ?](../prisma/01_cest-quoi-un-orm.md)
- Sommaire : [README](../README.md)
