# Cours 05 — Les relations

## Ce qu'on va voir
Comment relier des tables entre elles : un projet a plusieurs images, un projet utilise plusieurs technos, etc. On découvre `@relation`, `include`, `select`, et les types de relations (one-to-many, many-to-many, one-to-one).

## L'idée des relations

Jusqu'ici, on a une seule table : `Projet`. Mais dans la vraie vie, tout est lié.

- Un **projet** a plusieurs **images**.
- Un **projet** utilise plusieurs **technos**, et une **techno** est utilisée par plusieurs projets.
- Un **utilisateur** a un seul **profil** (et inversement).
- Un **utilisateur** envoie plusieurs **messages**.

Une **relation**, c'est juste un **lien** entre deux tables. La base le garde en mémoire grâce à des **clés étrangères** (foreign keys) : un champ qui contient l'`id` d'une ligne dans une autre table.

## Une analogie simple

Pense à un **classeur d'école**.

- Tiroir "Élèves" : Léa (id 1), Tom (id 2), Sam (id 3).
- Tiroir "Devoirs" : "Maths du 5 mai" (élève 1), "Histoire du 6 mai" (élève 1), "Maths du 5 mai" (élève 2).

Chaque devoir a un champ "élève" qui contient l'**id de l'élève**. Quand tu veux les devoirs de Léa, tu cherches tous les devoirs où `élève = 1`.

C'est exactement comme ça que les bases relationnelles fonctionnent.

## One-to-many (un à plusieurs)

C'est le cas le plus courant. **Un projet a plusieurs images**, **une image appartient à un seul projet**.

Ajoutons ça dans `schema.prisma` :

```prisma
model Projet {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  titre       String
  description String
  technos     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  images      Image[]   // <-- la relation côté Projet

  @@map("projets")
}

model Image {
  id        Int      @id @default(autoincrement())
  url       String
  alt       String
  projetId  Int
  projet    Projet   @relation(fields: [projetId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@map("images")
}
```

Décortiquons.

### Côté `Projet`

```prisma
images Image[]
```

C'est un **champ virtuel**. En base, il n'y a pas vraiment de colonne `images` sur `projets`. C'est Prisma qui fait la magie : quand tu demandes `include: { images: true }`, il fait une seconde requête pour aller chercher les images.

Le type `Image[]` veut dire : "un projet peut avoir plusieurs Images".

### Côté `Image`

```prisma
projetId  Int
projet    Projet   @relation(fields: [projetId], references: [id], onDelete: Cascade)
```

Deux champs liés :

- **`projetId`** : la **vraie** colonne en base. Un entier qui contient l'`id` du projet associé. C'est la **clé étrangère** (foreign key).
- **`projet`** : un **champ virtuel** pour Prisma. Il dit : "le champ `projetId` pointe vers la colonne `id` de `Projet`".

`@relation(...)` est obligatoire :
- `fields: [projetId]` → quelle colonne de cette table sert de clé étrangère.
- `references: [id]` → vers quelle colonne de l'autre table elle pointe.
- `onDelete: Cascade` → si on supprime un projet, **toutes ses images sont supprimées automatiquement**. Sans `Cascade`, supprimer un projet qui a des images planterait.

Autres options pour `onDelete` :
- `SetNull` : la `projetId` devient `null` (utile pour les `?` nullable).
- `Restrict` : interdit la suppression du parent tant qu'il a des enfants.

## Many-to-many (plusieurs à plusieurs)

**Un projet utilise plusieurs technos**, et **une techno est utilisée par plusieurs projets**.

C'est différent du one-to-many parce qu'on ne peut pas mettre de simple foreign key. Une techno peut être liée à 50 projets ; un projet peut avoir 5 technos. Il faut une **table de liaison** au milieu.

Prisma sait gérer ça **tout seul** avec la syntaxe **implicite** :

```prisma
model Projet {
  id      Int      @id @default(autoincrement())
  slug    String   @unique
  titre   String
  // ... autres champs
  technos Techno[]   // <-- la relation
  images  Image[]

  @@map("projets")
}

model Techno {
  id      Int      @id @default(autoincrement())
  nom     String   @unique
  projets Projet[]   // <-- l'autre côté de la relation

  @@map("technos")
}
```

Note bien : pas de `@relation` à écrire. Pas de `projetId`, pas de `technoId`. **Prisma crée automatiquement** une table cachée `_ProjetToTechno` en base avec deux colonnes (`A`, `B`) qui sont les ids.

### Quand utiliser la version explicite ?

Si tu veux **stocker des infos sur la relation elle-même** (ex. "depuis quand le projet utilise cette techno", ou un ordre d'affichage), tu fais une vraie table de liaison :

```prisma
model ProjetTechno {
  projetId Int
  technoId Int
  ordre    Int

  projet Projet @relation(fields: [projetId], references: [id], onDelete: Cascade)
  techno Techno @relation(fields: [technoId], references: [id], onDelete: Cascade)

  @@id([projetId, technoId])  // clé primaire composée
  @@map("projets_technos")
}
```

Pour notre portfolio, la version implicite suffit largement. (Et comme on est en SQLite et qu'on stocke pour l'instant `technos String`, on va faire le refactor plus tard. Tu peux laisser `technos String` pour ce cours et faire la vraie relation au cours suivant si tu veux.)

## One-to-one (un à un)

**Un utilisateur a un seul profil**, **un profil appartient à un seul utilisateur**.

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  profil  Profil?  // optionnel
}

