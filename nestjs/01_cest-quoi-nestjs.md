# Cours 01 — C'est quoi NestJS ?

## Ce qu'on va voir
Comprendre pourquoi on a besoin d'un **backend**, ce qu'est NestJS, et pourquoi on l'a choisi pour ton portfolio.

---

## D'abord, frontend et backend, c'est quoi ?

Imagine un restaurant.

- La **salle** où les clients sont assis, regardent le menu et passent commande, c'est le **frontend**. C'est ce que les gens voient. C'est Next.js que tu viens de finir.
- La **cuisine**, où on prépare les plats, où on a le frigo avec les ingrédients, où on conserve les recettes... c'est le **backend**. Personne ne la voit, mais sans elle, il n'y a rien à manger.

Ton portfolio Next.js, pour l'instant, c'est juste une salle de restaurant avec un menu déjà imprimé en dur sur les murs.
On va construire la cuisine maintenant.

---

## Pourquoi un backend ?

Aujourd'hui, ton portfolio a une liste de projets dans un fichier `lib/projets.ts`. C'est pratique au début, mais :

- Si tu veux ajouter un projet, tu dois modifier le code et redéployer.
- Tu ne peux pas avoir un formulaire de contact qui **reçoit vraiment** des messages.
- Tu ne peux pas stocker des données qui changent (visiteurs, commentaires, articles de blog plus tard).

Un backend, c'est un programme qui **vit en permanence sur un serveur**, qui sait :
- Lire et écrire dans une base de données.
- Recevoir des messages depuis ton site (formulaires, etc.).
- Renvoyer des informations à n'importe qui qui en demande (ton site Next.js, par exemple).

---

## C'est quoi NestJS ?

**NestJS**, c'est un **framework** pour écrire des backends en TypeScript.

Un **framework**, c'est une boîte à outils + une **façon de ranger** ton code.
Imagine un atelier de menuiserie. Tu peux le ranger n'importe comment (chaos), ou suivre une organisation : les vis ici, les marteaux là, les planches au fond. NestJS, c'est l'atelier déjà rangé pour toi.

---

## Pourquoi pas Express tout seul ?

Tu vas peut-être entendre parler d'**Express**. C'est l'outil le plus connu pour faire un serveur en Node.js. Il est simple, mais... trop simple.

| Avec Express seul | Avec NestJS |
|---|---|
| Tu organises ton code comme tu veux (= souvent mal) | Le rangement est imposé, c'est carré |
| Pas de TypeScript par défaut | TypeScript dès le début |
| Pas de structure claire pour grandir | Pensé pour des grosses équipes |
| Tu dois tout brancher à la main | NestJS branche les morceaux pour toi |

NestJS est ce qu'on appelle un **framework opiniâtre**.
Ça veut dire : il a des **opinions fortes** sur la bonne façon de faire. Il te dit "fais comme ça". Au début, ça frustre un peu. Mais quand l'app grandit, tu remercies.

---

## L'architecture en couches (image très importante)

Dans NestJS, ton code est découpé en plusieurs couches, comme un gâteau :

```
[ Le navigateur, ton site Next.js ]
              |
              v
   ----- Couche Controller -----    <- Reçoit la demande, comme un serveur de restaurant
              |
              v
   ----- Couche Service -----       <- Fait le vrai travail, comme le cuisinier
              |
              v
   ----- Couche Base de données --- <- Stocke les ingrédients (plus tard avec Prisma)
```

Chaque couche a **un seul rôle**. C'est ce qui rend le code clair, même quand 50 développeurs travaillent dessus.

---

## Ce qu'on va construire

Un backend NestJS appelé **`mon-backend/`**, à côté de ton projet Next.js. Il sera capable de :

- Donner la liste des projets : `GET /projets`
- Donner un projet précis : `GET /projets/:slug`
- Recevoir un message de contact : `POST /messages`

Et ton portfolio Next.js, au lieu de lire ses projets dans un fichier en dur, ira les chercher chez ton backend.

Plus tard (cours Prisma + PostgreSQL), on remplacera le tableau en mémoire par une vraie base de données. Une couche à la fois.

---

## Résumé

- Le **frontend** est la salle, le **backend** est la cuisine.
- NestJS est un **framework** pour faire des backends propres en TypeScript.
- Il est **opiniâtre** : il impose une bonne organisation.
- L'architecture en couches sépare **qui reçoit** (controller), **qui fait le travail** (service), et **qui stocke** (base de données plus tard).
- On va construire `mon-backend/` qui va nourrir ton portfolio Next.js en données.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 15 — Environnement et déploiement](../nextjs/15_environnement-et-deploiement.md)
- → Suivant : [Cours 02 — Installation et structure](./02_installation-et-structure.md)
- Sommaire : [README](../README.md)
