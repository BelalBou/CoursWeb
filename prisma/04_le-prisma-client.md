# Cours 04 — Le Prisma Client

## Ce qu'on va voir
On découvre le **Prisma Client** : la librairie auto-générée qui te permet d'écrire `prisma.projet.findMany()` en TypeScript pur. On l'intègre proprement à NestJS avec un `PrismaService`.

## C'est quoi le Prisma Client ?

Le **Prisma Client**, c'est la **bibliothèque TypeScript** qui sait parler à ta base. Mais elle a une particularité énorme : **elle est générée à partir de TON schéma**.

C'est-à-dire :

- Tu écris ton schéma : `model Projet { id Int @id ... }`.
- Tu lances `npx prisma generate` (ou `migrate dev`, qui le fait tout seul).
- Prisma fabrique pour toi un fichier dans `node_modules/@prisma/client` qui connaît **précisément** tes tables, tes colonnes, leurs types.

Résultat : quand tu écris `prisma.projet.`, ton éditeur **te propose seulement** ce qui existe vraiment. Si tu fais une faute, TypeScript râle **avant que le code ne tourne**.

C'est complètement différent d'un ORM générique : ici, le client est **sur mesure**.

## Générer le client manuellement

En général, `migrate dev` le fait tout seul. Mais tu peux forcer :

```bash
npx prisma generate
```

À faire si :
- Tu as récupéré le code d'un collègue (`git pull`) et son schéma a changé.
- Tu as modifié ton schéma sans faire de migration (cas rare).

## Première utilisation (pour comprendre)

Tu pourrais écrire un fichier de test rapide :

```ts
// scripts/test-prisma.ts (juste pour comprendre, on ne le garde pas)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const projet = await prisma.projet.create({
    data: {
      slug: "mon-portfolio",
      titre: "Mon portfolio",
      description: "Mon premier vrai projet",
      technos: "nextjs,nestjs,prisma",
    },
  });

  console.log("Créé :", projet);

  const tous = await prisma.projet.findMany();
  console.log("Total :", tous.length);
}

main().finally(() => prisma.$disconnect());
```

Si tu lances ce script (`npx tsx scripts/test-prisma.ts`), tu verras :

```
Créé : { id: 1, slug: 'mon-portfolio', titre: 'Mon portfolio', ... }
Total : 1
```

Et dans Prisma Studio, la ligne apparaît !

**Mais attention** : ce code crée un `PrismaClient` à la main. Dans une vraie appli NestJS, on **ne fait jamais ça** dans les services métier. On va voir pourquoi et comment faire mieux.

## Pourquoi un PrismaService ?

Si dans `ProjetsService` tu fais `new PrismaClient()`, et dans `MessagesService` aussi, et dans `UsersService` encore... tu as **plusieurs connexions** ouvertes vers la base. Chacune consomme des ressources. C'est un gaspillage et ça peut planter en prod.

Dans une équipe sérieuse, on suit ce principe : **un seul client, partagé partout, géré par NestJS**.

NestJS sait faire ça avec ses **services injectables** : on crée un `PrismaService` que toute l'application réutilise.

## Créer le PrismaService

Crée le fichier :

```
mon-backend/src/prisma/prisma.service.ts
```

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

On décortique :

### `extends PrismaClient`
Notre service **hérite** de `PrismaClient`. C'est-à-dire que toutes les méthodes du client (`projet`, `message`, `$transaction`...) deviennent des méthodes de `PrismaService`. On n'a rien à recopier.

### `@Injectable()`
Le décorateur NestJS qui dit "je peux être injecté ailleurs". Tu connais déjà ça depuis NestJS.

### `OnModuleInit` et `OnModuleDestroy`
Ce sont des **interfaces de cycle de vie** de NestJS.

- `onModuleInit` : appelée **une fois** quand le module démarre. On y met `$connect()` pour ouvrir la connexion à la base.
- `onModuleDestroy` : appelée quand l'application s'arrête. On y met `$disconnect()` pour fermer proprement.

En vrai, Prisma se connecte aussi tout seul à la première requête. Mais l'appeler explicitement permet d'**échouer rapidement** si la base est inaccessible, plutôt que de découvrir le problème à la première requête utilisateur.

## Créer le PrismaModule

Pour qu'on puisse injecter `PrismaService` partout, on crée un module :

```
mon-backend/src/prisma/prisma.module.ts
```

