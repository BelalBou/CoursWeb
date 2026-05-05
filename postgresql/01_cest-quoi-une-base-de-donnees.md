# Cours 01 — C'est quoi une base de données ?

## Ce qu'on va voir

- C'est quoi une base de données, vraiment, expliqué simplement
- Pourquoi on en a besoin (et pourquoi un fichier JSON ne suffit pas longtemps)
- La différence entre **base** et **SGBD** (deux mots qu'on confond toujours)
- Le **SQL** : la langue qu'on parle au SGBD
- Un mot rapide sur **NoSQL**

---

## L'analogie du classeur géant

Imagine un énorme classeur dans un bureau.

- Le **classeur** = la base de données.
- Chaque **intercalaire** dans le classeur = une **table** (par exemple : "Projets", "Utilisateurs", "Tags").
- Chaque **feuille** dans un intercalaire = une **ligne** (un projet précis, un utilisateur précis).
- Chaque **case** sur une feuille = une **colonne** (le nom du projet, sa date, son auteur...).

```
Classeur "portfolio"   ← la base de données
│
├── Intercalaire "projets"     ← une table
│     ├── Feuille 1 : { id: 1, titre: "Mon site", date: 2025-01-10 }
│     ├── Feuille 2 : { id: 2, titre: "Appli météo", date: 2025-03-04 }
│     └── ...
│
├── Intercalaire "utilisateurs"   ← une autre table
│     └── ...
│
└── Intercalaire "tags"
      └── ...
```

C'est tout. Une base de données, c'est un endroit organisé où on range des données pour pouvoir les retrouver vite.

---

## Pourquoi pas juste un fichier JSON ?

Au début d'un projet, on est tenté de mettre les données dans un tableau JavaScript ou un fichier `data.json`. Ça marche... cinq minutes.

```ts
// Dans un service NestJS, par exemple
const projets = [
  { id: 1, titre: "Mon site" },
  { id: 2, titre: "Appli météo" },
];
```

Problèmes très vite :

1. **Si le serveur redémarre, tout est effacé.** Le tableau vit dans la mémoire RAM. On parle de stockage **volatile** : ça s'évapore quand on coupe le courant.
2. **Plusieurs personnes en même temps = chaos.** Si deux requêtes ajoutent un projet en même temps, on perd des données ou on a des doublons.
3. **Chercher devient lent.** Avec 10 fiches, ça va. Avec 100 000, parcourir un tableau ligne par ligne pour trouver un projet, ça prend des secondes.
4. **Pas de garantie d'intégrité.** Rien n'empêche d'avoir deux fois le même `id`, ou un projet sans titre, ou une date "patate".

Une **vraie base de données**, elle :

- **Persiste sur le disque** (donc tu peux éteindre, ça reste).
- **Gère plusieurs accès en même temps** sans tout casser.
- **Cherche très vite** grâce aux **index** (on en parle au cours 07).
- **Force des règles** : "ce champ ne peut pas être vide", "cet identifiant doit être unique"...

---

## Base vs SGBD : ne pas confondre

C'est le piège classique, alors retenons-le bien.

- La **base de données**, c'est le contenu : les tables, les lignes, les colonnes. Le **classeur** dans notre analogie.
- Le **SGBD** (Système de Gestion de Base de Données), c'est le **logiciel** qui s'occupe du classeur. C'est lui qui ouvre, lit, écrit, range, protège, optimise. C'est le **bibliothécaire**.

| Mot | Ce que c'est | Exemple concret |
|-----|--------------|-----------------|
| Base de données | Le contenu (les données) | Le classeur "portfolio" |
| SGBD | Le logiciel qui gère le contenu | **PostgreSQL**, MySQL, SQLite |
| Serveur de base | La machine où tourne le SGBD | Ton ordi, ou un serveur en ligne |

Quand on dit "j'utilise PostgreSQL", on parle du SGBD.
Quand on dit "ma base s'appelle `portfolio`", on parle du contenu géré par ce SGBD.

---

## Relationnel : pourquoi ce mot ?

PostgreSQL est une **base relationnelle**. Ça veut dire que les tables peuvent **se parler entre elles**.

Exemple : un projet a des tags.

```
Table projets                Table tags
+----+----------+           +----+----------+
| id | titre    |           | id | nom      |
+----+----------+           +----+----------+
|  1 | Mon site |           |  1 | nextjs   |
|  2 | Météo    |           |  2 | css      |
+----+----------+           +----+----------+

Table de liaison projets_tags
+------------+--------+
| projet_id  | tag_id |
+------------+--------+
|     1      |   1    |   ← "Mon site" a le tag "nextjs"
|     1      |   2    |   ← "Mon site" a aussi le tag "css"
|     2      |   1    |   ← "Météo" a le tag "nextjs"
+------------+--------+
```

Au lieu de copier-coller le mot "nextjs" partout, on le range **une fois** dans la table `tags` et on dit juste : "le projet 1 utilise le tag 1". C'est plus propre, plus court, et si on renomme un tag, on le change à un seul endroit.

On verra tout ça au **cours 06** sur les jointures.

---

## SQL : la langue du SGBD

Pour parler au SGBD (le bibliothécaire), on utilise une langue. Cette langue s'appelle **SQL** (Structured Query Language, "langage de requêtes structurées").

Exemples de phrases en SQL :

```sql
-- "Donne-moi tous les projets"
SELECT * FROM projets;

-- "Donne-moi le titre des projets postérieurs à 2025"
SELECT titre FROM projets WHERE date > '2025-01-01';

-- "Ajoute un nouveau projet"
INSERT INTO projets (titre, date) VALUES ('Mon CV', '2025-05-04');
```

C'est presque de l'anglais. On le verra en détail au cours 05.

Bonne nouvelle : **SQL est presque le même partout**. PostgreSQL, MySQL, SQLite, Oracle... ils parlent tous SQL avec quelques accents différents. Ce qu'on apprend ici sert partout.

---

## Et NoSQL alors ?

Tu vas entendre parler de **NoSQL** (MongoDB, Redis, etc.). C'est une autre famille de bases, qui ne range pas les données en tables avec des colonnes fixes.

- **SQL (relationnel)** : tables, lignes, colonnes, règles strictes. Notre cours.
- **NoSQL** : documents libres (un peu comme du JSON), ou clé-valeur, ou graphes...

Pour 95 % des projets web (et tous les tiens pour l'instant), une base **relationnelle** comme PostgreSQL est le bon choix. NoSQL, on en reparlera plus tard si besoin.

---

## Application sur le projet

Pour l'instant, ton projet `mon-backend` utilise **Prisma avec SQLite**. SQLite, c'est déjà une base relationnelle, mais minuscule (un simple fichier `.db`). C'est parfait pour apprendre, pas pour la production.

Dans les prochains cours :

1. On installe **PostgreSQL** (cours 03).
2. On apprend SQL "à la main" pour bien comprendre ce que Prisma fait pour toi (cours 04 à 07).
3. Au **cours 08**, on bascule Prisma de SQLite à PostgreSQL : ton backend tournera sur une vraie base.

---

## Résumé

- Une **base de données** = un classeur géant, organisé en tables.
- Une table = un intercalaire ; une ligne = une feuille ; une colonne = un champ.
- Le **SGBD** est le logiciel qui gère la base (PostgreSQL en est un).
- Mettre les données en RAM ou dans un JSON ne tient pas la route : il faut **persistance**, **concurrence**, **vitesse**, **intégrité**.
- **SQL** est la langue qu'on parle au SGBD. Presque la même pour tous les SGBD.
- **PostgreSQL** est une base **relationnelle** : les tables se parlent entre elles.
- **NoSQL** existe, mais on reste en SQL pour ce cours.

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 08 — Bonnes pratiques Prisma](../prisma/08_bonnes-pratiques.md)
- → Suivant : [Cours 02 — C'est quoi PostgreSQL](./02_cest-quoi-postgresql.md)
- Sommaire : [README](../README.md)
