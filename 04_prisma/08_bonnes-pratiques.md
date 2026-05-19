# Cours 08 — Bonnes pratiques

## Ce qu'on va voir
Les patterns que les équipes pros utilisent au quotidien : transactions, index, soft delete, le piège N+1, le déploiement en prod, et la sécurité. À la fin, on prépare le passage à PostgreSQL.

## 1. Les transactions

### Le problème

Imagine que tu veux créer une **commande** et **débiter le stock** d'un produit. Deux opérations, deux requêtes :

```ts
await prisma.commande.create({ data: { produitId: 1, quantite: 2 } });
await prisma.produit.update({
  where: { id: 1 },
  data: { stock: { decrement: 2 } },
});
```

Si entre les deux le serveur plante, tu as **une commande sans débit de stock**. La base est dans un état incohérent. Catastrophe en prod.

### La solution : `$transaction`

Une **transaction** garantit que **tout réussit, ou tout échoue ensemble**. Atomique.

```ts
await this.prisma.$transaction(async (tx) => {
  await tx.commande.create({ data: { produitId: 1, quantite: 2 } });
  await tx.produit.update({
    where: { id: 1 },
    data: { stock: { decrement: 2 } },
  });
});
```

Le paramètre `tx` est un client Prisma spécial pour cette transaction. Si une erreur est jetée à l'intérieur, **tout est annulé** (rollback). Sinon, **tout est validé** (commit) en bloc.

### Variante : tableau d'opérations

Pour des opérations indépendantes, tu peux passer un tableau :

```ts
const [user, profil] = await this.prisma.$transaction([
  this.prisma.user.create({ data: { email: "x@x.fr" } }),
  this.prisma.profil.create({ data: { bio: "Salut" } }),
]);
```

C'est plus court, mais tu ne peux pas avoir de logique conditionnelle au milieu. Le **callback** (`async (tx) => { ... }`) est plus flexible.

## 2. Les index

### Le problème

Quand tu fais `findMany({ where: { titre: "..." } })`, la base doit **lire chaque ligne** pour vérifier le titre. Avec 10 lignes, instantané. Avec 1 million, ça rame.

### La solution

Un **index**, c'est comme l'**index d'un livre** : une liste alphabétique qui te dit "le mot 'banane' est en page 42". La base ne lit plus tout, elle saute direct au bon endroit.

```prisma
model Projet {
  id    Int    @id @default(autoincrement())
  slug  String @unique     // index automatique grâce à @unique
  titre String
  auteur String

  @@index([titre])              // index simple sur titre
  @@index([auteur, titre])      // index composé : auteur + titre
}
```

`@id` et `@unique` créent **automatiquement** un index. Pour les autres champs souvent filtrés, ajoute `@@index([...])`.

### Quand ajouter un index ?

- Champs souvent dans des `where` (`status`, `userId`, `createdAt`).
- Champs souvent dans des `orderBy`.
- Foreign keys (Prisma le fait souvent tout seul, mais vérifie).

### Quand ne pas en ajouter ?

- Sur tout, pour le plaisir. Chaque index ralentit les `INSERT` et prend de la place. Mesure d'abord, optimise ensuite.

## 3. Le soft delete

### Le problème

`prisma.projet.delete()` **supprime physiquement** la ligne. Si un client te demande "j'ai supprimé un projet par erreur, tu peux le restaurer ?", tu ne peux rien faire.

### La solution : un drapeau

Au lieu de supprimer, on **marque** la ligne comme supprimée :

```prisma
model Projet {
  id        Int       @id @default(autoincrement())
  // ...
  deletedAt DateTime?
}
```

`deletedAt` est nullable :
- `null` → ligne active.
- date → ligne "supprimée" à cette date.

### Suppression "douce"

```ts
await prisma.projet.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

### Lecture avec filtre

```ts
const projets = await prisma.projet.findMany({
  where: { deletedAt: null },
});
```

Pour ne pas oublier le filtre **partout**, certaines équipes utilisent les **extensions Prisma** ou un middleware. Mais le piège, c'est que c'est facile à oublier. Bonne discipline d'équipe nécessaire.

### Restauration

```ts
await prisma.projet.update({
  where: { id },
  data: { deletedAt: null },
});
```

## 4. Le piège N+1

### Le problème

```ts
const projets = await prisma.projet.findMany();   // 1 requête
for (const projet of projets) {
  const images = await prisma.image.findMany({    // N requêtes !
    where: { projetId: projet.id },
  });
  console.log(projet.titre, images.length);
}
```

Si tu as 100 projets, tu fais **101 requêtes** (1 + 100). C'est le **problème N+1**, le tueur de performance le plus connu en ORM.

### La solution : `include` ou `select`

**Une seule** requête bien faite :

```ts
const projets = await prisma.projet.findMany({
  include: { images: true },    // 1 requête (en réalité 2 internes, mais 1 round-trip)
});

