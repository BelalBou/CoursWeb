# Cours 10 — Données et routes dynamiques

## Ce qu'on va voir
Comment afficher une liste de "projets" dans le portfolio, et comment faire pour que chaque projet ait sa propre page (par exemple `/projets/portfolio`, `/projets/site-restaurant`...).

---

## Le but

Aujourd'hui, le portfolio a deux pages : `/` et `/contact`. On va ajouter :

- `/projets` — la liste de tous les projets.
- `/projets/[slug]` — la page de détail d'un projet précis.

Le `[slug]` est une **route dynamique**. C'est-à-dire qu'au lieu d'écrire à la main une page par projet, on en écrit **une seule** qui s'adapte automatiquement.

---

## C'est quoi un "slug" ?

Un **slug** est une version courte et propre du titre, utilisée dans l'URL. Par exemple :

| Titre du projet | Slug |
|---|---|
| "Mon super portfolio" | `mon-super-portfolio` |
| "Site pour Le Mama Kitchen" | `site-le-mama-kitchen` |

Règles d'un slug :
- Minuscules.
- Pas d'espaces (on remplace par `-`).
- Pas d'accents ni de caractères spéciaux.

C'est l'URL "humaine" et amicale pour le SEO.

---

## Les routes dynamiques avec `[...]`

En Next.js, le nom du dossier entre crochets devient un **paramètre dynamique**.

```
app/
└── projets/
    ├── page.tsx              ← /projets
    └── [slug]/
        └── page.tsx          ← /projets/n-importe-quoi
```

Quand quelqu'un visite `/projets/mon-portfolio`, Next.js :
1. Trouve le dossier `app/projets/[slug]/page.tsx`.
2. Stocke `"mon-portfolio"` dans le paramètre `slug`.
3. Te donne ce paramètre via les `params` du composant.

---

## Récupérer les `params` (Next.js 16)

**Important** : depuis Next.js 15+, `params` est une **Promise**. Il faut donc le `await`.

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Projet : {slug}</h1>;
}
```

Pourquoi une Promise ? Parce que Next.js peut décider de calculer les params de manière asynchrone (par exemple à cause d'une optimisation de cache). On `await` simplement, c'est tout.

À retenir :
- La page elle-même devient `async` (`export default async function`).
- Le type est `params: Promise<{ slug: string }>`.
- Premier ligne : `const { slug } = await params;`.

---

## Stocker les données : `lib/projets.ts`

Pour l'instant, on n'a pas encore de base de données. On va donc mettre les projets dans un simple fichier TypeScript, qui exportera un tableau typé.

C'est volontairement structuré :
- Le **type** `Projet` est défini une fois.
- Les **fonctions d'accès** (`listerProjets`, `trouverProjet`) sont nommées et typées.
- Plus tard, quand on branchera Prisma, on changera juste l'**implémentation** des fonctions. Le reste du code n'aura pas besoin de bouger.

---

## Le helper `notFound()`

Si quelqu'un visite `/projets/projet-inexistant`, on veut afficher une erreur "Page non trouvée" propre. Next.js fournit un helper :

```ts
import { notFound } from "next/navigation";

if (!projet) {
  notFound();
}
```

Quand `notFound()` est appelée, Next.js affiche automatiquement une page 404. On peut personnaliser cette page avec un fichier `not-found.tsx` (on verra ça au cours 13).

---

## `generateStaticParams` : pré-fabriquer les pages

Imaginons qu'on a 5 projets. Plutôt que de générer chaque page **à la demande** (au moment où un visiteur arrive), Next.js peut **pré-fabriquer** les 5 pages en HTML statique pendant le build.

Avantages :
- Pages servies instantanément.
- Pas de calcul à la volée.
- Mieux pour le SEO.

Pour faire ça, on exporte une fonction `generateStaticParams` depuis la page dynamique :

```ts
export async function generateStaticParams() {
  return [
    { slug: "portfolio" },
    { slug: "site-restaurant" },
  ];
}
```

Next.js voit ça pendant le build et fabrique `/projets/portfolio` et `/projets/site-restaurant` en avance.

---

## TypeScript vu dans ce cours

### `Promise<T>` en paramètre

```ts
params: Promise<{ slug: string }>
```

On dit "params est une promesse qui finira par donner un objet `{ slug: string }`".

### `readonly T[]`

```ts
export function listerProjets(): readonly Projet[]
```

Le `readonly` empêche d'appeler `.push()` ou `.splice()` sur le résultat. Ça évite que quelqu'un modifie par erreur la "base" depuis l'extérieur.

### Les types narrowing avec `find`

```ts
const projet = projets.find((p) => p.slug === slug);
// projet est de type Projet | undefined
```

`find` peut ne rien trouver, donc TypeScript dit que le résultat est soit `Projet`, soit `undefined`. Il faut ensuite **narrower** (rétrécir) le type :

```ts
if (!projet) {
  notFound();
}
// après ce if, TypeScript sait que projet est forcément de type Projet
```

`notFound()` lance une exception, donc le code après le `if` ne s'exécute que si `projet` existe. TypeScript le comprend.

---

## Application sur le portfolio

### Étape 1 : `lib/projets.ts`

```ts
export type Projet = {
  id: string;
  slug: string;
  titre: string;
  description: string;
  technos: readonly string[];
};

