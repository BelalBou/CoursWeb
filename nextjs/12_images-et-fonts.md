# Cours 12 — Images et fonts

## Ce qu'on va voir
Comment afficher des images **rapides et nettes** avec `<Image>`, et utiliser de **belles polices Google Fonts** sans ralentir le site.

---

## Pourquoi pas juste `<img>` ?

La balise HTML `<img>` fonctionne, mais elle est **paresseuse en performance** :
- Elle charge l'image complète, peu importe la taille de l'écran.
- Elle peut faire "sauter" la mise en page pendant le chargement.
- Elle ne convertit pas l'image dans des formats modernes (WebP, AVIF).

Next.js fournit `<Image>`, qui résout tout ça automatiquement.

---

## Le composant `<Image>`

```tsx
import Image from "next/image";

<Image
  src="/photo.jpg"
  alt="Photo de Belal"
  width={400}
  height={400}
/>
```

Ce que `<Image>` fait pour toi :
- **Redimensionne automatiquement** selon l'écran (mobile, desktop).
- **Convertit en WebP/AVIF** si le navigateur supporte (jusqu'à 50% plus léger).
- **Lazy loading** : ne charge l'image que quand elle approche de l'écran.
- **Réserve la place** dès le départ pour éviter le "saut" de mise en page.

---

## Les props importantes

| Prop | Rôle |
|---|---|
| `src` | Le chemin vers l'image |
| `alt` | Texte alternatif (obligatoire pour l'accessibilité) |
| `width` / `height` | Dimensions intrinsèques (en pixels) |
| `priority` | À mettre `true` pour l'image "héro" (premier écran) |
| `placeholder` | `"blur"` pour un effet flouté pendant le chargement |
| `className` | Classes CSS classiques |

### `priority` pour l'image principale

Quand une image est **au-dessus de la ligne de pli** (visible sans scroller), on met `priority`. Ça dit à Next.js : "charge celle-ci en premier, c'est important".

```tsx
<Image src="/hero.jpg" alt="..." width={800} height={600} priority />
```

Sans `priority`, Next.js charge l'image en lazy, ce qui peut faire apparaître l'image trop tard sur le premier écran.

### `placeholder="blur"`

Pour un effet "flouté pendant que ça charge" :

```tsx
<Image
  src="/photo.jpg"
  alt="..."
  width={400}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

Pour les images **importées** (locales), Next.js génère le `blurDataURL` automatiquement :

```tsx
import photoMoi from "@/public/photo.jpg";

<Image src={photoMoi} alt="Belal" placeholder="blur" />
```

Quand on importe directement, Next.js connaît déjà la taille → on n'a même pas besoin de `width`/`height`.

---

## Les images locales (dans `/public`)

Le dossier `public/` à la racine du projet sert les fichiers comme s'ils étaient à la racine du site. Une image `public/photo.jpg` est accessible à `/photo.jpg`.

Deux façons de l'utiliser :

### Option A : chemin string (manuel)

```tsx
<Image src="/photo.jpg" alt="..." width={400} height={400} />
```

Tu dois fournir `width` et `height` à la main.

### Option B : import (recommandé)

```tsx
import photo from "@/public/photo.jpg";

<Image src={photo} alt="..." />
```

Next.js lit le fichier au build, connaît la taille, peut générer le placeholder. **C'est la voie royale.**

---

## Les images distantes

Si l'image vient d'un autre site (par exemple Cloudinary, Unsplash, ton CDN), Next.js a besoin que tu **autorises explicitement** le domaine. C'est une protection contre les abus.

On configure ça dans `next.config.ts` :

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
```

Puis :

```tsx
<Image
  src="https://images.unsplash.com/photo-123"
  alt="..."
  width={800}
  height={600}
/>
```

Si le domaine n'est pas dans la liste, Next.js refusera l'image et te montrera une erreur claire.

---

## `next/font` : les polices

Les Google Fonts classiques (avec un `<link>` dans le `<head>`) ont deux problèmes :
- Le navigateur fait une **requête supplémentaire** au serveur de Google.
- Risque de **flash** où le texte change quand la police arrive.

Next.js a une solution : `next/font/google`. Il **télécharge la police au build** et la sert depuis ton propre serveur. Plus rapide, plus stable, et conforme RGPD (pas de requête à Google chez le visiteur).

### Utiliser une Google Font

Dans `app/layout.tsx` :

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

Ce qui se passe :
- `Inter` est importé. C'est un objet fourni par Next.js qui représente la police.
- On l'appelle avec `subsets` (les caractères dont on a besoin — `"latin"` pour le français).
- `display: "swap"` dit au navigateur "affiche d'abord la police par défaut, puis swap quand Inter est prête". Ça évite le texte invisible au début.
- `inter.className` est une classe CSS générée que tu colles sur `<html>` ou `<body>`.

### Utiliser plusieurs polices

```tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

<html lang="fr" className={`${inter.variable} ${mono.variable}`}>
```

Avec `variable`, on déclare la police comme une **variable CSS** (`--font-sans`). Tu peux ensuite l'utiliser dans Tailwind ou dans tes styles.

---

## TypeScript vu dans ce cours

### `import type { NextConfig } from "next"`

Le type officiel pour configurer `next.config.ts`. Il auto-complète toutes les options.

### `StaticImageData`

Quand tu fais `import photo from "@/public/photo.jpg"`, le type de `photo` est `StaticImageData` (un objet avec `src`, `width`, `height`...). Pas besoin de l'écrire à la main, TypeScript le déduit.

---

## Application sur le portfolio

### Étape 1 : ajouter une photo

Pour cet exemple, ajoute une image dans `public/`. Par exemple `public/photo-belal.jpg` (n'importe quelle photo, ou une image generic en attendant). Si tu n'as pas de photo, tu peux télécharger un placeholder :

```bash
curl -o mon-premier-projet/public/photo-belal.jpg https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400
```

### Étape 2 : configurer la police dans `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio de Belal",
    template: "%s — Portfolio de Belal",
  },
  description:
    "Développeur web en formation. Je construis des projets avec Next.js, NestJS et bien plus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

### Étape 3 : ajouter la photo sur l'accueil `app/page.tsx`

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import photoBelal from "@/public/photo-belal.jpg";
import Bouton from "@/components/Bouton";

export const metadata: Metadata = {
  description:
    "Bonjour, je suis Belal. Découvre mes projets et mon parcours de développeur web.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-2xl text-center">
        <Image
          src={photoBelal}
          alt="Photo de Belal"
          width={140}
          height={140}
          priority
          placeholder="blur"
          className="rounded-full mx-auto mb-6 object-cover"
        />
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

### Étape 4 (optionnel) : autoriser un domaine distant

Si tu veux utiliser des images depuis un autre site, modifie `next.config.ts` :

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
```

Pense à **redémarrer** `npm run dev` après une modif de `next.config.ts`.

---

## Tester

1. `npm run dev`.
2. Va sur `/`. La photo s'affiche en cercle, la police a un peu changé (Inter).
3. Ouvre les outils de développeur, onglet Network, recharge.
4. Tu remarques que l'image servie n'est plus le `.jpg` original, mais une version optimisée (`.webp` ou `.avif`).
5. Si tu réduis la fenêtre, Next.js sert une version plus petite.

---

## Bonnes pratiques résumées

| À faire | À éviter |
|---|---|
| `<Image>` de `next/image` | `<img>` HTML brut |
| Importer les images locales | Mettre du `src="/x.jpg"` à la main |
| Mettre `priority` sur l'image héro | Le mettre partout (perd l'optim) |
| `next/font/google` | `<link>` Google Fonts dans le HTML |
| Configurer `remotePatterns` pour images distantes | Désactiver la sécurité |

---

## Résumé

- `<Image>` de `next/image` optimise tout : taille, format, lazy loading, placeholder.
- Pour une image **locale**, on l'importe directement (`import photo from "@/public/photo.jpg"`). Next.js connaît tout.
- Pour une image **distante**, on doit ajouter le domaine dans `next.config.ts` (`remotePatterns`).
- `priority` sur l'image principale du premier écran.
- `next/font/google` télécharge les polices au build, les sert localement, et les expose via une variable CSS ou un `className`.
- Mieux pour la performance, le SEO, le RGPD, et la stabilité visuelle.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 11 — Metadata et SEO](./11_metadata-et-seo.md)
- → Suivant : [Cours 13 — Loading, erreurs et not-found](./13_loading-erreurs-not-found.md)
- Sommaire : [README](../README.md)
