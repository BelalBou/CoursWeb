# Cours 03 — Installation locale

## Ce qu'on va voir

- Installer PostgreSQL en **2 minutes** avec Docker (méthode recommandée)
- Installer "à l'ancienne" (apt, brew) si tu ne veux pas de Docker
- Se connecter avec **psql**, le client en ligne de commande
- Les outils graphiques (pgAdmin, DBeaver, TablePlus)
- Le format d'**URL de connexion** que tu vas voir partout

---

## Méthode recommandée : Docker

### Pourquoi Docker ?

Docker te permet de lancer Postgres dans un **conteneur** : une sorte de boîte isolée où Postgres tourne sans rien polluer sur ta machine. Quand tu n'en veux plus, tu supprimes le conteneur. Aucun fichier traîne.

Analogie : c'est comme si tu louais un mini-bureau prêt à l'emploi avec Postgres déjà installé dedans. Tu rentres, tu travailles, tu fermes la porte. Pas de ménage.

### Pré-requis

- Avoir **Docker** installé. Vérifie avec :

```bash
docker --version
```

Si ça affiche un numéro, c'est bon. Sinon, va sur [docker.com](https://www.docker.com/) pour installer Docker Desktop (Mac/Windows) ou Docker Engine (Linux).

### La commande magique

Copie-colle dans ton terminal :

```bash
docker run --name postgres-cours \
  -e POSTGRES_USER=cours \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 \
  -d postgres:16
```

> Si ton ordinateur a déjà un PostgreSQL local sur le port `5432`, utilise `-p 5433:5432` et mets `5433` dans la `DATABASE_URL`.

Décomposons morceau par morceau :

| Bout de commande | Ce que ça veut dire |
|---|---|
| `docker run` | "Lance un nouveau conteneur" |
| `--name postgres-cours` | Nom du conteneur (pour le retrouver) |
| `-e POSTGRES_USER=cours` | Crée un utilisateur Postgres `cours` |
| `-e POSTGRES_PASSWORD=secret` | Son mot de passe sera `secret` |
| `-e POSTGRES_DB=portfolio` | Crée une base `portfolio` au démarrage |
| `-p 5432:5432` | Ouvre le port 5432 (port standard de Postgres) |
| `-d` | "Detached" : tourne en arrière-plan |
| `postgres:16` | Image Docker officielle, version 16 |

> **À savoir** : le port `5432` est **LE** port de Postgres dans le monde entier. C'est presque un drapeau.

### Vérifier que ça tourne

```bash
docker ps
```

Tu dois voir une ligne avec `postgres-cours`. Si oui : bravo, Postgres tourne.

### Démarrer / arrêter / supprimer

- Arrêter (sans perdre les données) :
  ```bash
  docker stop postgres-cours
  ```
- Redémarrer :
  ```bash
  docker start postgres-cours
  ```
- Supprimer définitivement (avec les données) :
  ```bash
  docker rm -f postgres-cours
  ```

> **Attention** : par défaut, les données disparaissent quand on supprime le conteneur. Pour les garder, on monte un **volume**. Pour notre apprentissage, on s'en fiche un peu : on peut tout recréer.

---

## Alternative : installation native

Si tu refuses Docker, voici les autres options. Ce sera plus lourd à entretenir.

### Sur Linux (Debian, Ubuntu)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Sur macOS (avec Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Sur Windows

Télécharge l'installeur officiel sur [postgresql.org/download](https://www.postgresql.org/download/). Suis l'assistant.

> Avec ces installations, Postgres tourne directement sur ta machine. Pour créer un utilisateur et une base, il faut quelques commandes en plus. Docker est plus simple : on reste sur Docker.

---

## Se connecter avec `psql`

`psql` est le **client en ligne de commande** officiel. C'est notre couteau suisse.

### Avec Docker

Le `psql` est inclus dans le conteneur. On l'appelle de l'extérieur :

```bash
docker exec -it postgres-cours psql -U cours -d portfolio
```

Décomposons :

- `docker exec -it postgres-cours` → "rentre dans le conteneur `postgres-cours`"
- `psql` → "lance psql"
- `-U cours` → en tant qu'utilisateur `cours`
- `-d portfolio` → connecté à la base `portfolio`

Tu vois apparaître :

```
psql (16.x)
Type "help" for help.

portfolio=>
```

Le `portfolio=>` est le **prompt** : Postgres attend tes commandes.

### Avec une install native

Plus simple :

```bash
psql -U cours -d portfolio -h localhost
```

