# Cours 07 — Seed et données de test

## Ce qu'on va voir
Comment **peupler automatiquement** la base avec des données initiales (un "seed"). Indispensable pour le dev, les tests, et les démonstrations.

## C'est quoi un seed ?

**Seed** veut dire "graine" en anglais. Dans le monde des bases de données, c'est un **script qui met des données de départ** dans une base vide.

Cas d'usage :

- Tu lances `migrate reset` et tu veux retrouver tes 3 projets de démo.
- Un nouveau dev clone le repo : il fait `npm install`, lance les migrations, fait `prisma db seed`, et a immédiatement une base utilisable.
- En tests automatisés (cours plus tard), on sème la base avant chaque suite.

Sans seed, tu te retrouves toujours à recréer 10 projets à la main dans Prisma Studio. Une corvée.

## Le pattern

Prisma utilise une convention :

1. Tu écris un **fichier** `prisma/seed.ts`.
2. Tu déclares dans `package.json` **comment l'exécuter**.
3. Tu lances `npx prisma db seed`.

C'est aussi appelé **automatiquement** après `npx prisma migrate reset`. Pratique.

## Étape 1 — Installer un runner TypeScript

Le seed est en TypeScript. Pour l'exécuter directement, on a besoin d'un outil comme `tsx` ou `ts-node`. **`tsx`** est plus rapide et plus simple en 2026.

```bash
npm i -D tsx
```

## Étape 2 — Écrire `prisma/seed.ts`

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding...");

  const projets = [
    {
      slug: "mon-portfolio",
      titre: "Mon portfolio",
      description: "Site personnel construit avec Next.js et Tailwind.",
      technos: "nextjs,tailwind,typescript",
    },
    {
      slug: "mon-blog",
      titre: "Mon blog",
      description: "Blog technique pour partager mes apprentissages.",
      technos: "nextjs,markdown,prisma",
    },
    {
      slug: "api-todos",
      titre: "API Todos",
      description: "Une API REST avec NestJS et Prisma.",
      technos: "nestjs,prisma,postgresql",
    },
  ];

  for (const projet of projets) {
    await prisma.projet.upsert({
      where: { slug: projet.slug },
      update: projet,
      create: projet,
    });
  }

  console.log(`Seed terminé : ${projets.length} projets.`);
}

