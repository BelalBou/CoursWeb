# Cours 13 — Loading, erreurs et not-found

## Ce qu'on va voir
Comment afficher un beau **chargement** pendant qu'une page se prépare, comment **rattraper les erreurs** sans crasher, et comment offrir une **page 404** sympa quand l'URL n'existe pas.

---

## Les trois fichiers magiques

Next.js 16 reconnaît trois fichiers spéciaux dans n'importe quel dossier de route :

| Fichier | À quoi ça sert |
|---|---|
| `loading.tsx` | Affiché pendant que la page charge |
| `error.tsx` | Affiché si la page plante (exception) |
| `not-found.tsx` | Affiché si on appelle `notFound()` ou si la route n'existe pas |

Chacun s'applique automatiquement à la route et à ses sous-routes. C'est très pratique.

---

## `loading.tsx` : le squelette de chargement

Quand un visiteur navigue vers une page qui prend du temps à se préparer (par exemple parce qu'elle attend une base de données), Next.js peut afficher **immédiatement** un placeholder en attendant.

### Exemple simple

```tsx
// app/projets/loading.tsx
export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mb-10" />
      </div>
    </main>
  );
}
```

Tant que la page `/projets` n'est pas prête, le visiteur voit ces blocs gris qui pulsent. C'est instantané, et ça donne l'impression que ça réagit.

### Comment ça marche en interne

Next.js enveloppe automatiquement la `page.tsx` dans une `<Suspense>` boundary, dont le `fallback` est le `loading.tsx`. **C'est du streaming React** : le serveur envoie le squelette d'abord, puis le contenu quand il est prêt.

Tu peux aussi mettre `<Suspense>` à la main, autour d'un sous-composant lent :

```tsx
import { Suspense } from "react";
import ListeProjets from "@/components/ListeProjets";

export default function Page() {
  return (
    <main>
      <h1>Projets</h1>
      <Suspense fallback={<p>Chargement de la liste...</p>}>
        <ListeProjets />
      </Suspense>
    </main>
  );
}
```

Ça permet d'afficher le titre tout de suite, et de streamer la liste plus tard.

---

## `error.tsx` : rattraper les exceptions

Si une page plante (par exemple, la base de données est tombée, ou un `throw` dans le code), Next.js affiche par défaut une page d'erreur basique. Tu peux la **personnaliser** avec un `error.tsx`.

### Exemple

```tsx
// app/projets/error.tsx
"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Oups, quelque chose a planté
        </h1>
        <p className="text-gray-500 mb-6">
          On a noté l'erreur. Tu peux essayer de recharger.
        </p>
        <button
          onClick={() => reset()}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}
```

### Points importants

- **`"use client"` est obligatoire** : `error.tsx` doit être un Client Component, parce qu'il utilise un événement (`onClick`) et React doit pouvoir le réafficher après l'erreur.
- `error` est l'erreur attrapée. Tu peux la logger, l'envoyer à Sentry, etc.
- `reset()` redéclenche le rendu de la page. Si l'erreur était passagère (réseau qui revient), ça repart.

### Erreurs attendues vs exceptions

C'est un point philosophique important :

- **Erreur attendue** (ex : email invalide dans un formulaire). On la **retourne** comme un état (`return { ok: false, message: "..." }`). C'est **pas une exception**.
- **Exception** (ex : la base de données est tombée). C'est un `throw`. C'est imprévu, c'est `error.tsx` qui la gère.

Règle simple : si tu peux **prévoir** le cas, tu **return** un état. Si c'est imprévu, tu **throw**.

---

## `not-found.tsx` : la page 404

Quand quelqu'un visite `/projets/n-importe-quoi-faux`, on a appelé `notFound()` au cours 10. Par défaut, Next.js affiche une page 404 basique. On peut la personnaliser.

### Exemple

```tsx
// app/projets/[slug]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-gray-500 mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Projet introuvable
        </h1>
        <p className="text-gray-500 mb-6">
          Ce projet n'existe pas (ou plus). Reviens à la liste pour en voir
          d'autres.
        </p>
        <Link
          href="/projets"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
        >
          Voir tous les projets
        </Link>
      </div>
    </main>
  );
}
```

### Variantes

- **Un seul `not-found.tsx` global** dans `app/` : s'applique à toutes les URLs qui n'existent pas et toutes les routes qui appellent `notFound()`.
- **Un `not-found.tsx` spécifique** dans `app/projets/[slug]/` : s'applique uniquement aux 404 de cette branche.

On peut combiner les deux. Le plus spécifique gagne.

---

## TypeScript vu dans ce cours

### Type intersection avec `&`

```ts
error: Error & { digest?: string }
```

Ce type combine deux types :
- `Error` (le type natif JavaScript pour les erreurs).
- `{ digest?: string }` (un identifiant facultatif que Next.js ajoute parfois).

Le `&` veut dire "les deux à la fois". `error` est donc une `Error` avec **en plus** un `digest` optionnel.

### Le type d'une fonction sans argument et sans retour

```ts
reset: () => void;
```

Ça décrit une fonction qui ne prend rien et ne retourne rien (ou rien d'utile). C'est très courant pour les callbacks.

---

## Application sur le portfolio

### Étape 1 : `app/projets/loading.tsx`

```tsx
export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mb-10" />

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
```

### Étape 2 : `app/projets/error.tsx`

```tsx
"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-red-600 mb-2">Erreur</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          On n'a pas pu charger les projets
        </h1>
        <p className="text-gray-500 mb-2">
          Quelque chose a planté. Réessaie dans un instant.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6">
            Référence : {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}
```

### Étape 3 : `app/projets/[slug]/not-found.tsx`

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-gray-500 mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Projet introuvable
        </h1>
        <p className="text-gray-500 mb-6">
          Ce projet n'existe pas (ou plus). Reviens à la liste pour en voir
          d'autres.
        </p>
        <Link
          href="/projets"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
        >
          Voir tous les projets
        </Link>
      </div>
    </main>
  );
}
```

### Étape 4 (optionnel) : un `not-found.tsx` global

Pour gérer les vraies URL inexistantes (`/super-page-qui-existe-pas`), on peut ajouter `app/not-found.tsx` au niveau racine :

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-gray-500 mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Page introuvable
        </h1>
        <p className="text-gray-500 mb-6">
          Cette page n'existe pas. Voici de quoi rebondir.
        </p>
        <Link
          href="/"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
```

