# Cours 02 — Installation et schéma

## Ce qu'on va voir
On installe Prisma dans `mon-backend/`, on crée le fichier `schema.prisma`, et on décrit notre premier model `Projet`.

## Étape 1 — Installer Prisma

Ouvre un terminal **dans le dossier `mon-backend/`** (ton projet NestJS).

Deux paquets à installer :

```bash
npm i -D prisma
npm i @prisma/client
```

Pourquoi deux ?

- **`prisma`** (en `-D` = `devDependencies`) : c'est la **CLI**, l'outil en ligne de commande. Sert à générer le client, créer des migrations, ouvrir Prisma Studio. On ne l'utilise qu'en développement.
- **`@prisma/client`** (en dépendance normale) : c'est la **librairie** qu'on importe dans le code pour parler à la base. Elle doit aussi être installée en production.

Petite analogie : `prisma` c'est le **menuisier** qui fabrique tes meubles, `@prisma/client` c'est les **meubles eux-mêmes** que tu utilises tous les jours.

## Étape 2 — Initialiser Prisma

Toujours dans `mon-backend/` :

```bash
npx prisma init --datasource-provider postgresql
```

`npx` lance un outil installé localement. `prisma init` crée la structure de base. `--datasource-provider postgresql` dit "on utilise PostgreSQL", la base qu'on a installée juste avant.

Cette commande crée :

```
mon-backend/
├── prisma/
│   └── schema.prisma     ← le plan de la base
├── .env                  ← les secrets (URL de connexion, etc.)
└── ...
```

Et elle ajoute `.env` au `.gitignore` (tant mieux, on ne commit jamais les secrets).

## Étape 3 — Le fichier `.env`

Ouvre `.env`. Tu devrais voir quelque chose comme :

```
DATABASE_URL="postgresql://cours:secret@localhost:5433/portfolio"
```

C'est l'**adresse** de la base. Ici :

- `cours` = l'utilisateur Postgres.
- `secret` = son mot de passe.
- `localhost:5433` = ton ordinateur, port du conteneur Docker du cours.
- `portfolio` = le nom de la base.

Si ton port Docker est `5432` chez toi, garde `5432`. Sur notre machine de cours, `5432` était déjà pris, donc on utilise `5433`.

## Étape 4 — Le fichier `schema.prisma`

Ouvre `prisma/schema.prisma`. Tu vois trois blocs :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Décortiquons :

### Le bloc `generator`
> "Quand je fais `prisma generate`, fabrique-moi un client JavaScript/TypeScript."

C'est ce qui va produire les types et les fonctions comme `prisma.projet.findMany()`.

### Le bloc `datasource`
> "Voilà à quelle base je me connecte, et où trouver l'URL."

`provider = "postgresql"` : on utilise PostgreSQL. `url = env("DATABASE_URL")` : l'URL est lue depuis le fichier `.env`. Comme ça, on **ne met jamais de secret directement dans le schéma**.

## Étape 5 — Notre premier model

Un **model** Prisma, c'est la description d'une **table** de la base. Un model = un tiroir du classeur.

Ajoute ceci à la fin de `schema.prisma` :

```prisma
model Projet {
  id           Int                 @id @default(autoincrement())
  slug         String              @unique
  titre        String
  description  String
  lien         String
  estPublie    Boolean             @default(true) @map("est_publie")
  createdAt    DateTime            @default(now()) @map("created_at")
  updatedAt    DateTime            @updatedAt @map("updated_at")
  technologies ProjetTechnologie[]

  @@map("projets")
}

model Technologie {
  id      Int                 @id @default(autoincrement())
  nom     String              @unique
  projets ProjetTechnologie[]

  @@map("technologies")
}

model ProjetTechnologie {
  projetId      Int @map("projet_id")
  technologieId Int @map("technologie_id")

  projet      Projet      @relation(fields: [projetId], references: [id], onDelete: Cascade)
  technologie Technologie @relation(fields: [technologieId], references: [id], onDelete: Cascade)

  @@id([projetId, technologieId])
  @@index([technologieId])
  @@map("projets_technologies")
}

model Message {
  id      String   @id @default(uuid()) @db.Uuid
  nom     String
  email   String
  message String
  recuLe  DateTime @default(now()) @map("recu_le")

  @@unique([email, message], name: "messages_email_message_unique")
  @@index([recuLe(sort: Desc)])
  @@map("messages")
}
```

On lit ça **ligne par ligne**.

### `id Int @id @default(autoincrement())`

