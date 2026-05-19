# Cours 05 — Requêtes SQL de base

## Ce qu'on va voir

- Les **4 verbes** de base : `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Les **filtres** : `WHERE`, `LIKE`, `IN`, `IS NULL`, etc.
- Trier et limiter : `ORDER BY`, `LIMIT`, `OFFSET`
- Le **danger numéro un** : oublier `WHERE` dans un `UPDATE` ou `DELETE`

> **À avoir** : la table `projets` du cours 04 dans la base `portfolio`. Si tu l'as supprimée, recrée-la.

---

## SELECT — Lire des données

`SELECT` veut dire "sélectionne". On l'utilise pour **lire** la base. C'est la commande que tu vas écrire 100 fois plus que les autres.

### Tout récupérer

```sql
SELECT * FROM projets;
```

L'**étoile** `*` veut dire "toutes les colonnes". Pratique pour tester, **à éviter en code de production** (on revient là-dessus).

### Choisir des colonnes précises

```sql
SELECT titre, est_publie
FROM projets;
```

Tu reçois seulement ces colonnes. Plus rapide, plus clair, et ton code dépend moins de la structure exacte.

### Renommer en sortie : `AS`

```sql
SELECT titre AS nom_projet, created_at AS date_creation
FROM projets;
```

Pratique pour l'affichage ou pour matcher le format attendu côté code.

---

## INSERT — Ajouter des données

```sql
INSERT INTO projets (titre, description, est_publie)
VALUES ('Mon portfolio', 'Site Next.js + NestJS', TRUE);
```

Décortiqué :

- `INSERT INTO projets (...)` : "ajoute dans `projets`, dans ces colonnes-là".
- `VALUES (...)` : "...avec ces valeurs-là, dans le même ordre".

Postgres remplit automatiquement :
- `id` (grâce à `IDENTITY`)
- `created_at`, `updated_at` (grâce à `DEFAULT NOW()`)

### Insérer plusieurs lignes d'un coup

```sql
INSERT INTO projets (titre, est_publie) VALUES
    ('Mon CV',           FALSE),
    ('Appli météo',      TRUE),
    ('Tableau de bord',  TRUE);
```

Une seule requête, trois lignes. C'est plus rapide qu'envoyer trois INSERT séparés.

### Récupérer ce qui a été inséré : `RETURNING`

Spécialité Postgres : tu peux demander la ligne créée en retour.

```sql
INSERT INTO projets (titre)
VALUES ('Nouveau projet')
RETURNING id, created_at;
```

Très pratique pour récupérer l'`id` que Postgres vient d'attribuer.

---

## WHERE — Filtrer

`WHERE` veut dire "là où...". Sans lui, ta requête s'applique à **tout**.

```sql
SELECT *
FROM projets
WHERE est_publie = TRUE;
```

### Opérateurs de comparaison

| Opérateur | Sens | Exemple |
|---|---|---|
| `=` | égal | `WHERE titre = 'Mon CV'` |
| `<>` ou `!=` | différent | `WHERE est_publie <> TRUE` |
| `<`, `<=`, `>`, `>=` | inférieur, supérieur | `WHERE note >= 4` |
| `BETWEEN` | dans un intervalle | `WHERE note BETWEEN 1 AND 5` |
| `IN` | dans une liste | `WHERE id IN (1, 2, 5)` |
| `LIKE` | match texte (sensible à la casse) | `WHERE titre LIKE 'Mon%'` |
| `ILIKE` | match texte (insensible à la casse) | `WHERE titre ILIKE 'mon%'` |
| `IS NULL` / `IS NOT NULL` | est vide / non vide | `WHERE description IS NULL` |

> **`NULL` ne se compare pas avec `=`**. `WHERE x = NULL` ne marche pas. C'est `WHERE x IS NULL`. Toujours.

### Les jokers `%` et `_` avec LIKE

- `%` : "n'importe quoi, n'importe quelle longueur".
- `_` : "exactement un caractère".

```sql
-- Titres qui commencent par "Mon"
WHERE titre LIKE 'Mon%'

