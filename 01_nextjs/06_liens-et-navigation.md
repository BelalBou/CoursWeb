# Cours 06 — Les liens et la navigation entre pages

## Ce qu'on va voir
Comment passer d'une page à l'autre dans Next.js sans recharger tout le site, et comment mettre en valeur la page sur laquelle on se trouve.

---

## Le problème avec les `<a>` classiques

Aujourd'hui, dans la Navbar du portfolio, on a écrit ça :

```tsx
<a href="/contact">Contact</a>
```

Quand tu cliques sur ce lien, le navigateur fait quelque chose de **lourd** :

1. Il jette tout ce qu'il avait en mémoire (la page actuelle).
2. Il demande au serveur la nouvelle page **en entier**.
3. Il télécharge le HTML, le CSS, le JavaScript, les images, tout.
4. Il redessine tout l'écran.

C'est comme si tu fermais ton livre, le rangeais dans la bibliothèque, allais en chercher un autre, et le rouvrais à la première page. Lent.

---

## La solution : `<Link>` de Next.js

Next.js fournit un composant spécial qui s'appelle `<Link>`. Visuellement, il ressemble à un `<a>`, mais il fait quelque chose de **beaucoup plus malin**.

### Comment l'utiliser

D'abord, on l'importe en haut du fichier :

```tsx
import Link from "next/link";
```

Puis on l'utilise comme un `<a>`, mais avec `href` :

```tsx
<Link href="/contact">Contact</Link>
```

C'est tout.

---

## Ce que `<Link>` fait en plus

### 1. Pas de rechargement complet

Quand tu cliques sur un `<Link>`, Next.js **ne recharge pas tout**. Il échange uniquement la partie qui change (le contenu de la page) et garde le reste (la Navbar, le layout). C'est instantané.

Analogie : c'est comme tourner la page d'un livre. Tu ne refais pas tout le décor de la chambre à chaque fois — tu changes juste la page que tu lis.

### 2. Le préfetching (le pré-chargement)

Voilà le truc magique. Dès qu'un `<Link>` apparaît à l'écran, Next.js **prépare en avance** la page de destination dans le navigateur.

Quand le visiteur clique enfin, la page est **déjà prête**. Elle s'affiche tout de suite.

Analogie : imagine un serveur de restaurant qui voit que tu regardes le dessert sur la carte. Il commence à le préparer dans la cuisine **avant** que tu commandes. Quand tu dis "je veux le tiramisu", il est déjà prêt à sortir.

### 3. Ça marche tout seul

Pas besoin de configurer quoi que ce soit. Tu remplaces `<a>` par `<Link>`, et c'est fait.

---

## Et pour les liens externes ?

Le `<Link>` de Next.js sert pour les pages **internes** de ton site (qui commencent par `/`).

Pour un lien vers un autre site (Google, GitHub...), on garde le `<a>` classique :

```tsx
<a href="https://github.com" target="_blank" rel="noopener noreferrer">
  Mon GitHub
</a>
```

Règle simple :
- **Lien interne** (vers une page de mon site) → `<Link>`
- **Lien externe** (vers un autre site) → `<a>`

---

## Mettre en valeur la page active

Quand tu es sur la page Contact, ce serait sympa que dans la Navbar le mot "Contact" apparaisse différemment (par exemple en plus foncé). Comme ça, le visiteur sait où il est.

Pour ça, on a besoin de connaître **l'URL actuelle**. Next.js a un outil pour ça : `usePathname()`.

### Le hook `usePathname`

```tsx
import { usePathname } from "next/navigation";

const chemin = usePathname();
// si on est sur /contact, chemin = "/contact"
// si on est sur /, chemin = "/"
```

Un **hook**, c'est une fonction spéciale de React qui te donne accès à des informations dynamiques (l'URL, la position de la souris, l'heure, etc.). Les hooks commencent toujours par `use`.

### Petit problème : c'est un outil "client"

`usePathname()` ne marche que dans un composant qui tourne **dans le navigateur** (côté client). Or, par défaut, les composants Next.js tournent **sur le serveur**.

