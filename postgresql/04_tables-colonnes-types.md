# Cours 04 — Tables, colonnes, types

## Ce qu'on va voir

- Créer une table avec `CREATE TABLE`
- Les **types** principaux : nombres, textes, booléens, dates, JSON, arrays
- Les **contraintes** : `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`
- Modifier une table existante (`ALTER TABLE`)
- La supprimer (`DROP TABLE`)
- Bonnes pratiques : `created_at`, `updated_at`, identifiants modernes

> **Avant de commencer** : connecte-toi à ta base `portfolio` :
> ```bash
> docker exec -it postgres-cours psql -U cours -d portfolio
> ```

---

## Créer une table

L'analogie du cours 01 : créer une table = ajouter un nouvel **intercalaire** dans le classeur, en précisant le format des fiches.

```sql
CREATE TABLE projets (
    id          INTEGER PRIMARY KEY,
    titre       TEXT NOT NULL,
    description TEXT,
    est_publie  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Lecture :

- `CREATE TABLE projets` : crée une table appelée `projets`.
- Entre les parenthèses : la liste des colonnes, séparées par des virgules.
- Chaque colonne a un **nom** + un **type** + d'éventuelles **contraintes**.

Tape `\dt` dans `psql` : la table `projets` apparaît. Tape `\d projets` : tu vois sa structure.

---

## Les types principaux

Postgres a beaucoup de types, mais 90 % du temps tu utiliseras ceux-ci :

### Nombres entiers

| Type | Plage | Quand l'utiliser |
|---|---|---|
| `SMALLINT` | -32k à +32k | Petits compteurs |
| `INTEGER` (ou `INT`) | -2 milliards à +2 milliards | Cas par défaut |
| `BIGINT` | très gros | IDs Twitter-style, gros volumes |

### Nombres décimaux

| Type | Quand l'utiliser |
|---|---|
| `REAL`, `DOUBLE PRECISION` | Mesures scientifiques (avec arrondis flottants) |
| `NUMERIC(p, s)` | **Argent et calculs précis** (pas d'arrondi) |

> **Règle d'or** : pour de l'argent, utilise `NUMERIC(10, 2)` (10 chiffres au total dont 2 après la virgule). **Jamais** `REAL` ou `DOUBLE`. Sinon tu finis avec 19,9999999 € au lieu de 20,00 €.

### Texte

| Type | Quand l'utiliser |
|---|---|
| `TEXT` | **Par défaut** : texte de longueur libre |
| `VARCHAR(n)` | Si tu veux **forcer** une longueur max (ex. code postal `VARCHAR(5)`) |
| `CHAR(n)` | Texte de taille fixe. **Évite-le**. |

> Sur Postgres, `TEXT` et `VARCHAR` sont aussi rapides l'un que l'autre. Choisis `TEXT` sauf si tu as besoin d'une vraie limite.

### Booléen

```sql
est_publie BOOLEAN
```

Valeurs : `TRUE`, `FALSE`, ou `NULL` (inconnu).

### Dates et heures

| Type | Sens |
|---|---|
| `DATE` | Juste une date (2025-05-04) |
| `TIME` | Juste une heure (14:30) |
| `TIMESTAMP` | Date + heure, **sans fuseau** |
| `TIMESTAMPTZ` | Date + heure **avec fuseau horaire** |

> **Toujours `TIMESTAMPTZ`** par défaut. Sinon, à 23h en France ça devient à 23h heure de New York le lendemain. Désastre.

### Identifiant unique

```sql
id UUID
```

Une chaîne aléatoire genre `f3a0c2e1-4b8d-4f12-9c0a-12345abcde00`. Pratique pour des IDs non-devinables (sécurité, URLs publiques).

### JSON et listes : la spécialité de Postgres

```sql
metadata  JSONB,
tags      TEXT[]
```

- `JSONB` : un champ qui stocke du JSON, et que tu peux **requêter**. Ultra puissant.
- `TEXT[]` : un tableau de textes. `['nextjs', 'css', 'typescript']`.

C'est ça les "types riches" qu'on vantait au cours 02.

---

## Les contraintes

Les contraintes sont des **règles** que Postgres fait respecter à ta place. C'est lui qui sera pénible si tu te trompes, pas tes utilisateurs trois mois plus tard.

### `PRIMARY KEY` — Clé primaire

Identifie chaque ligne de manière unique. **Une seule par table.**

```sql
id INTEGER PRIMARY KEY
```

Implique :
- `NOT NULL` (jamais vide)
- `UNIQUE` (jamais en double)

### `NOT NULL` — Obligatoire

```sql
titre TEXT NOT NULL
```

Tu ne peux pas insérer une ligne sans titre. Postgres refusera.

### `UNIQUE` — Pas de doublon

```sql
email TEXT UNIQUE
```

Empêche d'avoir deux lignes avec le même email.

### `DEFAULT` — Valeur par défaut

```sql
est_publie BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
```

Si tu n'indiques rien à l'insertion, Postgres met cette valeur.

`NOW()` est une fonction qui renvoie la date/heure actuelle.

### `CHECK` — Règle métier

```sql
prix NUMERIC(10, 2) CHECK (prix >= 0)
```

Refuse une ligne où `prix` serait négatif. Pratique pour valider des contraintes simples.

### Combiner

Tu mélanges plusieurs contraintes sur une colonne :

```sql
note INTEGER NOT NULL DEFAULT 0 CHECK (note BETWEEN 0 AND 5)
```

---

## Auto-incrément moderne : `GENERATED AS IDENTITY`

Tu te dis : "je veux que `id` soit attribué automatiquement, 1, 2, 3, 4...". Deux écoles :

### L'ancienne : `SERIAL` (à éviter en projet sérieux)

```sql
id SERIAL PRIMARY KEY
```

Ça marche, mais c'est une vieille syntaxe propre à Postgres.

### La moderne, recommandée : `IDENTITY`

```sql
id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

