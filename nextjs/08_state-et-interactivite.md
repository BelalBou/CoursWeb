# Cours 08 — State et interactivité

## Ce qu'on va voir
Faire bouger les choses dans le navigateur : retenir des valeurs qui changent (`useState`), réagir aux clics et à la saisie. On va rendre le formulaire de contact "vivant".

---

## C'est quoi le "state" ?

Le **state** (état, en français), c'est de la mémoire **temporaire** dans un composant. C'est tout ce qui change pendant que l'utilisateur interagit avec la page.

Exemples concrets :
- Le compteur d'un panier qui passe de 0 à 1 quand tu cliques "Ajouter".
- Le texte que l'utilisateur tape dans un champ.
- Si une fenêtre modale est ouverte ou fermée.
- Le numéro de page actuel d'une liste.

Toutes ces choses vivent dans la mémoire du navigateur, et **disparaissent quand on rafraîchit la page**. C'est de la mémoire courte.

Analogie : le state, c'est comme un Post-it sur ton écran. Tu écris dessus, tu effaces, tu réécris. Mais quand tu éteins l'ordi, le Post-it disparaît. Pour de la mémoire longue, il faudra une base de données (cours plus tard).

---

## Le hook `useState`

Pour créer du state dans un composant, React fournit un hook appelé `useState`.

```tsx
"use client";

import { useState } from "react";

export default function Compteur() {
  const [valeur, setValeur] = useState(0);

  return (
    <div>
      <p>Valeur : {valeur}</p>
      <button onClick={() => setValeur(valeur + 1)}>+1</button>
    </div>
  );
}
```

### Lecture ligne par ligne

```ts
const [valeur, setValeur] = useState(0);
```

- `useState(0)` crée une case mémoire, initialisée à `0`.
- Elle te rend deux choses dans un tableau :
  - `valeur` : la valeur actuelle.
  - `setValeur` : une **fonction** pour changer la valeur.
- On les nomme avec la convention `[truc, setTruc]`.

```tsx
<button onClick={() => setValeur(valeur + 1)}>+1</button>
```

- `onClick` est une prop spéciale : la fonction qu'on lui donne sera appelée quand on clique.
- `() => setValeur(valeur + 1)` est une **fonction fléchée**. Elle dit "quand on m'appelle, exécute `setValeur(valeur + 1)`".
- `setValeur(valeur + 1)` met à jour le state. **React redessine** alors le composant avec la nouvelle valeur.

---

## Pourquoi `setValeur(valeur + 1)` et pas `valeur = valeur + 1` ?

C'est le point qui surprend les débutants. Tu pourrais penser :

```ts
valeur = valeur + 1; // FAUX, ça ne marche pas
```

Mais ça **ne marche pas**. Parce que React doit savoir que la valeur a changé pour redessiner le composant. Si tu modifies la variable directement, React ne le voit pas.

`setValeur` fait deux choses :
1. Met à jour la valeur en mémoire.
2. Dit à React : "redessine ce composant avec la nouvelle valeur".

Règle absolue : pour changer un state, on passe **toujours** par la fonction `setXXX`.

---

## Les événements en React

Un **événement**, c'est une action de l'utilisateur : un clic, une touche pressée, un scroll, etc. React te permet de réagir à ces événements avec des props qui commencent par `on` :

| Prop | Quand ça se déclenche |
|---|---|
| `onClick` | Clic sur l'élément |
| `onChange` | Changement de valeur d'un input |
| `onSubmit` | Soumission d'un formulaire |
| `onMouseEnter` | La souris entre sur l'élément |
| `onKeyDown` | Une touche est pressée |

### Exemple : `onChange` sur un input

```tsx
<input
  type="text"
  value={nom}
  onChange={(e) => setNom(e.target.value)}
/>
```

- `value={nom}` : ce que l'input affiche est lié au state. Si le state change, l'input change.
- `onChange` est appelé à chaque frappe.
- `e` est l'événement. `e.target.value` est le texte actuellement dans l'input.
- On met à jour le state avec `setNom(...)`. Et boum, le `value={nom}` se met à jour.

C'est ce qu'on appelle un **input contrôlé** : le state contrôle ce qu'affiche le champ. C'est le pattern recommandé.

---

## TypeScript vu dans ce cours

### Le type d'un useState

TypeScript devine généralement tout seul :

```ts
const [valeur, setValeur] = useState(0);
// valeur est de type number
// setValeur est de type (n: number) => void
```

Si tu commences avec une valeur vide (par exemple un string vide), tu peux préciser le type explicitement :

```ts
const [nom, setNom] = useState<string>("");
```

Pour un objet plus complexe :

```ts
type Statut = "vide" | "en-cours" | "envoye";
const [statut, setStatut] = useState<Statut>("vide");
```

`"vide" | "en-cours" | "envoye"` est un **type union de littéraux**. La variable ne peut prendre QUE l'une de ces trois valeurs. C'est très puissant pour modéliser des états.

### Le type d'un événement

Pour `onChange` sur un input texte :