Pour dire à Next.js "ce composant doit tourner dans le navigateur", on ajoute une ligne magique tout en haut du fichier :

```tsx
"use client";
```

On parlera en détail de cette différence dans le prochain cours. Pour l'instant, retiens juste : **dès qu'un composant utilise `usePathname` (ou tout autre hook), il faut `"use client"` en haut du fichier**.

---

## TypeScript vu dans ce cours

### Les types des props de `<Link>`

`<Link>` accepte plusieurs props. Les principales :

```ts
type LinkProps = {
  href: string;
  prefetch?: boolean;
  children: React.ReactNode;
};
```

- `href` : l'URL de destination, un `string`.
- `prefetch` : optionnel (le `?` veut dire que ce n'est pas obligatoire). Si tu mets `false`, le préchargement est désactivé.
- `children` : le contenu à l'intérieur du lien (texte, image...).

### Le type de retour de `usePathname()`

```ts
const chemin: string = usePathname();
```

Ça retourne toujours un `string`. Pas besoin de le typer manuellement, TypeScript le déduit tout seul.

---

## Application sur le portfolio

On va modifier la Navbar pour :
1. Utiliser `<Link>` au lieu de `<a>`.
2. Mettre en gras la page active.

Comme on utilise `usePathname`, le fichier devient un Client Component. On ajoute `"use client"` en haut.

### `components/Navbar.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type LienNav = {
  href: string;
  libelle: string;
};

const LIENS: LienNav[] = [
  { href: "/", libelle: "Accueil" },
  { href: "/contact", libelle: "Contact" },
];

export default function Navbar() {
  const cheminActuel = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <span className="text-xl font-bold text-gray-900">Mon Portfolio</span>
      <div className="flex gap-6">
        {LIENS.map((lien) => {
          const estActif = cheminActuel === lien.href;
          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={
                estActif
                  ? "text-gray-900 font-bold"
                  : "text-gray-600 hover:text-gray-900 font-medium"
              }
            >
              {lien.libelle}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Ce qui est nouveau ici

- `"use client"` tout en haut : le fichier tourne dans le navigateur.
- `import Link from "next/link"` : on importe le composant.
- `import { usePathname } from "next/navigation"` : on importe le hook.
- `LIENS` est un tableau **typé** avec `LienNav[]`. Pourquoi ? Parce que c'est plus propre que de dupliquer du JSX. Si demain on ajoute une page "Projets", on ajoute juste une ligne dans le tableau.
- `LIENS.map(...)` : on transforme chaque objet du tableau en un `<Link>` JSX.
- `key={lien.href}` : React a besoin d'une "clé" unique pour chaque élément d'une liste. C'est un détail qu'on verra plus en détail au cours 08.
- `estActif` : un booléen calculé pour savoir si le lien correspond à la page actuelle.

---

## Tester dans le navigateur

1. Lance le serveur : `npm run dev`.
2. Ouvre `http://localhost:3000`.
3. Le mot "Accueil" doit être en gras et plus foncé.
4. Clique sur "Contact". La transition est **instantanée**, et "Contact" devient en gras.
5. Ouvre les outils de développeur du navigateur, onglet "Network". Quand tu cliques, tu verras une mini-requête, pas un rechargement complet.

---

## Résumé

- `<a href="...">` recharge toute la page → lent.
- `<Link href="...">` de `next/link` change juste le contenu → rapide.
- Next.js précharge automatiquement les pages des `<Link>` visibles à l'écran (préfetching).
- Pour les liens externes (autre site), on garde `<a>`.
- `usePathname()` donne l'URL actuelle. Utile pour styler la page active.
- Tout fichier qui utilise un hook (`usePathname`, `useState`...) doit commencer par `"use client"`.
- On centralise la liste des liens dans une constante typée pour rester maintenable.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 05 — Le CSS dans Next.js](./05_le-css.md)
- → Suivant : [Cours 07 — Server Components vs Client Components](./07_server-vs-client-components.md)
- Sommaire : [README](../README.md)