- `id` : nom de la colonne.
- `Int` : c'est un **entier** (un nombre sans virgule).
- `@id` : c'est la **clé primaire**. Une clé primaire, c'est l'identifiant unique de chaque ligne. Comme ton numéro de sécu : il n'y en a qu'un seul comme toi.
- `@default(autoincrement())` : si tu ne donnes pas de valeur, la base met automatiquement le suivant (1, 2, 3, 4...).

### `slug String @unique`

- `slug` : la version "URL-friendly" du titre (ex. `"mon-portfolio"`).
- `String` : du texte.
- `@unique` : aucune autre ligne ne peut avoir le même slug. Si tu essaies, la base dit non.

### `titre String` et `description String`

Du texte, sans contrainte particulière.

### `technologies ProjetTechnologie[]`

Ce n'est pas une colonne simple. C'est une **relation** : un projet peut avoir plusieurs technologies, et une technologie peut appartenir à plusieurs projets.

On utilise une table de liaison explicite `projets_technologies`, exactement comme dans le cours PostgreSQL.

### `createdAt DateTime @default(now())`

- `DateTime` : une date avec heure.
- `@default(now())` : si tu ne précises pas, la base met l'heure actuelle. Pratique pour savoir quand le projet a été créé.

### `updatedAt DateTime @updatedAt`

Cette ligne est **magique**. La directive `@updatedAt` dit à Prisma : "à chaque fois qu'on modifie cette ligne, mets à jour ce champ avec l'heure actuelle". Tu n'as **jamais à le faire toi-même**.

### `@@map("projets")`

Par défaut, Prisma nomme la table comme le model : `Projet`. Avec `@@map("projets")`, on dit "en base, la table s'appelle `projets` (en minuscules, au pluriel)". C'est une convention SQL : tables au pluriel, modèles au singulier.

Note la différence : `@map` (un seul `@`) renomme une **colonne**. `@@map` (deux `@@`) renomme la **table** entière.

## Les types Prisma à connaître

| Type Prisma | C'est quoi ? | Exemple |
|-------------|--------------|---------|
| `String`    | Du texte | `"Bonjour"` |
| `Int`       | Entier | `42` |
| `Float`     | Nombre à virgule | `3.14` |
| `Boolean`   | Vrai ou faux | `true` |
| `DateTime`  | Date avec heure | `2026-05-05T10:00:00Z` |
| `Json`      | Objet JSON (selon la base) | `{ "x": 1 }` |

Les directives utiles :

| Directive | Ce qu'elle fait |
|-----------|-----------------|
| `@id` | Marque la clé primaire |
| `@default(...)` | Valeur par défaut |
| `@unique` | Pas de doublon possible |
| `@updatedAt` | Mis à jour automatiquement à chaque modif |
| `@map("nom")` | Renomme la colonne en base |
| `@@map("nom")` | Renomme la table en base |
| `@@index([...])` | Crée un index pour accélérer les recherches (cours 8) |

## TypeScript vu dans ce cours

Rien encore — on n'a pas généré le client. Mais ce model `Projet` que tu viens d'écrire va, dans le prochain cours, **devenir un type TypeScript** automatiquement, sans rien écrire :

```ts
type Projet = {
  id: number;
  slug: string;
  titre: string;
  description: string;
  lien: string;
  estPublie: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

Magique.

## Application sur le projet

Dans `mon-backend/` :

1. `npm i -D prisma`
2. `npm i @prisma/client`
3. `npx prisma init --datasource-provider postgresql`
4. Mets `DATABASE_URL="postgresql://cours:secret@localhost:5433/portfolio"` dans `.env`.
5. Ouvre `prisma/schema.prisma` et ajoute les models ci-dessus.
6. Lance `npx prisma format` (Prisma reformate joliment ton schéma).

À la fin de ce cours, tu **n'as pas encore** modifié la base. C'est juste un plan sur le papier. On va le concrétiser au cours suivant avec les **migrations**.

## Résumé
- Prisma s'installe en deux paquets : `prisma` (CLI, dev) et `@prisma/client` (runtime).
- `npx prisma init` crée le `schema.prisma` et le `.env`.
- Un **model** = une table. Champs typés avec `String`, `Int`, `DateTime`, etc.
- Directives clés : `@id`, `@default`, `@unique`, `@updatedAt`, `@@map`.
- Le schéma seul ne crée pas la base. Pour ça, on a besoin des migrations.

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 01 — C'est quoi un ORM ?](./01_cest-quoi-un-orm.md)
- → Suivant : [Cours 03 — Les migrations](./03_migrations.md)
- Sommaire : [README](../README.md)