model Profil {
  id     Int    @id @default(autoincrement())
  bio    String
  userId Int    @unique   // <-- @unique force le 1-1
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

La clé est **`@unique` sur `userId`**. Sans ça, ce serait un one-to-many (un user, plusieurs profils). L'unicité de la clé étrangère **force le 1-1**.

## Le model Message (formulaire de contact)

Pour notre portfolio, on a un formulaire de contact. Ajoutons un model :

```prisma
model Message {
  id        Int      @id @default(autoincrement())
  nom       String
  email     String
  contenu   String
  lu        Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("messages")
}
```

Pas de relation pour l'instant : un message est juste un message.

Génère la migration :

```bash
npx prisma migrate dev --name add_image_and_message
```

## Récupérer des données liées : `include`

Par défaut, `findMany()` ne renvoie **que les colonnes de la table principale**. Pour récupérer les relations, tu utilises `include` :

```ts
const projets = await this.prisma.projet.findMany({
  include: {
    images: true,
  },
});
```

Le type retourné devient :

```ts
(Projet & { images: Image[] })[]
```

Chaque projet a maintenant un tableau `images`. **Encore une fois, sans rien écrire comme type.**

Tu peux aller plus loin :

```ts
const projet = await this.prisma.projet.findUnique({
  where: { slug: "mon-portfolio" },
  include: {
    images: {
      orderBy: { createdAt: "desc" },
      take: 5,
    },
  },
});
```

## Choisir précisément avec `select`

`select` est l'**opposé** de `include` : tu choisis exactement les champs que tu veux. Tout ce qui n'est pas listé est **absent du résultat**.

```ts
const projets = await this.prisma.projet.findMany({
  select: {
    id: true,
    titre: true,
    images: {
      select: {
        url: true,
      },
    },
  },
});
```

Le type devient `{ id: number; titre: string; images: { url: string }[] }[]`.

C'est très utile pour :
- **Performance** : tu transmets moins de données depuis la base.
- **Sécurité** : tu n'exposes pas accidentellement un champ sensible (ex. `passwordHash`).

`include` ou `select`, **pas les deux** dans le même bloc. Choisis selon ton besoin.

## Eager vs lazy loading (en gros)

- **Eager loading** = "Donne-moi les enfants en même temps que le parent." → c'est ce que fait `include`.
- **Lazy loading** = "Je récupère le parent maintenant, j'irai chercher les enfants plus tard si besoin." → en Prisma, on le fait avec une **deuxième requête** explicite.

Prisma préfère l'**explicite** : tu sais toujours ce que tu charges. Pas de magie cachée comme dans certains autres ORM. Un peu plus verbeux, mais beaucoup plus clair.

## Créer avec une relation

Tu peux créer un projet **et ses images en même temps** :

```ts
const projet = await this.prisma.projet.create({
  data: {
    slug: "mon-portfolio",
    titre: "Mon portfolio",
    description: "Mon site perso",
    technos: "nextjs,nestjs,prisma",
    images: {
      create: [
        { url: "/img1.png", alt: "Capture 1" },
        { url: "/img2.png", alt: "Capture 2" },
      ],
    },
  },
  include: { images: true },
});
```

Prisma fait **une seule transaction** : projet + images en même temps. Si une partie échoue, tout est annulé.

D'autres opérations sur les relations :
- `connect` : "lie ce projet à une techno **déjà existante**" (ex. `connect: { id: 3 }`).
- `disconnect` : "casse le lien".
- `connectOrCreate` : "lie si ça existe, sinon crée".

## TypeScript vu dans ce cours

- **Types nested automatiques** : `Projet & { images: Image[] }` est généré quand tu fais `include`. Tu n'écris jamais ce type à la main.
- **Helper `Prisma.ProjetGetPayload`** pour typer une fonction qui renvoie un projet avec ses images :

```ts
import { Prisma } from "@prisma/client";

type ProjetAvecImages = Prisma.ProjetGetPayload<{
  include: { images: true };
}>;
```

Pratique quand tu veux passer ce type à une autre fonction.

## Application sur le projet

Dans `mon-backend/prisma/schema.prisma` :

1. Ajoute le model `Image` (one-to-many avec Projet).
2. Ajoute le model `Message`.
3. Lance :
   ```bash
   npx prisma migrate dev --name add_image_and_message
   ```
4. Vérifie dans Prisma Studio que les tables `images` et `messages` existent.

On fera l'intégration dans les services NestJS au cours suivant.

## Résumé
- **One-to-many** : `Image[]` côté parent, `projetId Int` + `projet @relation(...)` côté enfant.
- **Many-to-many** (implicite) : `Techno[]` des deux côtés, Prisma crée la table de liaison.
- **One-to-one** : comme one-to-many, mais avec `@unique` sur la foreign key.
- **`include`** = "ramène-moi les relations en plus".
- **`select`** = "ramène-moi exactement ces champs".
- `onDelete: Cascade` propage la suppression du parent vers les enfants.
- Tu peux **créer un parent et ses enfants** en une seule requête.

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 04 — Le Prisma Client](./04_le-prisma-client.md)
- → Suivant : [Cours 06 — Prisma dans NestJS](./06_prisma-dans-nestjs.md)
- Sommaire : [README](../README.md)