```ts
function gererChangement(e: React.ChangeEvent<HTMLInputElement>) {
  setNom(e.target.value);
}
```

Pour un `<textarea>`, c'est `HTMLTextAreaElement` à la place.

Pour `onSubmit` sur un `<form>` :

```ts
function gererSoumission(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  // ...
}
```

---

## Application sur le portfolio

On va :
1. Créer un composant `ContactForm` (Client Component) qui contient le formulaire avec son state.
2. Garder `app/contact/page.tsx` comme un Server Component qui affiche le titre et utilise `<ContactForm />`.

### Étape 1 : créer `components/ContactForm.tsx`

```tsx
"use client";

import { useState } from "react";
import Bouton from "@/components/Bouton";

type ChampsContact = {
  nom: string;
  email: string;
  message: string;
};

const VALEURS_INITIALES: ChampsContact = {
  nom: "",
  email: "",
  message: "",
};

export default function ContactForm() {
  const [champs, setChamps] = useState<ChampsContact>(VALEURS_INITIALES);

  function mettreAJour<K extends keyof ChampsContact>(
    cle: K,
    valeur: ChampsContact[K]
  ) {
    setChamps((precedent) => ({ ...precedent, [cle]: valeur }));
  }

  function gererSoumission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Formulaire soumis :", champs);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={gererSoumission}>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          placeholder="Ton nom"
          value={champs.nom}
          onChange={(e) => mettreAJour("nom", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="ton@email.com"
          value={champs.email}
          onChange={(e) => mettreAJour("email", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Message</label>
        <textarea
          placeholder="Ton message..."
          rows={4}
          value={champs.message}
          onChange={(e) => mettreAJour("message", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900 resize-none"
        />
      </div>

      <Bouton texte="Envoyer le message" />
    </form>
  );
}
```

### Étape 2 : nettoyer `app/contact/page.tsx`

```tsx
import ContactForm from "@/components/ContactForm";

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

### Ce qui est nouveau dans `ContactForm`

- `"use client"` : on utilise `useState` et `onChange`, donc c'est un Client Component.
- `ChampsContact` : un type qui décrit les trois champs du formulaire.
- `VALEURS_INITIALES` : une constante extraite. C'est plus propre que de mettre `{ nom: "", email: "", message: "" }` dans le `useState`. Si demain on en a besoin ailleurs, on la réutilise.
- `mettreAJour` : une fonction générique pour changer un champ par son nom. Le type `<K extends keyof ChampsContact>` veut dire "K est l'une des clés de `ChampsContact`". On garantit qu'on ne peut pas se tromper de nom de champ.
- `setChamps((precedent) => ({ ...precedent, [cle]: valeur }))` : on copie l'ancien objet (`...precedent`) et on remplace une seule clé. C'est l'**immutabilité** : on ne modifie jamais l'objet existant, on en crée un nouveau.
- `e.preventDefault()` empêche le rechargement par défaut du formulaire (le comportement HTML classique).
- Pour l'instant, on `console.log` les valeurs. Au prochain cours, on les enverra vraiment.

### Tester

1. `npm run dev`.
2. Va sur `/contact`.
3. Tape dans les champs : tu vois le state se mettre à jour au fur et à mesure (ouvre la console pour confirmer).
4. Clique sur "Envoyer". Dans la console, tu vois l'objet avec les trois valeurs. La page **ne se recharge pas**.

---

## Un mot sur le bouton

Notre `Bouton` actuel est un Server Component qui affiche juste un `<button>`. Il fonctionne bien dans un `<form>` car par défaut, un `<button>` dans un `<form>` soumet le formulaire (`type="submit"` est implicite).

Si on voulait un bouton qui fait autre chose (ouvrir une modale, par exemple), on devrait soit :
- Lui ajouter une prop `onClick` (ce qui le forcerait à devenir Client).
- Soit le séparer en deux : un `Bouton` Server pour le visuel, un `BoutonInteractif` Client pour l'action.

Pour l'instant, on reste simple.

---

## Résumé

- Le **state** est de la mémoire temporaire dans un composant.
- `useState(valeurInitiale)` crée un state. Il rend `[valeur, fonctionDeMiseAJour]`.
- Pour changer le state, on **doit** appeler la fonction `setXXX`. Jamais d'assignation directe.
- Les événements (`onClick`, `onChange`, etc.) prennent une fonction qui s'exécute quand l'événement arrive.
- Un `<input value={...} onChange={...}>` est un input **contrôlé**.
- TypeScript devine la plupart des types. Pour les événements, on utilise `React.ChangeEvent<...>` ou `React.FormEvent<...>`.
- Pattern recommandé : un Server Component (la page) qui contient un Client Component (le formulaire). Le maximum reste sur le serveur.
- L'immutabilité : on crée toujours un **nouvel** objet au lieu de modifier l'existant (`{ ...precedent, [cle]: valeur }`).

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 07 — Server vs Client Components](./07_server-vs-client-components.md)
- → Suivant : [Cours 09 — Formulaires et Server Actions](./09_formulaires-et-server-actions.md)
- Sommaire : [README](../README.md)