main()
  .catch((error) => {
    console.error("Erreur pendant le seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Pause pour expliquer **`upsert`**, le héros de cette histoire.

### Pourquoi `upsert` et pas `create` ?

`create` plante si le slug existe déjà (à cause de `@unique`). Si tu lances le seed deux fois, ça explose.

**`upsert`** signifie **U**pdate or in**SERT** :
- Si la ligne existe → on la met à jour avec `update`.
- Sinon → on la crée avec `create`.

Résultat : tu peux **lancer le seed autant de fois que tu veux**, sans erreur, sans doublon. C'est ce qu'on appelle **idempotent** : exécuter une fois ou cent fois donne le même résultat.

C'est **la** bonne pratique pour les seeds en équipe.

## Étape 3 — Configurer `package.json`

Ajoute cette section à la fin de `mon-backend/package.json` :

```json
{
  "name": "mon-backend",
  "...": "...",
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Cette clé `prisma.seed` dit à Prisma : "voilà la commande à lancer pour le seed".

## Étape 4 — Lancer le seed

```bash
npx prisma db seed
```

Tu devrais voir :

```
Running seed command `tsx prisma/seed.ts` ...
Seeding...
Seed terminé : 3 projets.
```

Ouvre Prisma Studio : tes 3 projets sont là !

## Seed plus complet : avec relations

Souvent on veut aussi semer les relations. Exemple avec des images :

```ts
async function main(): Promise<void> {
  await prisma.projet.upsert({
    where: { slug: "mon-portfolio" },
    update: {},
    create: {
      slug: "mon-portfolio",
      titre: "Mon portfolio",
      description: "Site perso.",
      technos: "nextjs,tailwind",
      images: {
        create: [
          { url: "/img/portfolio-1.png", alt: "Page d'accueil" },
          { url: "/img/portfolio-2.png", alt: "Page contact" },
        ],
      },
    },
  });
}
```

Petit piège : si tu **relances** le seed, le `update: {}` ne touche pas aux images existantes. Mais si tu fais `create` côté images dans `update`, ça **ajoutera de nouvelles images** à chaque run. Pour gérer ça proprement, soit tu **n'inclus pas les images** dans le seed idempotent, soit tu fais d'abord un `deleteMany` des images puis tu recrées :

```ts
const projet = await prisma.projet.upsert({
  where: { slug: "mon-portfolio" },
  update: { titre: "Mon portfolio" },
  create: {
    slug: "mon-portfolio",
    titre: "Mon portfolio",
    description: "Site perso.",
    technos: "nextjs,tailwind",
  },
});

await prisma.image.deleteMany({ where: { projetId: projet.id } });
await prisma.image.createMany({
  data: [
    { url: "/img/portfolio-1.png", alt: "Accueil", projetId: projet.id },
    { url: "/img/portfolio-2.png", alt: "Contact", projetId: projet.id },
  ],
});
```

Pas magique, mais clair et idempotent.

## Quand le seed se lance-t-il automatiquement ?

Prisma lance le seed automatiquement après :

- `npx prisma migrate reset`
- `npx prisma migrate dev` quand la base vient d'être créée (la toute première fois)

C'est très pratique : ton dev fait `migrate reset`, et il a une base nettoyée **avec ses données de démo**.

Pour le **désactiver** sur un `migrate reset`, ajoute `--skip-seed`.

## Données factices à grand volume

Pour des tests de performance ou pour remplir vite la base, on utilise une lib comme **`@faker-js/faker`** :

```bash
npm i -D @faker-js/faker
```

```ts
import { faker } from "@faker-js/faker";

for (let i = 0; i < 100; i++) {
  await prisma.projet.create({
    data: {
      slug: faker.lorem.slug(),
      titre: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      technos: faker.lorem.words(2),
    },
  });
}
```

100 projets bidons en quelques secondes. Pour notre portfolio, on n'en a pas besoin, mais c'est bon à connaître.

## Bonnes pratiques

1. **Idempotence** : utilise `upsert`. Toujours.
2. **Dépendances claires** : crée d'abord les parents (User), puis les enfants (Profil).
3. **Pas de secrets en dur** : si tu sème un mot de passe admin, lis-le depuis `.env`.
4. **Logs explicites** : un `console.log` à chaque étape, ça aide quand le seed échoue.
5. **Petit pour le dev, séparé pour les tests** : tu peux avoir un `prisma/seed.ts` pour le dev et un autre script pour les tests E2E.

## TypeScript vu dans ce cours

- **`async function main(): Promise<void>`** : on type le retour. `void` car on ne renvoie rien.
- **`process.exit(1)`** : on quitte avec un code d'erreur si quelque chose plante. Important pour la CI.
- **`for (const x of liste)`** dans un contexte `async` : `await` à l'intérieur fonctionne tel quel (à la différence de `forEach`, qui ne sait pas attendre).

## Application sur le projet

Dans `mon-backend/` :

1. `npm i -D tsx`
2. Crée `prisma/seed.ts` avec le code ci-dessus.
3. Ajoute la clé `prisma.seed` dans `package.json`.
4. Lance `npx prisma db seed`.
5. Vérifie dans Prisma Studio que les 3 projets sont là.
6. Lance une seconde fois `npx prisma db seed` : pas d'erreur, mêmes données. C'est l'idempotence en action.
7. Test ultime : lance `npx prisma migrate reset`. La base est effacée, les migrations rejouées, et le seed relancé. Tu retrouves tes 3 projets, tout neufs.
8. Commit : `git add prisma/seed.ts package.json && git commit -m "feat: prisma seed for initial projets"`.

## Résumé
- Un **seed** peuple la base avec des données initiales.
- Fichier `prisma/seed.ts`, configuré dans `package.json` via `prisma.seed`.
- Lancé avec `npx prisma db seed`, **automatiquement** après `migrate reset`.
- **Toujours idempotent** : utilise `upsert`, pas `create`.
- Lance `tsx prisma/seed.ts` pour exécuter du TypeScript directement.
- Pour des relations, sois explicite (deleteMany puis create) pour rester idempotent.

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 06 — Prisma dans NestJS](./06_prisma-dans-nestjs.md)
- → Suivant : [Cours 08 — Bonnes pratiques](./08_bonnes-pratiques.md)
- Sommaire : [README](../README.md)
