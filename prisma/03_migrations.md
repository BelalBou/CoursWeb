# Cours 03 — Les migrations

## Ce qu'on va voir
On transforme notre schéma "sur le papier" en une vraie base de données. On découvre les **migrations** : comment Prisma garde l'historique des changements de structure.

## C'est quoi une migration ?

Imagine que tu construis une maison. L'architecte fait un **plan**.

- **Version 1 du plan** : 3 chambres, 1 salle de bain.
- **Version 2** : tu ajoutes un garage. Nouveau plan.
- **Version 3** : tu agrandis la cuisine. Encore un nouveau plan.

Chaque version est **datée et numérotée**. Si un jour tu veux savoir "quand a-t-on rajouté le garage ?", tu retrouves le plan correspondant.

Une **migration**, c'est exactement ça pour la base de données. À chaque fois que tu modifies le schéma (tu ajoutes une colonne, tu renommes une table...), Prisma **enregistre la modification** comme une nouvelle version du plan.

C'est précieux parce que :

- Toute l'équipe a la **même structure de base**.
- En production, on peut **rejouer** toutes les migrations dans l'ordre pour reconstruire la base.
- En cas de problème, on a un **historique** clair de ce qui a changé et quand.

## Notre première migration

Dans `mon-backend/`, lance :

```bash
npx prisma migrate dev --name init
```

Décortiquons :

- `prisma migrate dev` : crée une migration **en mode développement**.
- `--name init` : on donne un nom à cette migration. `init` parce que c'est la première (l'**initialisation**). Choisis des noms qui décrivent ce que tu changes : `add_messages`, `rename_user_to_account`, etc.

Que se passe-t-il pendant cette commande ?

1. Prisma compare ton `schema.prisma` à l'état actuel de la base.
2. Il en déduit le SQL nécessaire pour passer de l'un à l'autre.
3. Il **crée un fichier de migration** (du SQL pur) dans `prisma/migrations/`.
4. Il **applique** ce SQL à la base. Le fichier `dev.db` est créé pour de vrai.
5. Il **régénère** le client Prisma (`@prisma/client`) avec les nouveaux types.

Tu vois maintenant :

```
mon-backend/
├── prisma/
│   ├── schema.prisma
│   ├── dev.db                              ← ta base SQLite (un vrai fichier !)
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260505123000_init/
│           └── migration.sql               ← le SQL généré
```

## Regardons le SQL généré

Ouvre `prisma/migrations/20260505123000_init/migration.sql` (le timestamp sera différent chez toi). Tu vas voir :

```sql
CREATE TABLE "projets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technos" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "projets_slug_key" ON "projets"("slug");
```

C'est le SQL que **tu n'as pas eu à écrire**. Prisma l'a généré à partir de ton `schema.prisma`.

Tu reconnais : `CREATE TABLE projets`, et chaque colonne avec son type. `UNIQUE INDEX` correspond à ton `@unique` sur `slug`.

## Modifier le schéma plus tard

Imagine que dans deux semaines, tu veux ajouter une colonne `imageUrl` à `Projet`.

Tu modifies `schema.prisma` :

```prisma
model Projet {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  titre       String
  description String
  technos     String
  imageUrl    String?  // <-- nouveau champ optionnel
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("projets")
}
```

Le `?` après `String` veut dire **optionnel** (nullable). Important pour ne pas casser les lignes existantes.

Puis :

```bash
npx prisma migrate dev --name add_image_url
```

Prisma détecte le changement et crée une **deuxième migration** :

```
prisma/migrations/
├── 20260505123000_init/
│   └── migration.sql
└── 20260520091500_add_image_url/
    └── migration.sql
```

Chaque migration s'ajoute, jamais on ne modifie une migration déjà existante. C'est un **journal**.

## `migrate dev` vs `migrate deploy`

Deux commandes très proches mais avec des rôles différents.

### `npx prisma migrate dev`
- À utiliser **en développement**, sur ta machine.
- Crée **et applique** une nouvelle migration.
- Régénère le client.
- Peut **réinitialiser** la base si elle est désynchronisée (en posant la question avant).

### `npx prisma migrate deploy`
- À utiliser **en production**.
- N'invente jamais de nouvelle migration.
- Applique seulement les migrations **déjà commitées** dans le dossier `prisma/migrations/`.
- Ne pose pas de questions, ne réinitialise rien.

Règle d'or :
- En dev → `migrate dev`.
- En prod → `migrate deploy`.

On reverra ça au cours sur les bonnes pratiques.

## Prisma Studio : voir tes données

Voici une commande très utile :

```bash
npx prisma studio
```

Ça ouvre un onglet dans ton navigateur (en général `http://localhost:5555`) avec une **interface graphique** pour ta base.

Tu peux :
- Voir toutes les tables.
- Cliquer dans une table pour voir les lignes.
- **Ajouter, modifier, supprimer** des lignes à la souris.
- Filtrer, trier.

C'est ton **tableur magique** sur la base. Pratique pour vérifier que tout est correct sans écrire une seule ligne de code.

## Reset : repartir de zéro (dev only !)

En développement, parfois ta base est dans un état bizarre et tu veux tout effacer.

```bash
npx prisma migrate reset
```

Cette commande :

1. **Supprime** la base (le fichier `dev.db` pour SQLite).
2. La **recrée** vide.
3. **Rejoue toutes les migrations** dans l'ordre.
4. Lance le **seed** s'il y en a un (cours 7).

ATTENTION : **NE FAIS JAMAIS ÇA EN PRODUCTION**. Tu effaces toutes les données. Prisma te protège un peu en demandant confirmation, mais en prod c'est interdit.

## Workflow type

Le cycle de vie habituel quand tu travailles avec Prisma :

1. Tu modifies `schema.prisma`.
2. `npx prisma migrate dev --name nom_clair`.
3. Tu codes ta logique avec le client mis à jour.
4. Tu commits : le code **et** le dossier `prisma/migrations/`.
5. Tes collègues récupèrent ton commit, et appliquent tes migrations chez eux.

## TypeScript vu dans ce cours

`prisma migrate dev` régénère **automatiquement** le client. Tu n'as rien à faire. Dès que la commande termine, dans ton IDE, tu peux écrire `prisma.projet.` et tu vois `findMany`, `findUnique`, `create`... avec tous les bons types. Magie.

## Application sur le projet

Dans `mon-backend/` :

1. Vérifie que `schema.prisma` contient bien le model `Projet` du cours 02.
2. Lance :
   ```bash
   npx prisma migrate dev --name init
   ```
3. Vérifie que `prisma/dev.db` est apparu.
4. Lance `npx prisma studio`. Vérifie que la table `projets` existe (vide pour l'instant).
5. Ajoute `prisma/dev.db` et `prisma/dev.db-journal` à ton `.gitignore` (la base SQLite locale, on ne la commit pas).
6. Commit : `git add prisma/ && git commit -m "feat: init prisma schema and first migration"`.

## Résumé
- Une **migration** = un instantané daté du schéma sous forme de SQL.
- `npx prisma migrate dev --name xxx` crée et applique une migration en dev.
- Les migrations vivent dans `prisma/migrations/` et sont **commitées** dans Git.
- `npx prisma migrate deploy` applique en prod, sans rien inventer.
- `npx prisma studio` ouvre une interface graphique pour explorer la base.
- `npx prisma migrate reset` efface tout (dev only !).

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 02 — Installation et schéma](./02_installation-et-schema.md)
- → Suivant : [Cours 04 — Le Prisma Client](./04_le-prisma-client.md)
- Sommaire : [README](../README.md)