```ts
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### `@Global()`
Sans ça, il faudrait importer `PrismaModule` dans **chaque** module (`ProjetsModule`, `MessagesModule`...). Avec `@Global()`, on l'importe **une seule fois** dans `AppModule`, et c'est dispo partout.

### `exports: [PrismaService]`
Sans cette ligne, le service serait privé au module. Avec, on le rend disponible aux autres modules.

## Brancher dans AppModule

Dans `mon-backend/src/app.module.ts` :

```ts
import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjetsModule } from "./projets/projets.module";
import { MessagesModule } from "./messages/messages.module";

@Module({
  imports: [PrismaModule, ProjetsModule, MessagesModule],
})
export class AppModule {}
```

Et voilà. À partir de maintenant, dans n'importe quel service, tu peux écrire :

```ts
constructor(private readonly prisma: PrismaService) {}
```

Et utiliser `this.prisma.projet.findMany()`.

## Premières requêtes

Quelques exemples typiques. Dans un service :

### Tout récupérer

```ts
const projets = await this.prisma.projet.findMany();
// projets est de type Projet[]
```

### Avec un filtre

```ts
const projets = await this.prisma.projet.findMany({
  where: { titre: { contains: "portfolio" } },
  orderBy: { createdAt: "desc" },
  take: 10,   // limite à 10
  skip: 0,    // décalage (pour la pagination)
});
```

### Un seul, par identifiant unique

```ts
const projet = await this.prisma.projet.findUnique({
  where: { slug: "mon-portfolio" },
});
// projet est de type Projet | null
```

`findUnique` ne marche que sur des champs `@id` ou `@unique`. C'est volontaire : ça **garantit** qu'on cherche un truc unique.

### Créer

```ts
const projet = await this.prisma.projet.create({
  data: {
    slug: "mon-blog",
    titre: "Mon blog",
    description: "Articles de dev",
    technos: "nextjs,prisma",
  },
});
```

Tu remarqueras qu'on **ne fournit pas** `id`, `createdAt`, `updatedAt` : Prisma s'en occupe (grâce aux `@default` et `@updatedAt`).

### Modifier

```ts
const projet = await this.prisma.projet.update({
  where: { slug: "mon-blog" },
  data: { titre: "Mon super blog" },
});
```

### Supprimer

```ts
await this.prisma.projet.delete({
  where: { slug: "mon-blog" },
});
```

## La magie du typage

Mets ton curseur sur `projets` ici :

```ts
const projets = await this.prisma.projet.findMany();
```

Ton IDE te dit : `const projets: Projet[]`. Sans **rien** écrire comme type. Prisma a généré le type `Projet` à partir de ton schéma.

Encore mieux. Si tu utilises `select` :

```ts
const projets = await this.prisma.projet.findMany({
  select: { id: true, titre: true },
});
```

Le type devient : `{ id: number; titre: string; }[]`. Slug, description, etc. sont **absents** du type, parce qu'ils ne sont pas demandés. C'est de la **précision incroyable**.

## TypeScript vu dans ce cours

- **L'héritage avec `extends`** : `class PrismaService extends PrismaClient`. Notre classe gagne toutes les méthodes de la classe parente.
- **`implements OnModuleInit, OnModuleDestroy`** : on promet d'avoir les méthodes `onModuleInit` et `onModuleDestroy`.
- **Les types générés** : `Projet`, `Message` etc. sont importables depuis `@prisma/client` :
  ```ts
  import { Projet } from "@prisma/client";
  ```
- **Inférence forte** : Prisma adapte le type retourné selon `select`, `include`, etc. Tu n'as **jamais** à écrire `as Projet[]`.

## Application sur le projet

Dans `mon-backend/` :

1. Crée `src/prisma/prisma.service.ts` (code ci-dessus).
2. Crée `src/prisma/prisma.module.ts` (code ci-dessus).
3. Modifie `src/app.module.ts` pour importer `PrismaModule`.
4. Lance `npm run start:dev`. Tu ne devrais voir **aucune erreur**, et la base est connectée.
5. Tu peux tester rapidement en injectant `PrismaService` dans `ProjetsService` et en remplaçant l'ancien tableau par un `findMany`. On fera ce refactor complet au cours 6.

## Résumé
- Le **Prisma Client** est généré à partir de ton schéma : 100% type-safe.
- Dans NestJS, on n'instancie **jamais** `new PrismaClient()` à la main dans la logique métier.
- On crée un **`PrismaService`** qui hérite de `PrismaClient` et gère le cycle de vie.
- Un **`PrismaModule`** marqué `@Global()` rend le service disponible partout.
- Méthodes clés : `findMany`, `findUnique`, `findFirst`, `create`, `update`, `delete`.
- Le typage est **automatique** et change selon `select` / `include`.

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 03 — Les migrations](./03_migrations.md)
- → Suivant : [Cours 05 — Les relations](./05_relations.md)
- Sommaire : [README](../README.md)
