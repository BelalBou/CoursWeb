# Cours 14 — Route Handlers et API interne

## Ce qu'on va voir
Comment créer une vraie **API HTTP** dans Next.js (les "Route Handlers"), à quoi ça sert quand on a déjà les Server Actions, et comment préparer le terrain pour le futur backend NestJS.

---

## Server Action vs Route Handler — quelle est la différence ?

Au cours 09, on a vu les **Server Actions**. Elles sont parfaites pour les formulaires de **ton site Next.js**.

Mais parfois, tu as besoin d'une vraie **URL d'API** (`/api/quelque-chose`) que **n'importe quoi peut appeler** :

- Une **app mobile** (React Native, Flutter) qui partage la même base.
- Un **webhook** (Stripe, GitHub) qui pingue ton serveur quand un événement arrive.
- Un script externe, un service tiers.
- Un autre site qui veut consommer tes données (avec une clé d'API).

Dans ces cas, on n'a pas de `<form>` Next.js. On a besoin d'une **vraie route HTTP**. C'est là que les **Route Handlers** entrent en jeu.

| | Server Action | Route Handler |
|---|---|---|
| Format | Fonction `async` | Endpoint HTTP (`GET`, `POST`...) |
| Appelée depuis | Composants Next.js (`<form>`, etc.) | Tout ce qui parle HTTP |
| Fichier | `actions.ts` | `route.ts` |
| Idéal pour | Formulaires, mutations internes | Webhooks, mobile, intégrations |

Règle simple :
- **Tu cliques dans ton site Next.js** → Server Action.
- **Quelqu'un d'extérieur appelle une URL** → Route Handler.

---

## La convention : un fichier `route.ts`

Dans le dossier `app/`, à côté des `page.tsx`, tu peux mettre un `route.ts`. Mais attention :

- **Tu ne peux pas avoir `page.tsx` ET `route.ts` dans le même dossier.** L'un sert l'UI, l'autre sert l'API. Donc on les sépare.
- Convention : on met l'API dans `app/api/...`. Par exemple `app/api/contact/route.ts`.

Structure type :

```
app/
├── page.tsx                ← /
├── contact/
│   ├── page.tsx            ← /contact (UI)
│   └── actions.ts          ← Server Actions (interne)
└── api/
    └── contact/
        └── route.ts        ← /api/contact (API HTTP)
```

---

## Définir un Route Handler

Dans `route.ts`, on **exporte une fonction par méthode HTTP** :

```ts
export async function GET(request: Request) {
  return Response.json({ message: "Bonjour" });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ recu: body }, { status: 201 });
}
```

Méthodes supportées : `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

### `Request` et `Response`

Ces types sont **standards du web** (Web API). Pas spécifiques à Next.js. Ça veut dire que ton code est portable.

- `request.json()` : parse le body JSON (renvoie une Promise).
- `request.url`, `request.headers`, `request.cookies` : tout ce qu'il faut.
- `Response.json(data, { status })` : helper pour retourner du JSON avec un code HTTP.

---

## Codes HTTP : le langage des API

Quelques codes qu'il faut connaître :

| Code | Signification | Quand l'utiliser |
|---|---|---|
| 200 | OK | Tout va bien (lecture) |
| 201 | Created | Ressource créée (POST réussi) |
| 400 | Bad Request | Le client a envoyé n'importe quoi |
| 401 | Unauthorized | Pas connecté |
| 403 | Forbidden | Connecté mais pas le droit |
| 404 | Not Found | La ressource n'existe pas |
| 500 | Internal Server Error | Le serveur plante |

---

## Routes dynamiques pour les API

Pareil que pour les pages : un dossier `[id]` crée une route dynamique.

```
app/api/projets/
├── route.ts                ← /api/projets (GET tous, POST nouveau)
└── [id]/
    └── route.ts            ← /api/projets/123 (GET un, PUT, DELETE)
```

### Le type `RouteContext`

Dans Next.js 16, on peut typer le second argument du handler avec `RouteContext<'/chemin/[id]'>` :

```ts
import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/api/projets/[id]'>
) {
  const { id } = await context.params;
  return Response.json({ id });
}
```

`RouteContext` est un type **global**, généré par Next.js pendant `next dev` ou `next build`. Tu n'as pas à l'importer.

Comme pour les pages, `params` est une **Promise** qu'il faut `await`.

---

## Valider l'entrée — toujours

Comme pour les Server Actions, on **ne fait jamais confiance** au body envoyé. On valide avec Zod.

```ts
import { z } from "zod";

