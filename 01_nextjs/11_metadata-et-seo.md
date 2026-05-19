# Cours 11 — Metadata et SEO

## Ce qu'on va voir
Comment donner un **titre**, une **description** et une **belle prévisualisation** à chaque page de ton site, pour Google et pour les réseaux sociaux.

---

## C'est quoi les "metadata" ?

Quand tu visites un site, le navigateur affiche dans l'onglet :
- Une **icône** (le petit logo).
- Un **titre** (le texte dans l'onglet).

Quand tu colles un lien sur WhatsApp, Twitter, Facebook ou Discord, ça affiche automatiquement :
- Une **image** de prévisualisation.
- Un titre.
- Une description.

Tout ça vient des **metadata** : des informations cachées dans le `<head>` du HTML, que les robots, navigateurs et réseaux sociaux lisent.

Analogie : les metadata, c'est la **couverture de ton livre**. Les gens décident de l'ouvrir (cliquer) en fonction de ce qu'ils voient sur la couverture.

---

## Les balises HTML classiques

Avant Next.js, on écrivait à la main dans le `<head>` :

```html
<title>Mon portfolio</title>
<meta name="description" content="Le portfolio de Belal" />
<meta property="og:title" content="..." />
<meta property="og:image" content="..." />
<meta name="twitter:card" content="summary_large_image" />
```

C'est verbeux, c'est facile de se tromper. Next.js a une approche plus simple : **on exporte une variable `metadata` depuis chaque page**.

---

## L'export `metadata` (statique)

Dans n'importe quel `page.tsx` ou `layout.tsx`, tu peux faire :

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes projets",
  description: "Voici les projets que je construis pendant ma formation.",
};

export default function Page() {
  return <h1>Projets</h1>;
}
```

Next.js lit cet export automatiquement et génère les bonnes balises HTML.

Le type `Metadata` vient de Next.js. Il décrit toutes les options disponibles (titre, description, openGraph, twitter, robots, icons...).

---

## L'héritage : layout puis page

Les metadata se cumulent. Le `layout.tsx` définit les **valeurs par défaut**, chaque `page.tsx` peut **les surcharger**.

Exemple :

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: "Portfolio de Belal",
  description: "Développeur web en formation.",
};
```

```tsx
// app/contact/page.tsx
export const metadata: Metadata = {
  title: "Contact — Portfolio de Belal",
};
```

Sur `/contact`, le titre devient "Contact — Portfolio de Belal", et la description héritée du layout reste.

---

## Le pattern `title.template`

Pour ne pas réécrire "— Portfolio de Belal" à chaque page, Next.js a un pattern élégant :

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "Portfolio de Belal",
    template: "%s — Portfolio de Belal",
  },
  description: "Développeur web en formation.",
};
```

```tsx
// app/contact/page.tsx
export const metadata: Metadata = {
  title: "Contact",
};
```

Résultat : le titre devient `"Contact — Portfolio de Belal"`. Le `%s` est remplacé par le titre de la page.

---

## Open Graph et Twitter Cards

Pour les réseaux sociaux, on ajoute `openGraph` et `twitter` :

```tsx
export const metadata: Metadata = {
  title: "Portfolio de Belal",
  description: "Développeur web en formation.",
  openGraph: {
    title: "Portfolio de Belal",
    description: "Développeur web en formation.",
    url: "https://mon-portfolio.com",
    siteName: "Portfolio de Belal",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio de Belal",
    description: "Développeur web en formation.",
  },
};
```

---

## `generateMetadata` : metadata dynamiques

Pour une page comme `/projets/[slug]`, on ne peut pas écrire le titre en dur — il dépend du projet. Next.js fournit alors une fonction async `generateMetadata` :

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projet = trouverProjet(slug);

  if (!projet) {
    return { title: "Projet introuvable" };
  }

  return {
    title: projet.titre,
    description: projet.description,
  };
}
```

Cette fonction reçoit les `params` (comme la page) et doit retourner un objet `Metadata`.

---

## L'icône du site (favicon)

Le **favicon** est l'icône qui s'affiche dans l'onglet du navigateur.

Deux options :
1. Mettre un fichier `app/favicon.ico` (ou `app/icon.png`). Next.js le sert tout seul.
2. Créer un fichier `app/icon.tsx` qui génère dynamiquement une icône (image de code).

Pour notre portfolio, on garde simple : un `favicon.ico` à la racine d'`app/` suffit. Il y en a déjà un par défaut quand on `create-next-app`.

---

## `robots.txt` et `sitemap.ts`

Pour que Google trouve toutes tes pages, deux fichiers utiles :

### `app/robots.ts`

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://mon-portfolio.com/sitemap.xml",
  };
}
```

### `app/sitemap.ts`

```ts
import type { MetadataRoute } from "next";
import { listerProjets } from "@/lib/projets";

