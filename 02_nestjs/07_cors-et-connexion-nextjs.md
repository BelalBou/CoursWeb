# Cours 07 — CORS et connexion avec Next.js

## Ce qu'on va voir
Faire **parler ton portfolio Next.js avec ton backend NestJS**. Comprendre CORS, configurer NestJS pour autoriser le frontend, et brancher les fetchs côté Next.js.

---

## C'est quoi CORS ?

**CORS** = **Cross-Origin Resource Sharing** ("partage de ressources entre origines").

### Analogie : la douane entre deux pays

Imagine que ton frontend est dans le pays **France** (`http://localhost:3000`) et ton backend est dans le pays **Belgique** (`http://localhost:3001`).

Ton navigateur, c'est un **douanier sévère**. Quand le frontend français veut envoyer un courrier en Belgique, le douanier dit :

> "Stop. Le pays Belgique a-t-il **autorisé** le pays France à lui envoyer des choses ?"

Si la Belgique n'a pas signé d'accord, le douanier **bloque** le courrier.

CORS, c'est le **traité de douane** : le backend doit dire explicitement "j'accepte les demandes venant de cette origine".

### Ce qui définit une "origine"

Une origine = **protocole + nom de domaine + port**.

- `http://localhost:3000` est une origine.
- `http://localhost:3001` est une **autre** origine (port différent).
- `https://monsite.com` est une autre origine encore.

Comme ton frontend est sur `:3000` et ton backend sur `:3001`, ce sont deux origines différentes : il **faut** configurer CORS.

---

## Activer CORS dans NestJS

Modifie `src/main.ts` :

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = 3001;
  await app.listen(port);
  console.log(`Backend lancé sur http://localhost:${port}`);
}

void bootstrap();
```

Décortiquons les options :

- **`origin`** : un tableau des origines autorisées. **Toujours lister explicitement**. Ne mets **jamais** `'*'` en production.
- **`methods`** : les méthodes HTTP autorisées.
- **`credentials: true`** : autorise l'envoi de cookies / d'en-têtes d'authentification. Utile plus tard pour la connexion utilisateur.

---

## Tester que CORS fonctionne

Lance le backend (`npm run start:dev` dans `mon-backend/`).

Ouvre la console du navigateur sur n'importe quelle page de ton portfolio Next.js (F12 → Console), puis tape :

```javascript
fetch('http://localhost:3001/projets').then((r) => r.json()).then(console.log);
```

Si tu vois la liste des projets, **bingo, CORS est OK**. Si tu vois une erreur rouge "blocked by CORS policy", reviens à `main.ts` vérifier la config.

---

## Côté Next.js : aller chercher les projets sur le backend

Tu te souviens du fichier `lib/projets.ts` dans `mon-premier-projet/`, qui contenait le tableau de projets en dur ? On le remplace par un appel au backend.

À partir de ce moment, `mon-premier-projet` dépend du backend pour afficher `/projets`. Les pages projets ne sont donc plus préfabriquées au build comme dans le cours Next.js 10 : elles deviennent **dynamiques** et lisent NestJS au moment de la requête.

Avant :

```typescript
export const projets = [
  { slug: 'portfolio', titre: 'Portfolio', /* ... */ },
];

export function getProjets() {
  return projets;
}

export function getProjetParSlug(slug: string) {
  return projets.find((p) => p.slug === slug);
}
```

Après :

```typescript
export interface Projet {
  slug: string;
  titre: string;
  description: string;
  technologies: string[];
  lien: string;
}

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getProjets(): Promise<Projet[]> {
  const response = await fetch(`${API_URL}/projets`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error('Impossible de charger les projets');
  }
  return response.json() as Promise<Projet[]>;
}

export async function getProjetParSlug(slug: string): Promise<Projet | null> {
  const response = await fetch(`${API_URL}/projets/${slug}`, {
    next: { revalidate: 60 },
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Erreur lors du chargement du projet');
  }
  return response.json() as Promise<Projet>;
}
```

Dans `app/projets/page.tsx`, remplace `listerProjets()` par `await getProjets()` et rends la page `async` :

```tsx
import { getProjets } from '@/lib/projets';

export const dynamic = 'force-dynamic';

export default async function ProjetsPage() {
  const projets = await getProjets();
  // ... le JSX reste presque identique
}
```

Dans `app/projets/[slug]/page.tsx`, remplace `trouverProjet(slug)` par `await getProjetParSlug(slug)`. Supprime aussi `generateStaticParams` et `dynamicParams = false`, car les slugs viennent maintenant du backend :

```tsx
import { notFound } from 'next/navigation';
import { getProjetParSlug } from '@/lib/projets';

export const dynamic = 'force-dynamic';

export default async function ProjetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projet = await getProjetParSlug(slug);

  if (!projet) {
    notFound();
  }

  // ... JSX
}
```

Dans le JSX, pense aussi à utiliser `projet.technologies` au lieu de l'ancien champ local `projet.technos`.

Quelques points importants :

### `process.env.API_URL`
On lit l'URL du backend dans une **variable d'environnement** au lieu de l'écrire en dur. Ça permet de mettre une autre URL en production (`https://api.monsite.com` par exemple). On verra ça en détail au cours 08 côté backend.