const SchemaContact = z.object({
  nom: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const resultat = SchemaContact.safeParse(body);

  if (!resultat.success) {
    return Response.json(
      { erreurs: resultat.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // ... logique métier
  return Response.json({ ok: true }, { status: 201 });
}
```

Notes :
- `request.json().catch(() => null)` : si le body n'est pas du JSON valide, on récupère `null` au lieu de planter.
- `safeParse` ne throw pas, retourne un objet `{ success, data | error }`.
- En cas d'erreur, on retourne un **400** avec le détail.

---

## TypeScript vu dans ce cours

### Les types globaux générés

`RouteContext<'/api/projets/[id]'>` est un type **généré automatiquement** par Next.js depuis la structure de tes dossiers. Il connaît exactement les noms de paramètres ! Si tu te trompes (ex : `RouteContext<'/api/projets/[wrong]'>`), TypeScript te crie dessus.

Magique.

### `NextRequest` vs `Request`

`NextRequest` est une extension de la `Request` du web. Elle ajoute des helpers Next.js (cookies, geo, ip...). Pour des handlers simples, `Request` suffit.

```ts
import type { NextRequest } from "next/server";
```

### Le type `Response.json()`

`Response.json(data, init?)` retourne une `Response`. C'est le format standard. Pas de `res.send()` à la Express.

---

## Application sur le portfolio

On va créer `/api/contact` en POST, qui fait la même chose que la Server Action mais en route HTTP. **On garde la Server Action pour le formulaire interne.** L'API HTTP, c'est pour préparer le futur (mobile, webhooks, etc.).

### Étape 1 : `app/api/contact/route.ts`

```ts
import type { NextRequest } from "next/server";
import { z } from "zod";
import { ajouterMessage } from "@/lib/messages";

const SchemaContact = z.object({
  nom: z.string().trim().min(2, "Le nom doit avoir au moins 2 caractères"),
  email: z.string().trim().email("Email invalide"),
  message: z
    .string()
    .trim()
    .min(10, "Le message doit avoir au moins 10 caractères"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const resultat = SchemaContact.safeParse(body);

  if (!resultat.success) {
    return Response.json(
      {
        ok: false,
        erreurs: resultat.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const message = ajouterMessage(resultat.data);

  return Response.json(
    {
      ok: true,
      id: message.id,
    },
    { status: 201 }
  );
}
```

### Étape 2 : un endpoint GET pour lister les projets

```ts
// app/api/projets/route.ts
import { listerProjets } from "@/lib/projets";

export async function GET() {
  const projets = listerProjets();
  return Response.json({ projets });
}
```

### Étape 3 : un endpoint dynamique pour un projet précis

```ts
// app/api/projets/[slug]/route.ts
import type { NextRequest } from "next/server";
import { trouverProjet } from "@/lib/projets";

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/api/projets/[slug]'>
) {
  const { slug } = await context.params;
  const projet = trouverProjet(slug);

  if (!projet) {
    return Response.json(
      { ok: false, message: "Projet introuvable" },
      { status: 404 }
    );
  }

  return Response.json({ projet });
}
```

---

## Tester avec `curl`

Lance `npm run dev`, puis dans un autre terminal :

### Lister les projets

```bash
curl http://localhost:3000/api/projets
```

### Récupérer un projet précis

```bash
curl http://localhost:3000/api/projets/mon-portfolio
curl http://localhost:3000/api/projets/n-importe-quoi
```

### Envoyer un message valide

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nom":"Belal","email":"belal@example.com","message":"Salut, super site !"}'
```

### Envoyer un message invalide

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nom":"X","email":"pas-un-email","message":"trop court"}'
```

Tu reçois un 400 avec les erreurs détaillées.

---

## Pourquoi on prépare ça maintenant

Le but du cours, c'est d'aller vers **NestJS** comme vrai backend. Pour l'instant, l'API Next.js sert de "stub" :

- On apprend les conventions HTTP (méthodes, status codes, JSON).
- On structure le code pour pouvoir migrer.
- Quand NestJS sera prêt, on remplacera ces routes par des appels `fetch` vers l'API NestJS.

Vue d'ensemble future :

```
Front (Next.js)  →  Backend (NestJS)  →  Base (PostgreSQL via Prisma)
```

Pour l'instant on simule, et on apprend.

---

## Bonnes pratiques

- **Toujours valider** avec Zod (ou équivalent).
- **Codes HTTP corrects** : 200/201 succès, 400 erreur client, 404 introuvable, 500 panne serveur.
- **Pas de logique métier dans `route.ts`** : on appelle des fonctions de `lib/` ou de services. La route est juste la "porte d'entrée".
- **Authentification** : pour l'instant rien, mais une vraie API en prod aurait des tokens JWT, des clés d'API, etc.
- **CORS** : si l'API doit être appelée depuis un autre domaine, il faudra ajouter les headers CORS. Pour le moment, on est tous au même endroit.

---

## Résumé

- Un **Route Handler** est une vraie URL d'API, dans un fichier `route.ts`.
- On exporte une fonction par méthode HTTP : `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Convention : on les met dans `app/api/...`.
- Pour les routes dynamiques, le second argument est typé avec `RouteContext<'/chemin/[param]'>`. `params` est une **Promise** à `await`.
- On utilise `Request` / `Response` (Web API standard) ou `NextRequest`.
- On valide **toujours** le body avec Zod et on renvoie 400 si invalide.
- **Server Action** pour les formulaires Next.js, **Route Handler** pour les usages externes (mobile, webhooks, autres services).
- C'est un bon entraînement avant NestJS.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 13 — Loading, erreurs et not-found](./13_loading-erreurs-not-found.md)
- → Suivant : [Cours 15 — Environnement et déploiement](./15_environnement-et-deploiement.md)
- Sommaire : [README](../README.md)
