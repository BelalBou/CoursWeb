# Cours 15 — Environnement et déploiement

## Ce qu'on va voir
Comment gérer les **variables d'environnement** (secrets, URLs...), comment **construire** ton site pour la prod, et comment le **mettre en ligne** pour que tout le monde puisse y accéder.

---

## Pourquoi des variables d'environnement ?

Tu as deux types d'informations dans ton projet :

1. **Le code** — il vit sur GitHub, tout le monde peut le voir.
2. **Les secrets** — clés API, mots de passe de base de données, tokens. Personne ne doit les voir.

**Règle d'or** : on ne met **jamais** un secret dans le code. Sinon n'importe quel ex-collaborateur, ou pire un hackeur qui scanne GitHub, peut le récupérer.

La solution : les **variables d'environnement**. Ce sont des valeurs que le système d'exploitation passe à ton programme **en dehors** du code.

Analogie : c'est comme un mot de passe qui n'est pas écrit dans le manuel du distributeur (le code), mais que **toi seul** tapes au clavier (l'environnement).

---

## Les fichiers `.env`

Next.js lit automatiquement plusieurs fichiers à la racine du projet :

| Fichier | À quoi ça sert | Versionné dans Git ? |
|---|---|---|
| `.env` | Valeurs partagées par défaut | Oui (mais pas de secrets !) |
| `.env.local` | Valeurs locales, secrets en dev | **Non** (dans `.gitignore`) |
| `.env.development` | Valeurs uniquement en `npm run dev` | Oui |
| `.env.production` | Valeurs uniquement en `npm run build`/`start` | Oui (mais pas de secrets !) |

**`.env.local` ne va jamais sur Git.** C'est là qu'on met les vrais secrets.

### Format

```
# .env.local
DATABASE_URL=postgres://user:password@localhost:5432/mon-portfolio
RESEND_API_KEY=re_abc123
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Pas d'espace autour du `=`. Pas de guillemets sauf si la valeur contient des espaces.

### Vérifier que c'est bien ignoré

Ouvre `.gitignore` à la racine de ton projet. Tu dois y voir :

```
.env*
!.env.example
```

Si ce n'est pas le cas, ajoute-le **avant** de mettre des secrets.

---

## Lire une variable : `process.env`

Dans n'importe quel code (Server Component, Server Action, Route Handler), on lit la variable avec `process.env` :

```ts
const dbUrl = process.env.DATABASE_URL;
```

Le type est `string | undefined` (TypeScript ne peut pas garantir qu'elle existe). Donc on vérifie :

```ts
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL n'est pas définie");
}
// ici, dbUrl est de type string
```

Pour les vrais projets, on centralise la lecture dans un fichier (par exemple `lib/env.ts`) avec un schéma Zod. Ça évite de se tromper de nom de variable partout.

---

## Le préfixe `NEXT_PUBLIC_`

**Très important** : par défaut, les variables sont **lues uniquement côté serveur**. Le visiteur n'y a pas accès. C'est ce qu'on veut pour les secrets.

Mais parfois, tu veux qu'une variable soit accessible côté client (par exemple, l'URL publique du site, l'ID d'analytics...). Il suffit de **préfixer** son nom par `NEXT_PUBLIC_` :

```
# .env.local
DATABASE_URL=postgres://...           ← serveur uniquement
NEXT_PUBLIC_SITE_URL=https://moi.com  ← accessible côté client
```

```tsx
// Composant client
"use client";

const url = process.env.NEXT_PUBLIC_SITE_URL;
```

**Attention** : tout ce qui est `NEXT_PUBLIC_` finit dans le JavaScript envoyé au navigateur. Ne mets **jamais** de secret avec ce préfixe.

Règle : si tu hésites, ne mets PAS le préfixe. Mieux vaut une variable serveur qu'une fuite.

---

## Bonne pratique : un fichier `.env.example`

Pour aider tes collaborateurs (ou toi-même dans 6 mois) à savoir quelles variables sont nécessaires, on crée un `.env.example` versionné dans Git, avec les **noms** mais pas les vraies valeurs :

```
# .env.example
DATABASE_URL=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Le nouveau contributeur fait `cp .env.example .env.local`, remplit les vraies valeurs, et c'est parti.

---

## Construire pour la production

En dev, on utilise `npm run dev` : c'est rapide à recharger, mais lent à servir, et plein d'outils de debug.

Pour la prod, on **construit** d'abord, puis on **sert** :

```bash
npm run build
npm start
```

