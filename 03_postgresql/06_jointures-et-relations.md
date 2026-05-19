# Cours 06 — Jointures et relations

## Ce qu'on va voir

- Les **clés étrangères** (`FOREIGN KEY`) : comment lier deux tables
- Les **jointures** (`JOIN`) : comment lire ces tables ensemble
- Les types de jointure : `INNER`, `LEFT`, `RIGHT`, `FULL`
- Les **agrégations** : `GROUP BY`, `COUNT`, `SUM`, `AVG`
- `ON DELETE CASCADE` vs `RESTRICT` : que faire quand on supprime ?

---

## Le problème : pas tout dans une seule table

Imagine qu'on veuille mettre les **tags** d'un projet directement dans la table `projets` :

```
+----+-----------+-----------------------+
| id | titre     | tags                  |
+----+-----------+-----------------------+
|  1 | Portfolio | "nextjs, css, react"  |
|  2 | Backend   | "nestjs, prisma"      |
+----+-----------+-----------------------+
```

Problèmes :

1. **Renommer `nextjs` en `Next.js`** = passer en revue toutes les lignes.
2. **Lister tous les projets avec le tag `react`** = chercher dans une chaîne. Lent et fragile.
3. **Compter combien de projets utilisent `nextjs`** = idem, pénible.

La solution : **séparer en plusieurs tables** et les **relier**.

---

## Le modèle relationnel

On va créer trois tables :

```
projets                   tags                   projets_tags (table de liaison)
+----+-----------+        +----+--------+        +-----------+--------+
| id | titre     |        | id | nom    |        | projet_id | tag_id |
+----+-----------+        +----+--------+        +-----------+--------+
|  1 | Portfolio |        |  1 | nextjs |        |     1     |   1    |
|  2 | Backend   |        |  2 | css    |        |     1     |   2    |
+----+-----------+        |  3 | nestjs |        |     1     |   3    |
                          |  4 | react  |        |     2     |   3    |
                          +--------+----+        +-----------+--------+
```

C'est ce qu'on appelle une **relation many-to-many** : un projet a plusieurs tags, un tag peut être sur plusieurs projets.

---

## Les clés étrangères (`FOREIGN KEY`)

Une **clé étrangère** est une colonne qui pointe vers la clé primaire d'une autre table. C'est ce qui crée le lien.

### Syntaxe : `REFERENCES`

```sql
CREATE TABLE tags (
    id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom TEXT UNIQUE NOT NULL
);

CREATE TABLE projets_tags (
    projet_id INTEGER NOT NULL REFERENCES projets(id),
    tag_id    INTEGER NOT NULL REFERENCES tags(id),
    PRIMARY KEY (projet_id, tag_id)
);
```

Lecture :

- `REFERENCES projets(id)` : "cette colonne doit toujours correspondre à un `id` existant dans `projets`".
- `PRIMARY KEY (projet_id, tag_id)` : la clé primaire est la **combinaison** des deux. On ne peut pas avoir deux fois la même paire (le projet 1 ne peut pas avoir deux fois le tag `nextjs`).

> Une **clé primaire composite** (sur plusieurs colonnes) est typique des tables de liaison.

### Pourquoi c'est puissant

Postgres **refuse** maintenant :

- D'ajouter une ligne dans `projets_tags` avec un `projet_id` qui n'existe pas (pas de tag dans le vide).
- De supprimer un projet s'il a encore des tags liés (par défaut). On verra `CASCADE` plus loin.

C'est l'**intégrité référentielle**. Le bibliothécaire ne range jamais une fiche orpheline.

---

## Les jointures : lire ensemble

Une **jointure** dit à Postgres : "prends ces deux tables, accroche-les ensemble selon une règle".

### `INNER JOIN` (le défaut)

"Donne-moi les lignes qui matchent **dans les deux tables**."

