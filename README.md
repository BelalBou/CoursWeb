# Cours Web — De zéro à un projet en production

Bienvenue. Ce dépôt est un cours de développement web complet, conçu pour qu'un débutant motivé puisse construire **un vrai projet en production** en suivant les chapitres dans l'ordre.

Le projet fil rouge est un **portfolio personnel** : on commence par un site Next.js avec des données en dur, puis on ajoute petit à petit un backend, une base de données, et on finit par un déploiement sur un serveur Linux.

## À qui s'adresse ce cours

- Tu connais les bases de **HTML, CSS et JavaScript**.
- Tu n'as jamais touché à React, Next.js, ou à un backend.
- Tu veux apprendre **les bonnes pratiques pros**, pas juste "faire marcher".

Chaque concept est expliqué simplement, avec des analogies du quotidien. Pas de jargon balancé sans explication, pas de saut logique. Si tu suis tout dans l'ordre, tu n'as besoin de rien d'autre.

## Comment lire ce cours

1. **Suis l'ordre.** Chaque chapitre suppose les précédents.
2. **Tape le code toi-même.** Ne copie-colle pas. Le but est d'apprendre, pas de finir vite.
3. **Pose des questions.** Quand tu ne comprends pas, note ta question. Elle a sa place dans la section "Questions" en bas de chaque chapitre.
4. **Chaque chapitre a un précédent et un suivant** en bas de page pour t'aider à suivre la chaîne.

## Le parcours complet

Le parcours est construit dans cet ordre logique. Chaque cours s'appuie sur le précédent.

### 1. Next.js — le frontend moderne

On construit le portfolio côté visiteur. Pages, composants, formulaire, navigation, SEO, déploiement.

| # | Chapitre | Lien |
|---|----------|------|
| 01 | C'est quoi Next.js ? | [Lire](./01_nextjs/01_cest-quoi-nextjs.md) |
| 02 | Installer Next.js et créer ton premier projet | [Lire](./01_nextjs/02_installation.md) |
| 03 | Les pages et le routing | [Lire](./01_nextjs/03_pages-et-routing.md) |
| 04 | Les composants | [Lire](./01_nextjs/04_composants.md) |
| 05 | Le CSS dans Next.js | [Lire](./01_nextjs/05_le-css.md) |
| 06 | Les liens et la navigation entre pages | [Lire](./01_nextjs/06_liens-et-navigation.md) |
| 07 | Server Components vs Client Components | [Lire](./01_nextjs/07_server-vs-client-components.md) |
| 08 | Le state et l'interactivité | [Lire](./01_nextjs/08_state-et-interactivite.md) |
| 09 | Les formulaires et les Server Actions | [Lire](./01_nextjs/09_formulaires-et-server-actions.md) |
| 10 | Données et routes dynamiques | [Lire](./01_nextjs/10_donnees-et-routes-dynamiques.md) |
| 11 | Metadata et SEO | [Lire](./01_nextjs/11_metadata-et-seo.md) |
| 12 | Images et fonts | [Lire](./01_nextjs/12_images-et-fonts.md) |
| 13 | Loading, erreurs et not-found | [Lire](./01_nextjs/13_loading-erreurs-not-found.md) |
| 14 | Route Handlers et API interne | [Lire](./01_nextjs/14_route-handlers-et-api-interne.md) |
| 15 | Environnement et déploiement | [Lire](./01_nextjs/15_environnement-et-deploiement.md) |

### 2. NestJS — le backend structuré

On crée un vrai backend en TypeScript pour servir nos données et recevoir les messages de contact.

| # | Chapitre | Lien |
|---|----------|------|
| 01 | C'est quoi NestJS ? | [Lire](./02_nestjs/01_cest-quoi-nestjs.md) |
| 02 | Installation et structure | [Lire](./02_nestjs/02_installation-et-structure.md) |
| 03 | Controllers, services, modules | [Lire](./02_nestjs/03_controllers-services-modules.md) |
| 04 | Premier endpoint — les projets | [Lire](./02_nestjs/04_premier-endpoint-projets.md) |
| 05 | DTOs et validation | [Lire](./02_nestjs/05_dto-et-validation.md) |
| 06 | Gestion des erreurs | [Lire](./02_nestjs/06_gestion-erreurs.md) |
| 07 | CORS et connexion avec Next.js | [Lire](./02_nestjs/07_cors-et-connexion-nextjs.md) |
| 08 | Configuration et environnement | [Lire](./02_nestjs/08_config-et-environnement.md) |
| 09 | Tests unitaires | [Lire](./02_nestjs/09_tests-unitaires.md) |
| 10 | Organiser le projet pour grandir | [Lire](./02_nestjs/10_organisation-pour-grandir.md) |

### 3. PostgreSQL — la vraie base de données

On apprend SQL et PostgreSQL avant Prisma pour comprendre ce que la base fait vraiment : tables, requêtes, relations, index et administration.