const SITE_URL = "https://mon-portfolio.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly" },
    { url: `${SITE_URL}/projets`, changeFrequency: "weekly" },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly" },
  ];

  const pagesProjets: MetadataRoute.Sitemap = listerProjets().map((projet) => ({
    url: `${SITE_URL}/projets/${projet.slug}`,
    changeFrequency: "monthly",
  }));

  return [...pagesStatiques, ...pagesProjets];
}
```

Next.js générera automatiquement `/robots.txt` et `/sitemap.xml` à partir de ces fichiers.

---

## TypeScript vu dans ce cours

### Importer un type avec `import type`

```ts
import type { Metadata } from "next";
```

`import type` indique à TypeScript que c'est juste un type, pas du code. C'est plus propre et ça aide à l'optimisation des bundles.

### `Promise<Metadata>` en retour

```ts
export async function generateMetadata(...): Promise<Metadata>
```

Une fonction `async` retourne toujours une Promise. On précise le type pour la clarté.

### L'opérateur de spread `...`

```ts
return [...pagesStatiques, ...pagesProjets];
```

Le `...` étale les éléments d'un tableau dans un autre. On combine les deux listes.

---

## Application sur le portfolio

### Étape 1 : `app/layout.tsx`

On ajoute les metadata par défaut :

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "Portfolio de Belal",
    template: "%s — Portfolio de Belal",
  },
  description:
    "Développeur web en formation. Je construis des projets avec Next.js, NestJS et bien plus.",
  openGraph: {
    title: "Portfolio de Belal",
    description:
      "Développeur web en formation. Je construis des projets avec Next.js, NestJS et bien plus.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

### Étape 2 : `app/page.tsx` (accueil)

L'accueil utilise le titre par défaut, mais on précise une description spécifique :

```tsx
import type { Metadata } from "next";
import Bouton from "@/components/Bouton";

export const metadata: Metadata = {
  description:
    "Bonjour, je suis Belal. Découvre mes projets et mon parcours de développeur web.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Bonjour, je suis Belal
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Développeur web en formation. Je construis des projets avec Next.js, NestJS et bien plus.
        </p>
        <Bouton texte="Me contacter" />
      </div>
    </main>
  );
}
```

### Étape 3 : `app/contact/page.tsx`

```tsx
import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Envoie-moi un message. Je te réponds dès que possible.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact</h1>
        <p className="text-gray-500 mb-6">
          Remplis le formulaire et je te réponds dès que possible.
        </p>
        <ContactForm />
      </div>
    </main>
  );
}
```

### Étape 4 : `app/projets/page.tsx`

```tsx
import type { Metadata } from "next";
// ... imports existants

export const metadata: Metadata = {
  title: "Projets",
  description:
    "La sélection des projets que je construis pendant ma formation au développement web.",
};

// ... le composant existant ne change pas
```

### Étape 5 : `app/projets/[slug]/page.tsx`

C'est ici que `generateMetadata` brille. Ajoute en haut du fichier (avant le composant) :

```tsx
import type { Metadata } from "next";
// ... imports existants

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projet = trouverProjet(slug);

  if (!projet) {
    return {
      title: "Projet introuvable",
    };
  }

  return {
    title: projet.titre,
    description: projet.description,
    openGraph: {
      title: projet.titre,
      description: projet.description,
      type: "article",
    },
  };
}

// ... generateStaticParams existant
// ... le composant existant ne change pas
```

### Étape 6 : `app/sitemap.ts`

Crée le fichier comme montré plus haut. Adapte `SITE_URL` quand tu connaîtras ton vrai domaine.

### Étape 7 : `app/robots.ts`

Idem, fichier comme montré plus haut.

---

## Tester

1. `npm run dev`.
2. Sur chaque page, regarde l'onglet du navigateur : le titre doit changer.
3. Va sur `/projets/mon-portfolio` → l'onglet affiche "Mon portfolio — Portfolio de Belal".
4. Ouvre les outils de développeur, onglet Elements, regarde le `<head>` : tu vois toutes les balises générées.
5. Visite `/sitemap.xml` et `/robots.txt` directement → Next.js les sert automatiquement.

---

## Bonnes pratiques

- **Toujours** un titre et une description sur chaque page.
- Description : entre 50 et 160 caractères, claire, attrayante.
- Le `%s` template évite les répétitions.
- `openGraph` permet d'avoir une jolie vignette quand on partage le lien.
- Pour les images de prévisualisation, on verra `opengraph-image.tsx` plus tard si besoin.

---

## Résumé

- Les **metadata** sont les balises invisibles du `<head>` qui décrivent la page.
- Dans Next.js 16, on les déclare avec `export const metadata: Metadata = { ... }`.
- Pour des metadata **dynamiques** (page projet par exemple), on utilise `generateMetadata`.
- Les metadata du `layout` sont héritées par les pages, qui peuvent surcharger.
- Le pattern `title.template` évite de répéter le nom du site.
- `openGraph` et `twitter` améliorent l'aperçu sur les réseaux sociaux.
- `app/sitemap.ts` et `app/robots.ts` aident Google à explorer le site.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 10 — Données et routes dynamiques](./10_donnees-et-routes-dynamiques.md)
- → Suivant : [Cours 12 — Images et fonts](./12_images-et-fonts.md)
- Sommaire : [README](../README.md)