```sql
SELECT p.titre, t.nom
FROM   projets p
JOIN   projets_tags pt ON pt.projet_id = p.id
JOIN   tags t          ON t.id = pt.tag_id;
```

Décortiqué :

- `projets p` : on appelle `projets` "p" (alias) pour faire court.
- `JOIN projets_tags pt ON pt.projet_id = p.id` : "joins avec `projets_tags`, là où le `projet_id` correspond à l'`id` du projet".
- `JOIN tags t ON t.id = pt.tag_id` : "puis joins avec `tags` selon le `tag_id`".

Résultat (avec nos données) :

```
 titre     | nom
-----------+--------
 Portfolio | nextjs
 Portfolio | css
 Portfolio | nestjs
 Backend   | nestjs
```

> `JOIN` tout court = `INNER JOIN`. Les autres types se précisent : `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`.

### Schéma visuel des 4 jointures

```
Table A           Table B
 +---+             +---+
 | 1 |             | 1 |
 | 2 |             | 2 |
 | 3 |             | 4 |
 +---+             +---+
```

| Jointure | Ce qu'on récupère | Avec nos données |
|---|---|---|
| `INNER JOIN` | Seulement les correspondances | 1, 2 |
| `LEFT JOIN`  | Tout A + correspondances de B | 1, 2, 3 (3 sans rien à droite) |
| `RIGHT JOIN` | Tout B + correspondances de A | 1, 2, 4 (4 sans rien à gauche) |
| `FULL JOIN`  | Tout A + tout B (avec `NULL` quand pas de match) | 1, 2, 3, 4 |

### `LEFT JOIN` : utile pour "tous les X, même sans Y"

Exemple : "tous les projets, **même ceux sans tag**".

```sql
SELECT p.titre, t.nom
FROM   projets p
LEFT JOIN projets_tags pt ON pt.projet_id = p.id
LEFT JOIN tags t          ON t.id = pt.tag_id;
```

Si "Backend" n'avait pas de tag, il apparaîtrait quand même, avec `NULL` dans `nom`.

> `LEFT JOIN` est de **loin** le plus utilisé après `INNER JOIN`. `RIGHT JOIN` et `FULL JOIN` sont rares.

---

## Agréger : `GROUP BY`, `COUNT`, `SUM`

Quand on veut **compter** ou **résumer**, on regroupe les lignes.

### Exemples

Combien de tags par projet ?

```sql
SELECT p.titre, COUNT(pt.tag_id) AS nb_tags
FROM   projets p
LEFT JOIN projets_tags pt ON pt.projet_id = p.id
GROUP BY p.titre
ORDER BY nb_tags DESC;
```

Lecture : "regroupe par titre de projet, et pour chaque groupe, compte les lignes". Résultat : un projet par ligne, avec son nombre de tags.

### Fonctions d'agrégation principales

| Fonction | Sens |
|---|---|
| `COUNT(*)` | nombre de lignes |
| `COUNT(col)` | nombre de lignes où `col` n'est pas `NULL` |
| `SUM(col)` | somme |
| `AVG(col)` | moyenne |
| `MIN(col)` / `MAX(col)` | minimum / maximum |

### `HAVING` : filtrer après agrégation

`WHERE` filtre les lignes brutes. `HAVING` filtre les groupes.

```sql
SELECT p.titre, COUNT(pt.tag_id) AS nb_tags
FROM   projets p
LEFT JOIN projets_tags pt ON pt.projet_id = p.id
GROUP BY p.titre
HAVING COUNT(pt.tag_id) >= 2;
```

"Donne-moi les projets qui ont au moins 2 tags."

---

## ON DELETE : que se passe-t-il quand on supprime ?

Imagine : tu supprimes un projet qui a des tags liés. Que doit faire Postgres ?

Plusieurs options à choisir au moment de créer la contrainte :

