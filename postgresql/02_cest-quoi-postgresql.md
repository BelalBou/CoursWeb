# Cours 02 — C'est quoi PostgreSQL ?

## Ce qu'on va voir

- D'où vient PostgreSQL (deux phrases d'histoire, promis)
- Pourquoi tout le monde l'aime : robustesse, types riches, extensibilité
- PostgreSQL vs MySQL vs SQLite : qui choisir et quand
- Les conventions de nommage en SQL (le fameux `snake_case`)

---

## Petit historique, vite fait

PostgreSQL a démarré en 1986 à l'université de Berkeley sous le nom **POSTGRES**. En 1996, on lui ajoute le langage SQL et on le rebaptise **PostgreSQL**. Depuis, une communauté open source l'améliore chaque année.

Aujourd'hui (version 16+), c'est le SGBD relationnel le plus respecté. Beaucoup de grosses boîtes (Apple, Instagram, Spotify...) tournent dessus.

À retenir :

- **Open source** (gratuit, code libre).
- **Mature** (plus de 30 ans).
- **Standard SQL** très bien respecté.

On dit "Postgres" en raccourci dans la vraie vie.

---

## Pourquoi Postgres ? Les 4 super-pouvoirs

### 1. Robustesse

Postgres est connu pour ne **pas perdre de données**. Quand il dit "c'est enregistré", c'est vraiment enregistré. Il respecte les **transactions ACID** (on en reparlera, c'est l'idée que soit tout marche, soit rien ne change).

Analogie : c'est le bibliothécaire pointilleux qui ne range jamais une fiche à moitié. Soit la fiche est bien rangée, soit elle ne rentre pas dans le classeur.

### 2. Types riches

Là où d'autres SGBD se contentent de "texte", "nombre", "date", Postgres connaît plein de types intéressants :

- **JSONB** : tu peux stocker du JSON et le requêter comme une table.
- **Arrays** : une colonne peut contenir une liste (`['nextjs', 'css']`).
- **TIMESTAMPTZ** : dates avec fuseau horaire géré proprement.
- **Géospatial** (extension PostGIS) : coordonnées GPS, calculs de distance.
- **UUID**, **inet** (adresses IP), **cidr**, **money**, intervalles...

C'est comme avoir un classeur où chaque feuille peut accueillir n'importe quel format : pas que des cases standard, mais aussi des photos, des cartes, des listes.

### 3. Extensibilité

Tu peux **ajouter des fonctionnalités** à Postgres avec des **extensions** :

- **PostGIS** pour le géospatial.
- **pg_trgm** pour la recherche floue ("approximative").
- **uuid-ossp** pour générer des UUID.

C'est le seul SGBD relationnel qui se laisse rallonger comme ça facilement.

### 4. Conformité au standard SQL

Postgres suit **scrupuleusement** la norme SQL. Ça veut dire que ce que tu apprends sur Postgres, tu pourras le réutiliser ailleurs. À l'inverse, MySQL prend parfois des libertés avec le standard.

---

## Postgres vs MySQL vs SQLite

Trois SGBD relationnels très utilisés. Tableau de comparaison rapide :

| Critère | **PostgreSQL** | **MySQL** | **SQLite** |
|---|---|---|---|
| Format | Serveur | Serveur | Fichier `.db` |
| Idéal pour | Apps moyennes/grosses | Apps web classiques | Apprentissage, mobile, prototypes |
| Conformité SQL | Excellente | Correcte | Bonne mais limitée |
| Types riches (JSON, arrays) | Oui, très bien | JSON oui, arrays non | JSON limité |
| Concurrence | Très bonne | Très bonne | Limitée (un seul écrivain à la fois) |
| Mise en prod | Idéal | Idéal | Pas adapté pour multi-utilisateurs |
| Configuration | Un peu plus poussée | Simple | Aucune |

### Quand choisir quoi ?

- **SQLite** : tu débutes, ton appli est mono-utilisateur, ou c'est juste pour bidouiller. On ne l'utilise pas dans notre fil rouge, parce qu'on veut apprendre directement une vraie base serveur.
- **MySQL** : si une équipe ou un hébergeur impose ça. Ça marche bien.
- **PostgreSQL** : par défaut pour tout projet sérieux. C'est notre choix.

> La bonne nouvelle : Prisma sait très bien parler à PostgreSQL. Quand on arrivera au cours Prisma, on le branchera directement sur la base `portfolio` que tu vas créer ici.

---

## Les conventions de nommage : `snake_case`

En SQL, par convention, on écrit tout en **`snake_case`** : minuscules, mots séparés par des **underscores** (`_`).

```sql
-- Bien
CREATE TABLE projets_tags (
    projet_id INTEGER,
    tag_id INTEGER,
    created_at TIMESTAMPTZ
);

-- Pas bien (mais ça marcherait techniquement)
CREATE TABLE ProjetsTags (
    ProjetId INTEGER,
    TagId INTEGER,
    CreatedAt TIMESTAMPTZ
);
```

Pourquoi ?

1. **SQL ne fait pas la différence entre `Toto` et `toto`** par défaut. Pour forcer une majuscule, il faut entourer de guillemets, et c'est lourd.
2. **C'est la convention universelle**. Quand tu rejoindras une équipe de 50 devs, ils écrivent tous comme ça.

Règles concrètes :

- Tables au **pluriel** : `projets`, `utilisateurs`, `tags`.
- Colonnes en `snake_case` : `created_at`, `prenom_complet`, `est_publie`.
- Clés primaires : `id` (court et simple).
- Clés étrangères : `<nom_table_singulier>_id` → `projet_id`, `utilisateur_id`.
- Tables de liaison : `<table_a>_<table_b>` → `projets_tags`.

Côté JavaScript/TypeScript, on garde `camelCase` (par exemple `createdAt`). Prisma fait le pont automatiquement entre les deux mondes.

---

## Mots-clés SQL : MAJUSCULES

Convention d'équipe : on écrit les **mots-clés SQL en majuscules** pour les distinguer du reste.

```sql
SELECT id, titre
FROM projets
WHERE est_publie = TRUE
ORDER BY created_at DESC
LIMIT 10;
```

Pas obligatoire pour Postgres (il s'en fiche), mais hyper lisible. C'est ce que tu verras dans tous les cours suivants.

---

## Application sur le projet

Pas encore d'action sur le projet à ce cours-ci : on continue de comprendre.

À retenir pour la suite :

- On va bientôt installer Postgres (cours 03).
- Notre base s'appellera `portfolio`.
- Nos tables seront en `snake_case` pluriel : `projets`, `tags`, `projets_tags`.
- Quand on branchera Prisma sur Postgres, Prisma respectera ces conventions.

---

## Résumé

- **PostgreSQL** est un SGBD relationnel **open source**, mature, robuste.
- Ses points forts : **robustesse**, **types riches** (JSON, arrays, géo), **extensibilité**, **conformité SQL**.
- Comparé à **SQLite** (simple fichier, prototype) et **MySQL** (concurrent direct), Postgres est le choix par défaut pour un projet sérieux.
- En SQL, on écrit les **identifiants en `snake_case`** et les **mots-clés en MAJUSCULES**.
- Tables au **pluriel** : `projets`, pas `projet`.

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 01 — C'est quoi une base de données](./01_cest-quoi-une-base-de-donnees.md)
- → Suivant : [Cours 03 — Installation locale](./03_installation-locale.md)
- Sommaire : [README](../README.md)
