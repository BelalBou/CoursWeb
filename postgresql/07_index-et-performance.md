# Cours 07 — Index et performance

## Ce qu'on va voir

- Pourquoi un **index** rend les requêtes 1000 fois plus rapides
- Comment en créer un (`CREATE INDEX`)
- Quand indexer (et quand **ne pas** indexer)
- Lire un plan d'exécution avec `EXPLAIN ANALYZE`
- Les types d'index Postgres : **B-tree**, **GIN**, **HASH**

---

## L'analogie du livre

Tu cherches le mot "PostgreSQL" dans un livre de 800 pages. Deux options :

1. **Sans index** : tu feuilletes le livre page par page. Tu mets une heure.
2. **Avec l'index à la fin** : tu cherches "PostgreSQL", il y a écrit "page 137", tu sautes directement. 5 secondes.

Un **index** sur une table fait exactement la même chose pour Postgres. Sans index, il lit toute la table ligne par ligne (`Seq Scan` = "Sequential Scan"). Avec un index, il saute directement aux bonnes lignes (`Index Scan`).

Le coût : créer un index prend de la place sur disque, et il faut le tenir à jour à chaque écriture. C'est un **compromis**.

---

## Créer un index

```sql
CREATE INDEX idx_projets_titre
ON projets(titre);
```

C'est tout. Postgres construit l'index immédiatement. Désormais, toute requête de la forme :

```sql
SELECT * FROM projets WHERE titre = 'Portfolio';
SELECT * FROM projets WHERE titre LIKE 'Port%';
```

...sera **drastiquement plus rapide** sur de gros volumes.

### Convention de nommage

Standard : `idx_<table>_<colonnes>`. Pratique pour t'y retrouver.

```sql
CREATE INDEX idx_projets_created_at      ON projets(created_at);
CREATE INDEX idx_projets_titre_publie    ON projets(titre, est_publie);
```

### Index sur plusieurs colonnes

```sql
CREATE INDEX idx_projets_titre_publie
ON projets(titre, est_publie);
```

Cet index aide :

- les requêtes filtrant sur `titre` seul ;
- les requêtes filtrant sur `titre` **ET** `est_publie`.

Mais **pas** les requêtes filtrant uniquement sur `est_publie`. L'ordre des colonnes compte. C'est comme un annuaire trié par "Nom puis Prénom" : pratique pour chercher "Bou…" puis "Belal", mais pas pour chercher tous les "Belal" toutes familles confondues.

### Index unique

```sql
CREATE UNIQUE INDEX idx_users_email
ON users(email);
```

C'est à la fois un index (rapide) et une contrainte (pas de doublons). On l'utilise pour les emails, slugs, etc.

> Note : `UNIQUE` dans `CREATE TABLE` crée déjà un index unique en coulisse.

### Supprimer un index

```sql
DROP INDEX idx_projets_titre;
```

---

## Quand indexer

Indexe les colonnes que tu **filtres**, **joins** ou **tries** souvent.

### À indexer

- Les colonnes utilisées dans `WHERE` souvent.
- Les **clés étrangères** (Postgres ne les indexe **pas** automatiquement, contrairement aux clés primaires !).
- Les colonnes utilisées dans `ORDER BY` quand le volume grandit.
- Les colonnes utilisées dans `JOIN ... ON`.

### À ne pas indexer (ou prudemment)