for (const projet of projets) {
  console.log(projet.titre, projet.images.length);
}
```

Prisma gère ça intelligemment en interne (souvent via un `IN (...)`). C'est rapide.

### Comment détecter le N+1 ?

- En dev, active les logs Prisma :

```ts
new PrismaClient({ log: ["query"] });
```

Et regarde la console : si tu vois 50 lignes `SELECT ...` quasi identiques, tu as un N+1.

- Outils comme **Prisma Pulse** ou **les middlewares de logging** aident en prod.

## 5. Migrations en prod

### Le workflow type

En dev :

```bash
npx prisma migrate dev --name add_xxx
git add prisma/migrations/
git commit -m "feat: add xxx column"
git push
```

En prod, **dans la pipeline de déploiement** (CI/CD), avant de démarrer l'app :

```bash
npx prisma migrate deploy
```

`migrate deploy` :
- N'invente jamais de migration.
- Applique seulement ce qui est dans `prisma/migrations/`.
- Idempotent : si une migration est déjà appliquée, il la saute.
- Échoue si la base est dans un état désynchronisé (sécurité).

### Règles strictes

- **Jamais** de `migrate dev` en prod.
- **Jamais** de `migrate reset` en prod (tu effaces les données client).
- **Toujours** `migrate deploy`.
- **Toujours** committer le dossier `prisma/migrations/`.
- **Jamais** modifier une migration déjà déployée. Crée-en une nouvelle.

## 6. `prisma format`

Petite commande utile pour garder un schéma propre :

```bash
npx prisma format
```

Aligne les colonnes, indente, normalise. À lancer avant chaque commit. Tu peux même l'ajouter à un hook Git (`husky`, `lint-staged`).

## 7. Sécurité

### Ne jamais exposer le PrismaClient au front

`@prisma/client` est conçu pour le **backend**. Il a accès **direct** à ta base. Si tu l'importes dans Next.js côté client, tu es **mort** : n'importe qui inspecte le bundle et voit l'URL de connexion.

Règle : **Prisma vit côté serveur uniquement**. Côté client, tu appelles **ton API NestJS**, jamais Prisma directement. (En Next.js, ça marche dans les Server Components et les Route Handlers, mais pas dans les Client Components.)

### Validation des inputs

Tout ce qui vient du front est **suspect**. Avant Prisma, tu valides avec `class-validator` (NestJS) ou `zod`.

```ts
@Post()
create(@Body() dto: CreateProjetDto): Promise<Projet> {
  // dto est validé par le ValidationPipe
  return this.projetsService.create(dto);
}
```

### Injection SQL : pas un souci avec Prisma

Tant que tu utilises l'API normale (`findMany`, `where`, etc.), Prisma **paramétrise** automatiquement les requêtes. Pas de risque d'injection.

**Sauf si** tu utilises `$queryRaw` ou `$executeRaw` avec de la concaténation de chaînes :

```ts
// DANGER : ne jamais faire ça !
await prisma.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`);

// OK : tagged template, paramétrisé
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

Le **tagged template** (sans parenthèses, avec `${}`) est **paramétrisé**. La version avec backticks dans une chaîne classique est **vulnérable**. Reste sur l'API typée si tu peux.

### Variables d'environnement

L'`.env` ne va **jamais** dans Git. Vérifie ton `.gitignore`.

En prod, les secrets viennent du système d'environnement (variables d'env du conteneur, secrets manager, etc.).

## 8. Mini check-list de revue de code Prisma

Avant de merger une PR qui touche à Prisma :

- Migration créée pour chaque changement de schéma ?
- Pas de N+1 (un `include` quand on parcourt des relations) ?
- Erreurs Prisma converties en exceptions NestJS ?
- DTOs valident bien les entrées ?
- Pas de `findUnique` + `update` à la place d'un seul `update` avec `try/catch` ?
- `prisma format` lancé ?
- Tests à jour ?
- Pas de secret dans le code ?

## TypeScript vu dans ce cours

- **`Prisma.TransactionClient`** : le type de `tx` dans `$transaction(async (tx) => ...)`.
- **`DateTime?`** côté Prisma → `Date | null` côté TypeScript.
- **Tagged templates** pour les requêtes brutes paramétrisées.

## Application sur le projet

Dans `mon-backend/` :

1. (Optionnel) Ajoute un champ `deletedAt DateTime?` à `Projet` et fais une migration. Adapte les méthodes de `ProjetsService` pour filtrer `deletedAt: null`.
2. Active les logs SQL en dev en passant `log: ["query"]` à `PrismaClient` dans le `PrismaService`. Lance des requêtes et observe.
3. Ajoute un index : `@@index([createdAt])` sur `Projet` (pour le tri par date), migre.
4. Lance `npx prisma format`.
5. Lis le dossier `prisma/migrations/` : c'est l'historique de ta base.

## Résumé
- **Transactions** (`$transaction`) : tout réussit, ou tout échoue.
- **Index** (`@@index`) : accélèrent les recherches sur de gros volumes.
- **Soft delete** (`deletedAt DateTime?`) : permet la restauration et l'audit.
- **N+1** : utilise `include`/`select` au lieu de boucler avec des requêtes.
- **En prod** : `migrate deploy`, jamais `migrate dev` ni `migrate reset`.
- **Sécurité** : Prisma reste côté serveur, valide les inputs, méfie-toi du raw SQL.

## Et après ? Direction Linux

Bravo, tu as maintenant la chaîne complète côté code : Next.js pour le frontend, NestJS pour l'API, PostgreSQL pour la base, Prisma pour parler à cette base proprement.

La prochaine grande étape, c'est **Linux** : comprendre le serveur sur lequel on pourra déployer tout ça.

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 07 — Seed et données de test](./07_seed-et-data-test.md)
- → Suivant : [Cours 09 — Admin, messages et SMTP](./09_admin-messages-et-smtp.md)
- Sommaire : [README](../README.md)