| # | Chapitre | Lien |
|---|----------|------|
| 01 | C'est quoi une base de données ? | [Lire](./03_postgresql/01_cest-quoi-une-base-de-donnees.md) |
| 02 | C'est quoi PostgreSQL ? | [Lire](./03_postgresql/02_cest-quoi-postgresql.md) |
| 03 | Installation locale | [Lire](./03_postgresql/03_installation-locale.md) |
| 04 | Tables, colonnes, types | [Lire](./03_postgresql/04_tables-colonnes-types.md) |
| 05 | Requêtes SQL de base | [Lire](./03_postgresql/05_requetes-sql-de-base.md) |
| 06 | Jointures et relations | [Lire](./03_postgresql/06_jointures-et-relations.md) |
| 07 | Index et performance | [Lire](./03_postgresql/07_index-et-performance.md) |
| 08 | Administration et PostgreSQL en prod | [Lire](./03_postgresql/08_administration-et-postgres-en-prod.md) |

### 4. Prisma — l'ORM moderne

On ajoute une vraie persistance dans NestJS avec Prisma, directement branché sur PostgreSQL.

| # | Chapitre | Lien |
|---|----------|------|
| 01 | C'est quoi un ORM ? | [Lire](./04_prisma/01_cest-quoi-un-orm.md) |
| 02 | Installation et schéma | [Lire](./04_prisma/02_installation-et-schema.md) |
| 03 | Les migrations | [Lire](./04_prisma/03_migrations.md) |
| 04 | Le Prisma Client | [Lire](./04_prisma/04_le-prisma-client.md) |
| 05 | Les relations | [Lire](./04_prisma/05_relations.md) |
| 06 | Prisma dans NestJS | [Lire](./04_prisma/06_prisma-dans-nestjs.md) |
| 07 | Seed et données de test | [Lire](./04_prisma/07_seed-et-data-test.md) |
| 08 | Bonnes pratiques | [Lire](./04_prisma/08_bonnes-pratiques.md) |

### 5. Linux — déployer en vrai

On apprend Linux, on prend un serveur, et on déploie notre projet pour qu'il soit accessible depuis Internet.

| # | Chapitre | Lien |
|---|----------|------|
| 01 | C'est quoi Linux ? | [Lire](./05_linux/01_cest-quoi-linux.md) |
| 02 | Le terminal | [Lire](./05_linux/02_le-terminal.md) |
| 03 | Le système de fichiers | [Lire](./05_linux/03_systeme-de-fichiers.md) |
| 04 | Naviguer et manipuler des fichiers | [Lire](./05_linux/04_naviguer-et-manipuler-fichiers.md) |
| 05 | Les permissions | [Lire](./05_linux/05_permissions.md) |
| 06 | Les processus | [Lire](./05_linux/06_processus.md) |
| 07 | Variables d'environnement | [Lire](./05_linux/07_variables-d-environnement.md) |
| 08 | Utilisateurs, sudo et installation | [Lire](./05_linux/08_utilisateurs-sudo-et-installation.md) |
| 09 | SSH et serveurs distants | [Lire](./05_linux/09_ssh-et-serveurs-distants.md) |
| 10 | Déployer le projet en production | [Lire](./05_linux/10_deployer-le-projet-en-production.md) |

## Référence transversale : TypeScript

TypeScript est utilisé partout dans le cours. Si tu veux comprendre un concept TypeScript en profondeur, ces chapitres sont à consulter en parallèle dès qu'un cours en parle.

| # | Chapitre | Lien |
|---|----------|------|
| 01 | C'est quoi TypeScript ? | [Lire](./06_typescript/01_cest-quoi-typescript.md) |
| 02 | Les types de base | [Lire](./06_typescript/02_les-types-de-base.md) |
| 03 | Les objets et le mot-clé `type` | [Lire](./06_typescript/03_les-objets-et-type.md) |
| 04 | Les fonctions | [Lire](./06_typescript/04_les-fonctions.md) |
| 05 | Les interfaces | [Lire](./06_typescript/05_les-interfaces.md) |
| 06 | Les génériques | [Lire](./06_typescript/06_les-generiques.md) |
| 07 | TypeScript et React | [Lire](./06_typescript/07_typescript-et-react.md) |

## Le projet fil rouge

À chaque chapitre, on construit ou on fait évoluer le portfolio.

- **Cours Next.js** → un site complet : pages, composants, formulaire de contact, page de projets dynamiques, SEO, déploiement Vercel.
- **Cours NestJS** → un backend dédié qui sert les projets et reçoit les messages de contact.
- **Cours PostgreSQL** → on crée une vraie base et on apprend SQL à la main.
- **Cours Prisma** → on branche NestJS à PostgreSQL proprement, avec migrations et types TypeScript.
- **Cours Linux** → on met le tout en ligne sur un VPS, avec nginx et HTTPS.

Le code du frontend est dans le dossier `mon-premier-projet/` (Next.js). Le backend est dans `mon-backend/` (NestJS). À ce stade, le frontend lit les projets depuis le backend et le formulaire de contact envoie ses messages vers `POST /messages`.

## Conventions d'écriture du cours

- **Un chapitre = un fichier `.md` numéroté** (`01_titre.md`, `02_titre.md`, ...).
- **Chaque chapitre a une navigation** en bas avec précédent / suivant / sommaire.
- **Les sections "Questions"** sont remplies au fur et à mesure que tu poses des questions.
- **Le code est typé partout** (TypeScript), structuré comme dans une vraie équipe.

## Démarrer maintenant

Va lire le premier cours : [**Cours 01 — C'est quoi Next.js ?**](./01_nextjs/01_cest-quoi-nextjs.md)

Bon parcours.
