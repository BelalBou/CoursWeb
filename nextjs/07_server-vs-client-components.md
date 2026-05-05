# Cours 07 — Server Components vs Client Components

## Ce qu'on va voir
La grosse idée derrière Next.js moderne : certains composants tournent sur le **serveur**, d'autres dans le **navigateur**. Comprendre la différence change tout.

---

## L'analogie du restaurant

Imagine un restaurant.

- **La cuisine** : c'est l'endroit où on prépare les plats. Le client ne la voit jamais. On peut y stocker plein de choses, on a accès au frigo, aux ingrédients, aux couteaux. C'est puissant mais privé.
- **La salle** : c'est l'endroit où le client est assis. Il peut interagir : commander, demander du sel, lever la main pour appeler le serveur. Mais il ne peut pas accéder à la cuisine.

Dans Next.js :

- **Server Components = la cuisine.** Le code tourne sur le serveur. Il peut lire la base de données, manipuler des fichiers, utiliser des secrets. Le visiteur ne voit jamais ce code.
- **Client Components = la salle.** Le code tourne dans le navigateur du visiteur. Il peut réagir aux clics, gérer du state, écouter le clavier. Mais il n'a pas accès à la cuisine.

---

## Par défaut, tout est "Server"

Dans Next.js avec l'App Router, **tous les composants sont des Server Components par défaut**.

Ça veut dire que ton fichier `page.tsx` ou `Navbar.tsx`, sans rien faire de spécial, tourne **uniquement sur le serveur**.

```tsx
export default function Page() {
  return <h1>Bonjour</h1>;
}
```

Ce composant :
- S'exécute sur le serveur.
- Génère du HTML.
- Envoie ce HTML au navigateur.
- Le JavaScript du composant **n'est même pas envoyé** au visiteur.

Résultat : le site est rapide, léger, et respectueux du visiteur.

---

## Quand passer en Client Component ?

Tu en as besoin **dès que tu fais une chose interactive** dans le navigateur :

- Réagir à un clic (`onClick`).
- Gérer une saisie au clavier (`onChange`).
- Stocker une valeur qui change (`useState`).
- Lire l'URL actuelle (`usePathname`).
- Utiliser n'importe quel autre hook React (`useEffect`, `useRef`...).

Pour transformer un composant en Client Component, on ajoute **une ligne tout en haut du fichier** :

```tsx
"use client";

export default function MonBouton() {
  return <button onClick={() => alert("Salut")}>Clique</button>;
}
```

C'est la directive **`"use client"`**. Elle dit à Next.js : "ce fichier (et tout ce qu'il importe directement) doit aussi tourner dans le navigateur".

---

## Ce que tu peux faire de chaque côté

### Dans un Server Component
- Lire un fichier sur le disque.
- Faire `await fetch(...)` directement, sans `useEffect`.
- Utiliser `process.env` pour lire des secrets.
- Connecter à une base de données.

