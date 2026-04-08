# Cours TypeScript 07 — TypeScript et React

## Ce cours fait le lien entre TypeScript et React/Next.js

Tout ce qu'on a vu dans les cours précédents s'applique directement dans React. Ce cours rassemble les cas qu'on rencontre le plus souvent.

---

## Typer les props d'un composant

C'est le cas le plus courant. On crée un `type` pour décrire les props :

```tsx
type BoutonProps = {
  texte: string
  couleur?: string   // optionnel
}

export default function Bouton({ texte, couleur }: BoutonProps) {
  return <button style={{ color: couleur }}>{texte}</button>
}
```

Utilisation :

```tsx
<Bouton texte="Envoyer" />
<Bouton texte="Annuler" couleur="red" />
```

---

## `React.ReactNode` — le type pour du contenu React

Quand un composant peut recevoir du contenu entre ses balises (comme `<div>contenu</div>`), on utilise le type `React.ReactNode` :

```tsx
type CarteProps = {
  titre: string
  children: React.ReactNode
}

export default function Carte({ titre, children }: CarteProps) {
  return (
    <div>
      <h2>{titre}</h2>
      {children}
    </div>
  )
}
```

Utilisation :

```tsx
<Carte titre="Mon titre">
  <p>Du texte à l'intérieur</p>
  <Bouton texte="Cliquer" />
</Carte>
```

`children` c'est le nom qu'on donne au contenu placé entre les balises d'un composant.

---

## Les événements

Quand tu gères un clic, une saisie de texte, etc., TypeScript veut connaître le type de l'événement :

```tsx
// Clic sur un bouton
function handleClic(event: React.MouseEvent<HTMLButtonElement>): void {
  console.log("cliqué !")
}

// Saisie dans un champ texte
function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
  console.log(event.target.value)
}
```

```tsx
<button onClick={handleClic}>Cliquer</button>
<input onChange={handleChange} />
```

Ces types semblent compliqués mais VS Code les suggère automatiquement. Tu n'as pas à les mémoriser.

---

## `useState` avec TypeScript

`useState` est un outil React pour stocker des données qui peuvent changer (on verra ça dans les cours Next.js). Avec TypeScript, on précise le type de la valeur :

```tsx
import { useState } from "react"

// TypeScript devine le type tout seul si tu donnes une valeur initiale
const [compteur, setCompteur] = useState(0)          // number
const [nom, setNom] = useState("")                    // string
const [actif, setActif] = useState(false)             // boolean

// Si la valeur initiale est null, on précise le type
const [utilisateur, setUtilisateur] = useState<{ nom: string } | null>(null)
```

---

## Résumé

- `type NomProps = { ... }` pour typer les props d'un composant
- `children: React.ReactNode` pour recevoir du contenu entre les balises
- `React.MouseEvent`, `React.ChangeEvent` pour les événements
- `useState<Type>` quand TypeScript ne peut pas deviner le type tout seul

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*