- Les tables très **petites** (moins de quelques milliers de lignes : Postgres lit tout en un clin d'œil).
- Les colonnes **rarement filtrées**.
- Les tables qui font beaucoup d'**écritures** (chaque INSERT/UPDATE met à jour les index → ralentissement).
- Les colonnes très peu sélectives (un booléen `est_actif` quand 99 % sont à `TRUE` : l'index ne sert à rien).

### Le piège

Plus on a d'index, plus les **écritures sont lentes**. Un index ne se met pas à jour gratuitement. Sur une table avec 10 index, chaque INSERT met à jour 10 index. Sur des tables très "write-heavy", on indexe avec parcimonie.

> Règle : commence sans index, mesure ce qui est lent, indexe ce qui le mérite. **Pas l'inverse.**

---

## EXPLAIN ANALYZE : voir ce que fait Postgres

Postgres a un super pouvoir : il te montre **comment** il exécute ta requête, et **combien de temps** chaque étape prend.

```sql
EXPLAIN ANALYZE
SELECT * FROM projets WHERE titre = 'Portfolio';
```

Sortie (simplifiée) :

```
Seq Scan on projets  (cost=0.00..18.50 rows=1 width=64) (actual time=0.020..0.030 rows=1 loops=1)
  Filter: (titre = 'Portfolio')
  Rows Removed by Filter: 4
Planning Time: 0.100 ms
Execution Time: 0.045 ms
```

Décodage :

- **`Seq Scan`** : "Sequential Scan" = lecture ligne par ligne. **Mauvais** sur de grosses tables.
- **`Index Scan`** : Postgres a utilisé un index. **Bon**.
- **`Index Only Scan`** : encore mieux, il n'a même pas eu à lire la table.
- **`actual time=…`** : le vrai temps mesuré.

Après création d'un index :

```sql
CREATE INDEX idx_projets_titre ON projets(titre);
EXPLAIN ANALYZE SELECT * FROM projets WHERE titre = 'Portfolio';
```

Tu devrais voir `Index Scan using idx_projets_titre`. Sur une grosse table, le `Execution Time` chute énormément.

> **À retenir** : `EXPLAIN ANALYZE` est ton meilleur ami quand une requête traîne. C'est lui qui te dit pourquoi.

---

## Types d'index Postgres

Postgres ne propose pas qu'un seul type. C'est une de ses grandes forces.

### B-tree (par défaut)

Le standard. Pour les comparaisons `=`, `<`, `>`, `BETWEEN`, et le tri. **99 % des cas.**

```sql
CREATE INDEX idx_projets_created_at ON projets(created_at);
```

### GIN — pour `JSONB`, arrays, recherche plein texte

Quand tu stockes du JSON ou des listes, B-tree ne sert à rien. Il faut **GIN** (Generalized Inverted iNdex).

```sql
CREATE INDEX idx_projets_metadata
ON projets USING GIN (metadata);

CREATE INDEX idx_projets_tags
ON projets USING GIN (tags);
```

Tu peux maintenant requêter rapidement :

```sql
SELECT * FROM projets WHERE metadata @> '{"type": "web"}';
SELECT * FROM projets WHERE 'react' = ANY(tags);
```

### Hash, BRIN, GiST

Plus rares. À garder en tête sans creuser maintenant :

- **Hash** : juste pour `=` (et même là, B-tree fait déjà le job).
- **BRIN** : pour de **très** gros volumes triés naturellement (logs par date).
- **GiST** : pour le géospatial, les ranges.

---

## Mesurer plutôt que deviner

Trois mots à graver :

> **Don't guess. Measure.** ("Ne devine pas. Mesure.")

Beaucoup de devs ajoutent des index "au cas où". Résultat : base lente en écriture, place gaspillée. La bonne méthode :

1. Écris la requête simplement.
2. Exécute `EXPLAIN ANALYZE`.
3. Si c'est rapide : tu n'as rien à faire.
4. Si c'est lent : regarde le plan, identifie le `Seq Scan` coûteux, ajoute l'index ciblé, vérifie avec `EXPLAIN ANALYZE` à nouveau.

---

## Application sur le projet

Sur ta base `portfolio`, teste l'effet d'un index. Insère un peu de données :

```sql
-- Génère 100 000 projets factices (Postgres adore ce genre d'exercice)
INSERT INTO projets (titre, est_publie)
SELECT 'Projet ' || i, (i % 2 = 0)
FROM   generate_series(1, 100000) AS i;
```

Sans index :

```sql
EXPLAIN ANALYZE
SELECT * FROM projets WHERE titre = 'Projet 87654';
```

Tu vois `Seq Scan`, et un temps en millisecondes.

Avec index :

```sql
CREATE INDEX idx_projets_titre ON projets(titre);

EXPLAIN ANALYZE
SELECT * FROM projets WHERE titre = 'Projet 87654';
```

Tu vois `Index Scan using idx_projets_titre`, et un temps en **microsecondes**. Souvent un facteur 100 ou 1000.

> Prisma crée automatiquement les index sur les clés primaires. Pour les **clés étrangères** et les colonnes filtrées, c'est à toi de les ajouter dans `schema.prisma` avec `@@index([col])` ou `@unique`. On le verra dans le bloc Prisma.

---

## Résumé

- Un **index** = "table des matières" qui accélère la lecture.
- `CREATE INDEX nom ON table(col)` pour le créer ; `DROP INDEX nom` pour le supprimer.
- Indexe les colonnes dans `WHERE`, `JOIN`, `ORDER BY`, surtout les **clés étrangères**.
- N'indexe pas tout : chaque index ralentit les écritures.
- **`EXPLAIN ANALYZE`** te dit ce que Postgres fait vraiment.
- **B-tree** par défaut ; **GIN** pour `JSONB` et arrays.
- **Don't guess. Measure.**

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 06 — Jointures et relations](./06_jointures-et-relations.md)
- → Suivant : [Cours 08 — Administration et Postgres en prod](./08_administration-et-postgres-en-prod.md)
- Sommaire : [README](../README.md)
