# Cours 04 — Les composants : découper sa page en morceaux réutilisables

## C'est quoi un composant ?

Un composant, c'est un **morceau de page** qu'on peut réutiliser partout.

Imagine que tu construis une application de recettes de cuisine.
Chaque recette s'affiche dans une petite carte avec : une image, un titre, et un bouton.
Au lieu de réécrire ce code 50 fois pour 50 recettes, tu crées **un composant "CarteRecette"** et tu l'utilises 50 fois.

C'est le principe de base de React et Next.js.

---

## Un composant, c'est juste une fonction

```tsx
export default function MonComposant() {
  return (
    <div>
      <h2>Bonjour !</h2>
    </div>
  )
}
```

C'est tout. Une fonction qui retourne du TSX = un composant.

---

## Où mettre ses composants ?

On range les composants dans un dossier `components/` à la racine du projet :

```
mon-premier-projet/
├── app/
│   ├── page.tsx
│   └── layout.tsx
└── components/
    ├── Navbar.tsx      ← déjà vu dans le cours 03
    ├── Bouton.tsx
    └── CarteRecette.tsx
```

> **Convention importante :** les noms de composants commencent toujours par une **majuscule**. `Navbar`, `Bouton`, `CarteRecette`... Jamais `navbar` ou `bouton`. C'est comme ça que React reconnaît que c'est un composant et pas une balise HTML classique.

---

## Créer et utiliser un composant simple

### Étape 1 — Créer le composant

Crée `components/Bouton.tsx` :

```tsx
type BoutonProps = {
  texte: string
}

export default function Bouton({ texte }: BoutonProps) {
  return <button>{texte}</button>
}
```

On ajoute directement la prop `texte` — on en a besoin tout de suite dans le portfolio.

### Étape 2 — L'utiliser dans les pages du portfolio

Dans `app/page.tsx` :

```tsx
import Bouton from "@/components/Bouton"

export default function Home() {
  return (
    <main>
      <h1>Bonjour, je suis Belal</h1>
      <p>Développeur web en formation.</p>
      <Bouton texte="Me contacter" />
    </main>
  )
}
```

Dans `app/contact/page.tsx` :

```tsx
import Bouton from "@/components/Bouton"

export default function ContactPage() {
  return (
    <main>
      <h1>Contact</h1>
      <p>Remplis le formulaire et je te réponds dès que possible.</p>
      <Bouton texte="Envoyer le message" />
    </main>
  )
}
```

`<Bouton />` → c'est comme une balise HTML, mais c'est ton composant.
Le `/` à la fin signifie que ce composant n'a pas de contenu à l'intérieur (on dit qu'il est "auto-fermant").

---

## Les props — personnaliser un composant

Pour l'instant notre `Bouton` affiche toujours "Clique-moi".
Et si on voulait choisir le texte à chaque fois qu'on l'utilise ?

C'est là qu'entrent les **props** (raccourci de "properties", c'est-à-dire "propriétés" en français).

Les props, c'est comme des **paramètres** qu'on passe au composant pour le personnaliser.

Imagine une machine à tampon. La machine, c'est le composant. Le texte sur le tampon, c'est la prop.

### Modifier le composant pour accepter des props

```tsx
type BoutonProps = {
  texte: string
}

export default function Bouton({ texte }: BoutonProps) {
  return (
    <button>{texte}</button>
  )
}
```

Même composant `Bouton`, utilisé avec des textes différents sur chaque page. C'est ça la puissance des composants.

---

## TypeScript vu dans ce cours : les types de props

Tu as vu ce bloc :

```tsx
type BoutonProps = {
  texte: string
}
```

C'est du TypeScript. On déclare la "forme" des props du composant :
- `texte` est une prop qui doit être du texte (`string`)

Si tu essaies de faire `<Bouton texte={42} />` (un nombre au lieu de texte), TypeScript crie immédiatement. C'est exactement son rôle.


---

## Résumé du cours 04

- Un composant = une fonction qui retourne du TSX
- Les composants se rangent dans `components/`
- Nom avec une majuscule obligatoire : `Bouton`, pas `bouton`
- Les **props** permettent de personnaliser un composant à chaque utilisation
- En TypeScript, on déclare le type des props avec `type NomProps = { ... }`

---

## Questions

**Q : Dans `Bouton({ texte }: BoutonProps)`, pourquoi on remet `: BoutonProps` après `{ texte }` ?**

Le `{ texte }` sert à **extraire** la valeur `texte` du paquet de props.
Le `: BoutonProps` sert à **décrire** la forme de ce paquet — il dit à TypeScript "ce paquet doit ressembler à la fiche `BoutonProps`".

Ce sont deux choses différentes :
- `{ texte }` → "je veux récupérer `texte` dans ce paquet"
- `: BoutonProps` → "et ce paquet doit avoir la forme décrite dans `BoutonProps`"

Sans `: BoutonProps`, TypeScript ne saurait pas que `texte` doit être du texte et pas un nombre.

---

## Prochain cours :
**Cours 05 — Le CSS dans Next.js : styliser ses composants**