C'est du SQL standard. C'est la version "team de 50 devs". À utiliser par défaut.

> Avec Prisma, tu écris `@id @default(autoincrement())` et Prisma génère du `IDENTITY` côté Postgres. Il bosse pour toi.

---

## Une vraie table propre, complète

Voilà à quoi devrait ressembler une table dans un projet sérieux :

```sql
CREATE TABLE projets (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titre       TEXT        NOT NULL,
    description TEXT,
    est_publie  BOOLEAN     NOT NULL DEFAULT FALSE,
    note        INTEGER     CHECK (note BETWEEN 0 AND 5),
    metadata    JSONB,
    tags        TEXT[],
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

À retenir : presque toutes les tables ont un `id`, un `created_at` et un `updated_at`. C'est une **convention universelle**.

---

## Modifier une table : `ALTER TABLE`

Tu as oublié une colonne ? Pas besoin de tout refaire.

### Ajouter une colonne

```sql
ALTER TABLE projets
ADD COLUMN url_demo TEXT;
```

### Supprimer une colonne

```sql
ALTER TABLE projets
DROP COLUMN url_demo;
```

### Renommer

```sql
ALTER TABLE projets
RENAME COLUMN titre TO nom;
```

### Changer un type

```sql
ALTER TABLE projets
ALTER COLUMN note TYPE SMALLINT;
```

### Ajouter une contrainte

```sql
ALTER TABLE projets
ADD CONSTRAINT note_valide CHECK (note BETWEEN 0 AND 5);
```

> **Important** : en prod, on ne fait **jamais** de `ALTER TABLE` à la main. On passe par des **migrations** (Prisma le fera pour toi). On en reparle dans le bloc Prisma.

---

## Supprimer une table : `DROP TABLE`

```sql
DROP TABLE projets;
```

Boum. La table et toutes ses données disparaissent.

Pour éviter une erreur si la table n'existe pas :

```sql
DROP TABLE IF EXISTS projets;
```

> **Manie-le avec respect**. C'est irréversible. Sur une vraie base, fais toujours un backup d'abord (cours 08).

---

## Application sur le projet

On reste théorique pour l'instant, mais teste ces commandes dans ta base `portfolio`.

Dans `psql`, tape :

```sql
CREATE TABLE projets (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titre       TEXT        NOT NULL,
    description TEXT,
    est_publie  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Vérifie :

```sql
\dt
\d projets
```

Tu devrais voir ta nouvelle table et sa structure.

> Dans le bloc Prisma, on laissera les migrations gérer cette structure. Là, c'est juste pour pratiquer le SQL et comprendre ce que Prisma générera ensuite.

---

## Résumé

- `CREATE TABLE nom (col1 TYPE, col2 TYPE, ...)` pour créer.
- Types courants : `INTEGER`, `BIGINT`, `TEXT`, `BOOLEAN`, `TIMESTAMPTZ`, `NUMERIC`, `JSONB`, `TYPE[]`.
- Toujours **`TIMESTAMPTZ`** pour les dates, **`NUMERIC`** pour l'argent.
- Contraintes : `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`.
- Auto-incrément moderne : `GENERATED ALWAYS AS IDENTITY`, pas `SERIAL`.
- Convention universelle : `id`, `created_at`, `updated_at` sur (presque) toutes les tables.
- `ALTER TABLE` modifie, `DROP TABLE` supprime (irréversible).

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 03 — Installation locale](./03_installation-locale.md)
- → Suivant : [Cours 05 — Requêtes SQL de base](./05_requetes-sql-de-base.md)
- Sommaire : [README](../README.md)