### `npm run build` — qu'est-ce qui se passe ?

Next.js fait plein de choses :
1. **Compile** TypeScript en JavaScript.
2. **Optimise** les images, les fonts, le CSS.
3. **Pré-rend** les pages statiques en HTML.
4. **Génère** les `sitemap.xml`, `robots.txt`, etc.
5. **Vérifie** les types et l'ESLint.

Si tout va bien, il crée un dossier `.next/` avec le résultat optimisé.

### `npm start`

Lance un serveur Node.js qui sert le contenu du `.next/`. C'est ce qu'on déploie en prod.

Tu peux tester localement :
```bash
npm run build && npm start
```
Et ouvrir `http://localhost:3000`. **C'est la version qui ressemble à la prod**.

---

## Déploiement : Vercel (la voie simple)

[Vercel](https://vercel.com) est l'éditeur de Next.js. Leur plateforme déploie un projet Next.js en **3 clics**.

### Étapes

1. Pousse ton code sur GitHub.
2. Va sur [vercel.com](https://vercel.com), connecte-toi avec GitHub.
3. Clique "New Project", choisis ton dépôt.
4. Vercel détecte que c'est Next.js. Tu n'as **rien** à configurer.
5. Tu peux ajouter tes variables d'environnement dans l'UI (Settings → Environment Variables).
6. Clique "Deploy". 60 secondes plus tard, ton site est en ligne sur `mon-portfolio.vercel.app`.

### Bonus

- **Déploiements automatiques** : à chaque `git push`, Vercel redéploie.
- **Preview** par branche : chaque PR a sa propre URL pour tester.
- **HTTPS gratuit**, CDN mondial.
- **Custom domain** : tu achètes un nom (ex : `belal.dev`), tu le branches en 2 clics.

C'est gratuit pour des projets persos. Pour ton portfolio, c'est l'option idéale.

---

## Autres options de déploiement

### Docker

Tu construis une **image Docker** qui contient ton appli + ses dépendances. Tu la lances n'importe où (Fly.io, Railway, Render, ton propre serveur...).

```dockerfile
# Dockerfile (très simplifié)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Avantage : maximum de contrôle. Inconvénient : tu dois gérer toi-même les certificats, les redémarrages, etc.

### VPS / Serveur Linux

Tu loues une machine virtuelle (OVH, Hetzner, DigitalOcean), tu te connectes en SSH, tu installes Node.js, tu fais tourner ton appli avec `pm2` ou `systemd`. Tu ajoutes Nginx devant pour les certificats.

C'est exactement ce qu'on apprendra dans le **cours Linux** plus tard. Pour l'instant, retiens juste que c'est possible.

### Auto-hébergé

Si tu as un Raspberry Pi ou un serveur à la maison, tu peux y faire tourner Next.js. Mais il faut gérer la disponibilité, l'IP, le DNS... Pas idéal pour un portfolio à montrer aux recruteurs.

---

## Checklist avant de mettre en prod

Avant de partager l'URL avec le monde, vérifie :

- [ ] **Variables d'environnement** : toutes définies sur la plateforme de déploiement.
- [ ] **`.env.local` n'est PAS sur GitHub.**
- [ ] **Metadata** : titre, description, openGraph sur **chaque** page.
- [ ] **Favicon** : `app/favicon.ico` (ou `app/icon.tsx`) en place.
- [ ] **Images optimisées** : tu utilises `<Image>`, pas `<img>`.
- [ ] **Fonts** : via `next/font`, pas de `<link>` Google.
- [ ] **Pages d'erreur personnalisées** : `error.tsx`, `not-found.tsx`.
- [ ] **`sitemap.ts` et `robots.ts`** : configurés avec ta vraie URL.
- [ ] **`npm run build` passe sans erreur** localement.
- [ ] **Test des liens** : tu cliques partout, rien ne casse.
- [ ] **Mobile** : tu redimensionnes la fenêtre, ça reste joli.
- [ ] **Console du navigateur** : aucune erreur rouge.

Si tu coches tout, tu peux déployer la tête tranquille.

---

## TypeScript vu dans ce cours

### `string | undefined`

```ts
const cle: string | undefined = process.env.MA_CLE;
```

Une variable qui peut être présente ou absente. On doit toujours vérifier avant d'utiliser.

### Pattern de validation centralisé (avancé)

Pour les vrais projets, on centralise les variables avec Zod :

```ts
// lib/env.ts
import { z } from "zod";

const SchemaEnv = z.object({
  DATABASE_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export const env = SchemaEnv.parse(process.env);
```

Si une variable manque ou est invalide, l'application **plante au démarrage** avec un message clair, plutôt que d'échouer mystérieusement plus tard. Tu peux ensuite faire `import { env } from "@/lib/env"` partout, et `env.DATABASE_URL` est garanti `string`.

---

## Application sur le portfolio

### Étape 1 : créer `.env.example`

À la racine de `mon-premier-projet/` :

```
# .env.example
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Pour l'instant, on n'a pas de vraies variables sensibles. Mais on prépare le pattern.

### Étape 2 : créer `.env.local`

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Vérifie que `.env*` est bien dans le `.gitignore` (par défaut Next.js le met).

### Étape 3 : utiliser la variable dans `app/sitemap.ts`

Au lieu d'avoir l'URL en dur :

```ts
import type { MetadataRoute } from "next";
import { listerProjets } from "@/lib/projets";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  // ... reste identique en utilisant SITE_URL
}
```

Le `??` est l'opérateur de **fusion nullish** : si `process.env.NEXT_PUBLIC_SITE_URL` est `undefined`, on prend la valeur par défaut.

### Étape 4 : tester le build

```bash
cd mon-premier-projet
npm run build
```

Si ça passe sans erreur, tu peux lancer la version prod :

```bash
npm start
```

### Étape 5 : déployer (optionnel maintenant)

1. Crée un repo GitHub.
2. Pousse ton code (sans `.env.local`).
3. Va sur [vercel.com](https://vercel.com).
4. Importe ton repo.
5. Ajoute la variable `NEXT_PUBLIC_SITE_URL` dans les settings (avec ta vraie URL Vercel après le premier déploiement).
6. Tu obtiens un lien public. Tu peux le partager.

---

## Ce qu'on a appris dans tout le bloc Next.js

Récapitulatif de la formation :

1. C'est quoi Next.js, pourquoi.
2. Installation et structure du projet.
3. Pages et routing (App Router).
4. Composants et props.
5. CSS (global, modules, Tailwind).
6. Liens et navigation (`<Link>`, `usePathname`).
7. Server vs Client Components.
8. State et interactivité (`useState`, événements).
9. Formulaires et Server Actions (validation Zod).
10. Données et routes dynamiques (`[slug]`, `notFound`, `generateStaticParams`).
11. Metadata et SEO (`metadata`, `generateMetadata`, sitemap, robots).
12. Images et fonts (`<Image>`, `next/font`).
13. Loading, erreurs, not-found (`loading.tsx`, `error.tsx`, `not-found.tsx`).
14. Route Handlers (`route.ts`, vraies API HTTP).
15. Environnement et déploiement (variables, build, Vercel).

Tu as maintenant les bases pour construire **n'importe quel site** en Next.js. Les concepts qu'on a vus sont solides et durables.

---

## Et après ?

Le portfolio fonctionne. Mais il a deux limites majeures :
- Les messages de contact disparaissent au redémarrage.
- Les projets sont en dur dans le code.

Pour aller plus loin, on a besoin d'un **vrai backend** et d'une **vraie base de données**. C'est l'objet des prochains cours :

- **NestJS** : un backend Node.js sérieux, structuré, fait pour grossir.
- **Prisma** : pour parler à la base de données en TypeScript.
- **PostgreSQL** : la base de données relationnelle qu'on utilisera.
- **Linux** : pour comprendre où tout ça tourne en vrai.

À tout de suite dans NestJS !

---

## Résumé

- Les **secrets** se mettent dans `.env.local` (jamais sur Git).
- Les variables `NEXT_PUBLIC_*` sont accessibles côté client. Toutes les autres sont **serveur uniquement**.
- On lit avec `process.env.NOM`. Type : `string | undefined`.
- Pour la prod : `npm run build` puis `npm start`.
- **Vercel** est la solution la plus simple pour déployer (3 clics, gratuit pour le perso).
- Autres options : Docker, VPS Linux, auto-hébergé. Plus de contrôle, plus de boulot.
- Avant la prod : checklist (metadata, env, build qui passe, mobile, console clean).
- Pattern avancé : centraliser les variables avec Zod dans `lib/env.ts`.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 14 — Route Handlers et API interne](./14_route-handlers-et-api-interne.md)
- → Suivant : [Cours 01 — C'est quoi NestJS](../02_nestjs/01_cest-quoi-nestjs.md)
- Sommaire : [README](../README.md)