### Premier test

Tape ceci, suivi de `Entrée` :

```sql
SELECT 1;
```

Tu obtiens :

```
 ?column?
----------
        1
(1 row)
```

Bravo, Postgres marche. Tu peux quitter avec :

```sql
\q
```

### Commandes utiles dans psql

Les commandes qui commencent par `\` sont des **raccourcis psql** (pas du SQL).

| Commande | À quoi ça sert |
|---|---|
| `\l` | Lister toutes les bases |
| `\c portfolio` | Se connecter à la base `portfolio` |
| `\dt` | Lister les tables |
| `\d projets` | Décrire la structure de la table `projets` |
| `\du` | Lister les utilisateurs |
| `\q` | Quitter psql |
| `\?` | Voir toutes les commandes psql |
| `\h SELECT` | Aide sur la commande SQL `SELECT` |

À mémoriser au moins : `\l`, `\dt`, `\d`, `\q`.

---

## Les outils graphiques (GUI)

`psql` c'est puissant, mais regarder un tableau dans un terminal c'est moche. Plusieurs outils visuels existent pour cliquer sur les tables comme dans Excel :

- **pgAdmin** : l'outil officiel de Postgres. Web. Un peu lourd mais complet. [pgadmin.org](https://www.pgadmin.org/)
- **DBeaver** : universel (gère plein de SGBD). Gratuit. Bon pour démarrer. [dbeaver.io](https://dbeaver.io/)
- **TablePlus** : élégant, payant après quelques jours. macOS / Windows / Linux. [tableplus.com](https://tableplus.com/)

Pour ce cours, **psql suffit**. Si tu veux un outil graphique, **DBeaver** est un bon compromis gratuit. Tu te connectes avec les mêmes infos que ci-dessous.

---

## L'URL de connexion

Tous les outils (Prisma, NestJS, DBeaver...) attendent une **URL de connexion** au format standard :

```
postgresql://utilisateur:motdepasse@hôte:port/nom_base
```

Pour notre conteneur, ça donne :

```
postgresql://cours:secret@localhost:5432/portfolio
```

Décortiqué :

| Bout | Valeur | Sens |
|---|---|---|
| `postgresql://` | (fixe) | "Je veux parler à Postgres" |
| `cours` | utilisateur | qui je suis |
| `secret` | mot de passe | preuve |
| `localhost` | hôte | machine où tourne Postgres (ici, la mienne) |
| `5432` | port | porte d'entrée |
| `portfolio` | nom de la base | quel classeur ouvrir |

> Cette URL, on va la mettre dans le fichier `.env` de notre backend quand on branchera Prisma, dans la variable `DATABASE_URL`. **JAMAIS dans le code source committé.**

---

## Application sur le projet

C'est la première fois qu'on touche au projet `mon-backend` dans ce cours.

### Étape 1 : lancer Postgres

Dans ton terminal (n'importe où) :

```bash
docker run --name postgres-cours \
  -e POSTGRES_USER=cours \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 \
  -d postgres:16
```

### Étape 2 : vérifier la connexion

```bash
docker exec -it postgres-cours psql -U cours -d portfolio -c "SELECT version();"
```

Tu dois voir le numéro de version de Postgres. C'est gagné.

### Étape 3 : noter l'URL pour plus tard

Quelque part dans tes notes :

```
DATABASE_URL="postgresql://cours:secret@localhost:5432/portfolio"
```

Si tu as utilisé `-p 5433:5432`, note plutôt :

```
DATABASE_URL="postgresql://cours:secret@localhost:5433/portfolio"
```

On l'utilisera dans le bloc Prisma. **Ne la pousse pas sur GitHub maintenant**, même si c'est une base locale : on prend l'habitude.

---

## Résumé

- **Docker** est la manière la plus simple d'installer Postgres : une commande, un conteneur isolé.
- `docker ps` pour voir si ça tourne, `docker stop`/`start`/`rm` pour gérer.
- **`psql`** est le client en ligne de commande. Commandes utiles : `\l`, `\dt`, `\d table`, `\q`.
- Outils GUI optionnels : **pgAdmin**, **DBeaver**, **TablePlus**.
- L'**URL de connexion** suit le format `postgresql://user:pass@host:port/db`. C'est ce qu'attendent tous les outils.

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 02 — C'est quoi PostgreSQL](./02_cest-quoi-postgresql.md)
- → Suivant : [Cours 04 — Tables, colonnes, types](./04_tables-colonnes-types.md)
- Sommaire : [README](../README.md)