const PROJETS: readonly Projet[] = [
  {
    id: "1",
    slug: "mon-portfolio",
    titre: "Mon portfolio",
    description:
      "Le site que tu lis en ce moment. Construit avec Next.js, TypeScript et Tailwind CSS.",
    technos: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "2",
    slug: "carnet-de-recettes",
    titre: "Carnet de recettes",
    description:
      "Une petite app pour stocker mes recettes préférées. Avec recherche et catégories.",
    technos: ["Next.js", "Prisma", "PostgreSQL"],
  },
  {
    id: "3",
    slug: "tableau-de-bord",
    titre: "Tableau de bord",
    description:
      "Un dashboard pour visualiser mes statistiques quotidiennes (sport, lecture, code).",
    technos: ["Next.js", "NestJS", "Chart.js"],
  },
];

export function listerProjets(): readonly Projet[] {
  return PROJETS;
}

export function trouverProjet(slug: string): Projet | undefined {
  return PROJETS.find((projet) => projet.slug === slug);
}

export function listerSlugs(): readonly string[] {
  return PROJETS.map((projet) => projet.slug);
}
```

### Étape 2 : la page liste `app/projets/page.tsx`

```tsx
import Link from "next/link";
import { listerProjets } from "@/lib/projets";

export default function ProjetsPage() {
  const projets = listerProjets();

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes projets</h1>
        <p className="text-gray-500 mb-10">
          Voici une sélection des projets que je construis pendant ma formation.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projets.map((projet) => (
            <li key={projet.id}>
              <Link
                href={`/projets/${projet.slug}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-gray-900 transition-colors"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {projet.titre}
                </h2>
                <p className="text-gray-500 mb-4">{projet.description}</p>
                <div className="flex flex-wrap gap-2">
                  {projet.technos.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
```

### Étape 3 : la page détail `app/projets/[slug]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { listerSlugs, trouverProjet } from "@/lib/projets";

export async function generateStaticParams() {
  return listerSlugs().map((slug) => ({ slug }));
}

export default async function ProjetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projet = trouverProjet(slug);

  if (!projet) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/projets"
          className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block"
        >
          ← Retour aux projets
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {projet.titre}
        </h1>
        <p className="text-lg text-gray-600 mb-6">{projet.description}</p>

        <div className="flex flex-wrap gap-2">
          {projet.technos.map((tech) => (
            <span
              key={tech}
              className="text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
```

### Étape 4 : ajouter "Projets" dans la Navbar

Modifier la constante `LIENS` dans `components/Navbar.tsx` :

```tsx
const LIENS: LienNav[] = [
  { href: "/", libelle: "Accueil" },
  { href: "/projets", libelle: "Projets" },
  { href: "/contact", libelle: "Contact" },
];
```

---

## Tester

1. `npm run dev`.
2. Va sur `/projets` → tu vois les 3 cartes.
3. Clique sur une carte → tu arrives sur `/projets/mon-portfolio` (par exemple).
4. Va manuellement sur `/projets/n-importe-quoi` → tu vois la page 404 par défaut de Next.js.
5. Le préfetching fait que la navigation est instantanée.

---

## Pourquoi cette structure est "production-ready"

- **Une seule source de vérité** : tous les projets dans `lib/projets.ts`. Si on en ajoute un, il apparaît partout (liste, navbar dynamique si on voulait, sitemap...).
- **Fonctions nommées** (`listerProjets`, `trouverProjet`) : on peut les réutiliser depuis n'importe où dans le code.
- **Types stricts** : impossible de se tromper de champ.
- **Slug-based** : URL propres et SEO-friendly.
- **Prêt pour Prisma** : quand on aura une base, on remplacera juste l'implémentation des fonctions par des requêtes SQL. Le reste du code (pages, composants) ne bougera pas.

---

## Résumé

- Un dossier `[slug]` crée une **route dynamique**.
- Dans Next.js 16, `params` est une **Promise**, on doit `await` : `const { slug } = await params;`.
- La page est **async** (`export default async function`).
- `notFound()` de `next/navigation` affiche une 404.
- `generateStaticParams` permet de **pré-fabriquer** les pages au build pour la performance.
- On structure ses données dans `lib/...ts` avec un type, une constante et des fonctions d'accès. Ça facilite la migration vers une base de données.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 09 — Formulaires et Server Actions](./09_formulaires-et-server-actions.md)
- → Suivant : [Cours 11 — Metadata et SEO](./11_metadata-et-seo.md)
- Sommaire : [README](../README.md)