-- Titres qui contiennent "site" (n'importe où)
WHERE titre ILIKE '%site%'

-- Titres de 5 lettres
WHERE titre LIKE '_____'
```

`ILIKE` (avec un I majuscule) ignore la casse : `Mon`, `mon`, `MON` matchent tous. Spécialité Postgres, très utile.

### Combiner avec AND / OR

```sql
SELECT *
FROM projets
WHERE est_publie = TRUE
  AND note >= 4;

SELECT *
FROM projets
WHERE titre ILIKE '%site%'
   OR titre ILIKE '%appli%';
```

Avec parenthèses pour la priorité :

```sql
WHERE (est_publie = TRUE AND note >= 4)
   OR titre = 'Star';
```

---

## ORDER BY — Trier

```sql
SELECT titre, note
FROM projets
ORDER BY note DESC;
```

- `ASC` (par défaut) : croissant.
- `DESC` : décroissant.

Plusieurs critères :

```sql
ORDER BY est_publie DESC, created_at DESC
```

Lecture : trie par `est_publie` (publiés en premier), puis pour ceux à égalité, par date de création (récents en premier).

---

## LIMIT et OFFSET — Pagination

```sql
SELECT *
FROM projets
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;
```

- `LIMIT 10` : "donne-moi 10 lignes max".
- `OFFSET 20` : "saute les 20 premières".

Ici : la **3e page** d'une liste paginée par 10. Tu utilises ça partout (listes infinies, "page suivante", etc.).

> Toujours associer `LIMIT` à un `ORDER BY`. Sinon Postgres te donne 10 lignes "au hasard".

---

## UPDATE — Modifier des données

```sql
UPDATE projets
SET    est_publie = TRUE,
       updated_at = NOW()
WHERE  id = 3;
```

Lecture : "Dans `projets`, mets `est_publie` à `TRUE` et `updated_at` à maintenant, **mais seulement** pour la ligne dont `id = 3`."

### LE DANGER

```sql
-- CATASTROPHE absolue
UPDATE projets SET est_publie = FALSE;
```

**Sans `WHERE`, Postgres applique la modification à TOUTES les lignes**. Tous tes projets dépubliés. Tu pleures.

> **Règle d'or de la team** : avant chaque `UPDATE` ou `DELETE`, **vérifie ton `WHERE`**. Idéalement, tu fais d'abord un `SELECT` avec le même `WHERE` pour voir ce que tu vas toucher :
> ```sql
> SELECT * FROM projets WHERE id = 3;
> -- OK c'est bien la bonne ligne
> UPDATE projets SET est_publie = TRUE WHERE id = 3;
> ```

Analogie : un `UPDATE` sans `WHERE`, c'est comme dire au bibliothécaire : "Tamponne **toutes les fiches** comme ‘publié = NON'". Il le fait sans broncher. C'est ton boulot de préciser **lesquelles**.

---

## DELETE — Supprimer des lignes

```sql
DELETE FROM projets
WHERE  id = 3;
```

Même danger que `UPDATE` :

```sql
-- CATASTROPHE
DELETE FROM projets;
```

**Tous tes projets disparaissent**. Pas de poubelle, pas de "Ctrl+Z".

> **Toujours** un `WHERE` sur un `DELETE`. Toujours. Si tu veux vraiment vider une table, on a `TRUNCATE TABLE projets;` qui est explicite (et plus rapide).

---

## Récap visuel des 4 verbes

```
+------------+--------------------------------------+
|   Verbe    |              Ce qu'il fait           |
+------------+--------------------------------------+
|  SELECT    |  Lit, ne change rien                 |
|  INSERT    |  Crée de nouvelles lignes            |
|  UPDATE    |  Modifie des lignes existantes       |
|  DELETE    |  Supprime des lignes                 |
+------------+--------------------------------------+
```

`UPDATE` et `DELETE` réclament toujours un `WHERE` (ou tu casses tout).

---

## Petit tour des commodités utiles

### Compter

```sql
SELECT COUNT(*) FROM projets;
SELECT COUNT(*) FROM projets WHERE est_publie = TRUE;
```

### Distincts (sans doublon)

```sql
SELECT DISTINCT est_publie FROM projets;
```

### Concaténer du texte

```sql
SELECT titre || ' (par défaut)' AS affichage FROM projets;
```

`||` colle deux textes (en SQL standard ; en Postgres, `CONCAT(...)` marche aussi).

---

## Application sur le projet

Dans ta base `portfolio`, joue ces commandes pour t'entraîner :

```sql
-- Insère 3 projets
INSERT INTO projets (titre, description, est_publie) VALUES
    ('Portfolio',     'Site personnel Next.js',  TRUE),
    ('Backend cours', 'API NestJS + Prisma',     TRUE),
    ('Brouillon',     'Idée à creuser',          FALSE);

-- Lis-les
SELECT id, titre, est_publie FROM projets;

-- Filtre
SELECT titre FROM projets WHERE est_publie = TRUE;

-- Modifie (avec WHERE !)
UPDATE projets SET est_publie = TRUE WHERE titre = 'Brouillon';

-- Supprime (avec WHERE !)
DELETE FROM projets WHERE titre = 'Brouillon';

-- Vérifie
SELECT * FROM projets;
```

> Plus tard, Prisma écrit ces requêtes pour toi. Mais comprendre ce qui se passe en dessous est ce qui te démarque dans une équipe.

---

## Résumé

- `SELECT col FROM table WHERE ... ORDER BY ... LIMIT ...` pour lire.
- `INSERT INTO table (cols) VALUES (...)` pour ajouter.
- `UPDATE table SET col = val WHERE ...` pour modifier.
- `DELETE FROM table WHERE ...` pour supprimer.
- Filtres : `=`, `<>`, `<`, `>`, `BETWEEN`, `IN`, `LIKE`, `ILIKE`, `IS NULL`.
- **`NULL`** : on compare avec `IS NULL`, pas avec `=`.
- **Toujours un `WHERE`** sur `UPDATE` et `DELETE`. Toujours.
- Astuce : un `SELECT` avec le même `WHERE` avant, pour vérifier ce que tu vas toucher.

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 04 — Tables, colonnes, types](./04_tables-colonnes-types.md)
- → Suivant : [Cours 06 — Jointures et relations](./06_jointures-et-relations.md)
- Sommaire : [README](../README.md)
