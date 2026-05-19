# Cours 01 — C'est quoi un ORM ?

## Ce qu'on va voir
On va comprendre ce qu'est une base de données (très vite), ce qu'est un ORM, et pourquoi on va utiliser Prisma pour parler à la base depuis notre code TypeScript.

## D'abord, c'est quoi une base de données ?

Imagine un **gros classeur magique**.

- Il a plusieurs **tiroirs** (qu'on appelle des **tables**).
- Chaque tiroir contient des **fiches** (qu'on appelle des **lignes** ou des **records**).
- Chaque fiche a toujours les mêmes **cases à remplir** (qu'on appelle des **colonnes**).

Par exemple, un tiroir "Projets" :

| id | titre        | description     |
|----|--------------|-----------------|
| 1  | Mon site     | Un portfolio    |
| 2  | Mon blog     | Un blog perso   |

Une base de données, c'est ça : un endroit où **on range des données pour les retrouver plus tard**, même quand le serveur s'éteint.

Tu viens de voir PostgreSQL dans le bloc précédent. Pour l'instant, retiens surtout : **base de données = classeur organisé qui survit au redémarrage**.

## Le problème : la base parle "SQL", pas "TypeScript"

Pour parler à une base de données, il existe un langage spécial qui s'appelle le **SQL** (prononce "sé-quel" ou "S-Q-L").

Un exemple de SQL pour récupérer tous les projets :

```sql
SELECT * FROM projets WHERE titre = 'Mon site';
```

C'est efficace, mais :

- C'est un langage **différent** de TypeScript. Il faut l'apprendre.
- Si tu fais une faute de frappe (`titrr` au lieu de `titre`), TypeScript ne te prévient pas. Ça plante seulement quand le code tourne.
- Tu dois **toi-même** transformer le résultat en objet TypeScript.
- C'est facile d'oublier des **guillemets** ou de laisser passer une **faille de sécurité** (l'injection SQL, on en reparlera).

Ce qu'on aimerait, c'est écrire :

```ts
const projets = await db.projet.findMany({ where: { titre: "Mon site" } });
```

Du **TypeScript pur**, avec autocomplétion, vérification des types, et zéro SQL à écrire.

## La solution : un ORM

**ORM** veut dire **Object-Relational Mapping**. Trois mots compliqués pour une idée simple : c'est un **traducteur** entre :

- **ton code** (objets TypeScript)
- **la base** (lignes SQL)

L'analogie : imagine que tu veux commander un café à Tokyo, mais tu ne parles pas japonais. Un ORM, c'est ton **interprète**. Toi tu parles français (TypeScript), il traduit en japonais (SQL), reçoit la réponse en japonais, et te la rend en français.

Avantages :

- Tu écris du TypeScript, pas du SQL.
- L'ORM **vérifie** que tes requêtes ont du sens.
- L'ORM **sécurise** automatiquement contre les injections SQL.
- Le résultat est **déjà typé** comme un objet TypeScript.

## Pourquoi Prisma ?

Il existe plusieurs ORM en TypeScript : Sequelize, TypeORM, Drizzle, Prisma...

**Prisma** est devenu le préféré de beaucoup de devs parce que :

1. **Type-safe à fond.** Si ta colonne s'appelle `titre`, Prisma le sait, et `db.projet.findMany({ where: { tirre: ... }})` fait une **erreur TypeScript** avant même de lancer le code.
2. **Schéma déclaratif.** Tu décris ta base dans **un seul fichier** (`schema.prisma`) facile à lire. Pas besoin de fouiller du SQL partout.
3. **Migrations automatiques.** Tu changes ton schéma, Prisma génère **tout seul** le SQL pour mettre à jour la base.
4. **Client auto-généré.** Prisma lit ton schéma et fabrique un client TypeScript **sur mesure** pour ta base. L'autocomplétion est parfaite.
5. **Prisma Studio.** Une interface graphique pour voir tes données dans le navigateur, sans installer rien.

## À quoi ressemble du Prisma ?

Sans rentrer dans les détails (on verra ça aux prochains cours), voici un avant-goût.

Le schéma (le plan de la base) :

```prisma
model Projet {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  titre       String
  description String
  createdAt   DateTime @default(now())
}
```

Le code TypeScript pour utiliser la base :

```ts
// Récupérer tous les projets
const projets = await prisma.projet.findMany();

// Récupérer un seul projet par son slug
const projet = await prisma.projet.findUnique({
  where: { slug: "mon-portfolio" },
});

// Créer un projet
const nouveauProjet = await prisma.projet.create({
  data: {
    slug: "mon-blog",
    titre: "Mon blog",
    description: "Un blog perso",
  },
});
```

C'est lisible, c'est typé, et c'est court. Voilà la promesse de Prisma.

## Et pour notre projet ?

Tu te souviens de `mon-backend/` (le projet NestJS) ? Pour l'instant, les projets et les messages sont stockés dans **un tableau JavaScript en mémoire**.

Problème : dès que le serveur redémarre, **tout est perdu**.

Avec Prisma, on va :

1. Décrire un model `Projet` et un model `Message` dans `schema.prisma`.
2. Créer une vraie base de données.
3. Remplacer les tableaux par des appels à Prisma.
4. Les données vont **rester** entre deux redémarrages.

## On branche Prisma directement sur PostgreSQL

Comme tu as déjà installé PostgreSQL juste avant, on ne passe pas par SQLite dans ce parcours.

On va utiliser directement la base `portfolio` :

```env
DATABASE_URL="postgresql://cours:secret@localhost:5433/portfolio"
```

Ça rend le cours plus proche d'un vrai projet : tu apprends Prisma avec la même famille de base que celle qu'on déploiera plus tard.

## TypeScript vu dans ce cours

Rien de nouveau pour l'instant. Mais retiens cette idée : **Prisma génère lui-même les types TypeScript** à partir de ton schéma. Tu n'auras jamais à écrire `interface Projet { ... }` à la main. C'est une des forces énormes de Prisma.

## Application sur le projet

Pas de code à écrire dans ce cours. On installe au prochain. Mais avant de continuer, prends une minute pour aller dans `mon-backend/src/projets/projets.service.ts` et regarde le tableau `projets`. C'est ce tableau qu'on va remplacer par une vraie base.

## Résumé
- Une **base de données** = un classeur magique qui survit au redémarrage.
- **SQL** = le langage que parlent les bases. Puissant mais pénible.
- **ORM** = un traducteur entre ton code TypeScript et le SQL.
- **Prisma** = un ORM moderne, type-safe, avec un schéma déclaratif et un client auto-généré.
- On va utiliser **PostgreSQL directement**, puisque la base existe déjà dans le parcours.

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 08 PostgreSQL — Administration et prod](../03_postgresql/08_administration-et-postgres-en-prod.md)
- → Suivant : [Cours 02 — Installation et schéma](./02_installation-et-schema.md)
- Sommaire : [README](../README.md)