| Option | Comportement |
|---|---|
| `ON DELETE RESTRICT` | **Refuse** la suppression tant qu'il reste des liens (par défaut) |
| `ON DELETE CASCADE` | **Supprime aussi** les lignes liées (effet domino) |
| `ON DELETE SET NULL` | Met la clé étrangère à `NULL` |
| `ON DELETE SET DEFAULT` | Met la valeur par défaut |

### Exemple concret

```sql
CREATE TABLE projets_tags (
    projet_id INTEGER NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    tag_id    INTEGER NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
    PRIMARY KEY (projet_id, tag_id)
);
```

Avec ça, si tu supprimes un projet, ses lignes dans `projets_tags` disparaissent automatiquement. Les tags eux-mêmes restent (ils sont dans une autre table).

### Quand utiliser quoi ?

- **`CASCADE`** : pour les "données filles" qui n'ont aucun sens sans le parent (lignes d'une commande sans la commande, par ex.).
- **`RESTRICT`** : pour forcer le développeur à gérer la suppression à la main. Plus prudent.
- **`SET NULL`** : quand le lien est optionnel (ex. un projet a un client, mais on peut supprimer un client sans tuer ses projets).

> Choix par défaut prudent : `RESTRICT`. Et `CASCADE` quand le parent-enfant est évident.

---

## Application sur le projet

Crée la structure complète dans ta base `portfolio` :

```sql
-- On repart propre
DROP TABLE IF EXISTS projets_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS projets;

CREATE TABLE projets (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titre       TEXT NOT NULL,
    est_publie  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
    id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom TEXT UNIQUE NOT NULL
);

CREATE TABLE projets_tags (
    projet_id INTEGER NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    tag_id    INTEGER NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
    PRIMARY KEY (projet_id, tag_id)
);

-- Données d'exemple
INSERT INTO projets (titre, est_publie) VALUES
    ('Portfolio', TRUE),
    ('Backend',   TRUE);

INSERT INTO tags (nom) VALUES ('nextjs'), ('css'), ('nestjs'), ('react');

INSERT INTO projets_tags (projet_id, tag_id) VALUES
    (1, 1), (1, 2), (1, 4),
    (2, 3);
```

Puis joue :

```sql
-- Liste tous les projets avec leurs tags
SELECT p.titre, t.nom
FROM   projets p
LEFT JOIN projets_tags pt ON pt.projet_id = p.id
LEFT JOIN tags t          ON t.id = pt.tag_id
ORDER BY p.titre, t.nom;

-- Combien de tags par projet ?
SELECT p.titre, COUNT(pt.tag_id) AS nb_tags
FROM   projets p
LEFT JOIN projets_tags pt ON pt.projet_id = p.id
GROUP BY p.titre;

-- Tous les projets qui utilisent "nextjs"
SELECT p.titre
FROM   projets p
JOIN   projets_tags pt ON pt.projet_id = p.id
JOIN   tags t          ON t.id = pt.tag_id
WHERE  t.nom = 'nextjs';
```

---

## Résumé

- Une **clé étrangère** (`REFERENCES`) lie deux tables : impossible d'avoir une ligne fille sans parent.
- Les **jointures** lisent plusieurs tables ensemble :
  - `INNER JOIN` : les correspondances.
  - `LEFT JOIN` : tout à gauche, même sans correspondance.
  - `RIGHT JOIN`, `FULL JOIN` : plus rares.
- Les **agrégations** (`COUNT`, `SUM`, `AVG`) avec `GROUP BY` permettent de résumer.
- `HAVING` filtre **après** l'agrégation, `WHERE` **avant**.
- `ON DELETE CASCADE` propage la suppression. `RESTRICT` (défaut) la refuse tant qu'il y a des liens.
- Une **table de liaison** (`projets_tags`) sert pour les relations **many-to-many**.

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 05 — Requêtes SQL de base](./05_requetes-sql-de-base.md)
- → Suivant : [Cours 07 — Index et performance](./07_index-et-performance.md)
- Sommaire : [README](../README.md)