### `??`
L'opérateur **nullish coalescing** : si `process.env.API_URL` n'est pas défini, on prend `'http://localhost:3001'`. C'est plus propre que `||` qui considère aussi `''` ou `0` comme "vide".

### `next: { revalidate: 60 }`
Une option propre à Next.js : "réutilise la réponse mise en cache pendant 60 secondes". Pratique pour éviter de marteler le backend.

### `as Promise<Projet[]>`
Une **assertion de type**. On dit à TypeScript "fais-moi confiance, le JSON est bien un tableau de `Projet`". À éviter sauf quand on est sûr.

---

## Brancher les pages

Si tu utilises `getProjets()` dans une **Server Component** (par défaut dans le App Router de Next.js), c'est super simple :

```tsx
import { getProjets } from '@/lib/projets';

export default async function PageProjets() {
  const projets = await getProjets();

  return (
    <ul>
      {projets.map((p) => (
        <li key={p.slug}>{p.titre}</li>
      ))}
    </ul>
  );
}
```

Le composant est **`async`**. Next.js attend que le fetch soit fini, génère la page côté serveur, et envoie du HTML déjà rempli. Le client n'a même pas à attendre.

---

## Côté Next.js : envoyer le formulaire de contact

Ton formulaire de contact doit maintenant **vraiment** envoyer les données au backend.

Si tu avais encore la Server Action Next.js du cours 09 (`app/contact/actions.ts`) ou l'ancien stockage local `lib/messages.ts`, ils ne sont plus nécessaires pour ce flux. Le formulaire envoie maintenant directement vers NestJS.

Dans le composant client de la page `/contact`, le `onSubmit` fait :

```typescript
'use client';

import { useState } from 'react';

export default function FormulaireContact() {
  const [statut, setStatut] = useState<'idle' | 'envoi' | 'ok' | 'erreur'>('idle');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatut('envoi');

    const data = new FormData(event.currentTarget);
    const payload = {
      nom: data.get('nom'),
      email: data.get('email'),
      message: data.get('message'),
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Échec envoi');
      }

      setStatut('ok');
    } catch {
      setStatut('erreur');
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {/* tes champs */}
    </form>
  );
}
```

---

## Pourquoi `API_URL` ET `NEXT_PUBLIC_API_URL` ?

Deux variables différentes :

| Variable | Où elle est lue | Pourquoi |
|---|---|---|
| `API_URL` | **Côté serveur** (Server Component, `getProjets`) | Reste secrète, n'est jamais envoyée au navigateur. |
| `NEXT_PUBLIC_API_URL` | **Côté navigateur** (composant client, `'use client'`) | Le préfixe `NEXT_PUBLIC_` dit à Next.js : "tu peux exposer cette variable au client". |

Côté serveur on peut éventuellement utiliser une URL interne plus rapide. Côté client, c'est l'URL publique du backend.

Crée `.env.local` à la racine de `mon-premier-projet/` :

```
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important** : `.env.local` ne doit **jamais** être commité dans Git. Ajoute-le à `.gitignore` (Next.js le fait normalement par défaut).

---

## TypeScript vu dans ce cours

- **`Promise<Projet[]>`** : une promesse qui contient un tableau de `Projet`.
- **`??` (nullish coalescing)** : valeur par défaut si la variable est `null` ou `undefined`.
- **`as Promise<Projet>`** : assertion de type. À utiliser avec parcimonie.
- **`React.FormEvent<HTMLFormElement>`** : le type de l'événement de soumission d'un formulaire.

---

## Application sur le projet

Tu as :
- Activé `enableCors` dans `main.ts` du backend, en autorisant `http://localhost:3000`.
- Remplacé le tableau en dur de `lib/projets.ts` par des fetchs sur `http://localhost:3001/projets`.
- Rendu les pages `/projets` dynamiques côté Next.js, parce que les données viennent maintenant du backend.
- Modifié le formulaire de contact pour faire un `POST` sur `/messages`.
- Créé un `.env.local` avec `API_URL` et `NEXT_PUBLIC_API_URL`.

Lance les **deux serveurs en parallèle** (deux terminaux ouverts) :
- Dans `mon-premier-projet/` : `npm run dev`
- Dans `mon-backend/` : `npm run start:dev`

Et ton portfolio est officiellement connecté à un vrai backend.

---

## Résumé

- **CORS** = douane qui demande au backend "tu autorises cette origine ?".
- `app.enableCors({ origin: [...], methods: [...], credentials: true })` règle ça côté NestJS.
- Côté Next.js, on remplace les données en dur par `fetch('http://localhost:3001/...')`.
- Variables d'environnement : `API_URL` côté serveur, `NEXT_PUBLIC_API_URL` côté navigateur.
- Ne jamais commiter `.env.local`.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 06 — Gestion des erreurs](./06_gestion-erreurs.md)
- → Suivant : [Cours 08 — Configuration et environnement](./08_config-et-environnement.md)
- Sommaire : [README](../README.md)