---

## Tester

1. `npm run dev`.
2. Va sur `/projets`. En dev local, c'est rapide donc le squelette est à peine visible. En production avec une vraie base, ça serait flagrant. Pour simuler, ajoute temporairement dans `lib/projets.ts` une fonction qui attend :
   ```ts
   export async function listerProjetsAsync(): Promise<readonly Projet[]> {
     await new Promise((resolve) => setTimeout(resolve, 1500));
     return PROJETS;
   }
   ```
   Et utilise-la dans la page (`const projets = await listerProjetsAsync();` avec page async). Tu verras le squelette pendant 1.5s.
3. Va sur `/projets/n-importe-quoi-faux` → ta page "Projet introuvable" personnalisée.
4. Pour tester `error.tsx`, jette une erreur exprès dans la page :
   ```ts
   if (Math.random() < 0.5) throw new Error("Test");
   ```
   La moitié du temps, tu verras la page d'erreur.

---

## Bonnes pratiques

- **Squelette qui ressemble au contenu final.** Garde la même structure (ex : 4 cartes grises = 4 vraies cartes après).
- **`error.tsx` ne révèle pas de détails sensibles.** En prod, le message technique est masqué. On affiche un message humain.
- **`not-found.tsx` propose toujours une issue.** Un lien vers la liste, l'accueil, ou la barre de recherche.
- **Loggue les erreurs** pour les analyser (Sentry, Vercel Logs...). On verra ça en déploiement.

---

## Résumé

- `loading.tsx` est affiché pendant que la page se prépare. Streaming automatique via Suspense.
- `error.tsx` (avec `"use client"`) attrape les exceptions. Reçoit `error` et `reset`.
- `not-found.tsx` personnalise la page 404, soit globalement, soit pour une route précise.
- Erreur **attendue** = on retourne un état. Erreur **inattendue** = on `throw` et le boundary la rattrape.
- On peut aussi utiliser `<Suspense>` à la main pour streamer un sous-composant.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 12 — Images et fonts](./12_images-et-fonts.md)
- → Suivant : [Cours 14 — Route Handlers et API interne](./14_route-handlers-et-api-interne.md)
- Sommaire : [README](../README.md)