Tu **ne peux pas** :
- Utiliser `useState`, `useEffect`, ou tout autre hook.
- Ajouter `onClick`, `onChange`, etc.
- Utiliser `window`, `document`, ou `localStorage` (qui n'existent que dans le navigateur).

### Dans un Client Component
- Utiliser tous les hooks React.
- Ajouter de l'interactivité (événements).
- Utiliser `window`, `localStorage`, `document`.
- Stocker du state qui évolue.

Tu **ne peux pas** :
- Faire `await` directement dans le composant comme une fonction async.
- Utiliser `process.env` avec des secrets sensibles.
- Lire des fichiers du serveur.

---

## La règle d'or : Server par défaut, Client quand il faut

Plus tu as de Server Components, mieux c'est :
- Moins de JavaScript envoyé au visiteur.
- Site plus rapide à charger.
- Données et logique sécurisées sur le serveur.

Donc : **on n'ajoute `"use client"` que si on en a vraiment besoin**.

---

## Le pattern "Server qui contient du Client"

Voici un point important : **un Server Component peut contenir un Client Component**, mais pas l'inverse (sauf via `children`).

Exemple typique : la page Contact est un Server Component (elle ne fait que de l'affichage). Mais le formulaire dedans est interactif. On extrait donc le formulaire dans un fichier séparé qui sera un Client Component.

```
app/contact/page.tsx          ← Server (juste de l'affichage)
components/ContactForm.tsx    ← Client (formulaire interactif)
```

Dans `page.tsx` :

```tsx
import ContactForm from "@/components/ContactForm";

export default function Page() {
  return (
    <main>
      <h1>Contact</h1>
      <ContactForm />
    </main>
  );
}
```

Dans `ContactForm.tsx` :

```tsx
"use client";

export default function ContactForm() {
  return (
    <form>{/* ... */}</form>
  );
}
```

Comme ça, le titre `<h1>` reste sur le serveur (HTML léger), et seule la partie interactive arrive en JavaScript dans le navigateur.

---

## Le pattern "Server passe des children à Client"

Variante plus avancée. Un Client Component peut accepter un Server Component **comme `children`**. C'est utile pour des wrappers (par exemple un panneau qui s'ouvre/se ferme) qui contiennent du contenu Server.

```tsx
// PanneauOuvrant.tsx — Client
"use client";

import { useState } from "react";

type PanneauProps = {
  children: React.ReactNode;
};

export default function PanneauOuvrant({ children }: PanneauProps) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div>
      <button onClick={() => setOuvert(!ouvert)}>Ouvrir / Fermer</button>
      {ouvert && <div>{children}</div>}
    </div>
  );
}
```

```tsx
// page.tsx — Server
import PanneauOuvrant from "@/components/PanneauOuvrant";
import ContenuLourd from "@/components/ContenuLourd";

export default function Page() {
  return (
    <PanneauOuvrant>
      <ContenuLourd />
    </PanneauOuvrant>
  );
}
```

Ici, `ContenuLourd` reste un Server Component, même s'il est passé à un Client Component via `children`. Pratique : on garde le maximum de logique côté serveur.

---

## Les props doivent être "sérialisables"

Petit piège à connaître : quand un Server Component passe des props à un Client Component, ces props doivent être **sérialisables**. Ça veut dire qu'on peut les transformer en JSON pour les envoyer au navigateur.

Bon :
- Strings, numbers, booléens.
- Objets et tableaux composés de ces types.
- Dates.
- `null` et `undefined`.

Pas bon :
- Fonctions classiques (sauf les Server Actions, on verra ça au cours 09).
- Classes avec des méthodes.
- Promises non résolues.

Si tu essaies de passer une fonction à un Client Component depuis un Server, TypeScript râle ou ça plante au runtime.

---

## Pourquoi notre Navbar est Client

Dans le cours 06, on a transformé `Navbar.tsx` en Client Component :

```tsx
"use client";

import { usePathname } from "next/navigation";
```

Pourquoi ? Parce qu'on utilise `usePathname()`, qui est un hook. Les hooks ne tournent que côté client.

Note : ce n'est pas "Navbar entière en JavaScript" qui pose problème. C'est juste qu'**il y a un mini bout de code interactif** (savoir l'URL actuelle), donc on le marque Client. Le reste du site reste Server.

---

## TypeScript vu dans ce cours

### Le type `React.ReactNode`

```ts
type PanneauProps = {
  children: React.ReactNode;
};
```

`React.ReactNode` veut dire "tout ce que React peut afficher" : du texte, un nombre, un composant, un tableau de composants, `null`, etc.

C'est le type que tu utilises pour `children` la plupart du temps.

---

## Application sur le portfolio

Pas de gros changement de code dans ce cours — c'est un cours de **concept**.

Mais on va anticiper le prochain : on va préparer la séparation pour la page Contact.

### Plan pour le cours 08

- `app/contact/page.tsx` restera un Server Component (titre, description).
- On créera `components/ContactForm.tsx` en Client Component pour le formulaire interactif.

Pour l'instant, ne change rien. Lis bien ce cours, puis on passe à la pratique au cours suivant.

### Petit exercice mental

Pour chacun des fichiers ci-dessous, demande-toi : Server ou Client ?

| Fichier | Server ou Client ? |
|---|---|
| `app/page.tsx` (page d'accueil statique) | Server |
| `app/contact/page.tsx` (juste un titre + un sous-composant) | Server |
| `components/ContactForm.tsx` (à venir, formulaire interactif) | Client |
| `components/Navbar.tsx` (utilise `usePathname`) | Client |
| `components/Bouton.tsx` (juste un `<button>` qui affiche un texte) | Server |

Tant que `Bouton` ne fait pas de `onClick`, il peut rester Server. Le fait qu'il soit utilisé dans un Client Component ne le force pas à devenir Client.

---

## Résumé

- Par défaut, tout est Server Component.
- Server Component = code qui tourne sur le serveur, génère du HTML, ne pèse rien dans le navigateur.
- Client Component = code qui tourne dans le navigateur, peut être interactif.
- On ajoute `"use client"` en haut du fichier pour passer un composant en Client.
- Règle : Server par défaut, Client uniquement si nécessaire (hooks, événements, state).
- Un Server peut contenir un Client. Un Client peut recevoir des Server via `children`.
- Les props passées d'un Server à un Client doivent être sérialisables (pas de fonctions classiques).
- Notre `Navbar` est Client à cause de `usePathname`. C'est normal et ciblé.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 06 — Les liens et la navigation](./06_liens-et-navigation.md)
- → Suivant : [Cours 08 — State et interactivité](./08_state-et-interactivite.md)
- Sommaire : [README](../README.md)
