# Cours TypeScript 02 — Les types de base

## C'est quoi un type ?

Un **type**, c'est une étiquette qu'on colle sur une variable pour dire ce qu'elle contient.

Comme dans une cuisine :
- Ce bocal contient du **sucre** → on met une étiquette "sucre"
- Ce bocal contient du **sel** → on met une étiquette "sel"

Si tu essaies de verser du sel dans le bocal étiqueté "sucre", TypeScript crie.

---

## Les types de base

### `string` — du texte

```ts
let prenom: string = "Belal"
let message: string = "Bonjour tout le monde"
```

### `number` — un nombre

```ts
let age: number = 25
let prix: number = 9.99
```

### `boolean` — vrai ou faux

```ts
let estConnecte: boolean = true
let aPayé: boolean = false
```

### `array` — une liste

```ts
let fruits: string[] = ["pomme", "banane", "kiwi"]
let notes: number[] = [12, 15, 18]
```

Le `[]` après le type veut dire "une liste de...". Donc `string[]` = une liste de textes.

---

## TypeScript peut deviner le type tout seul

Tu n'es pas obligé d'écrire le type à chaque fois. Si tu écris :

```ts
let prenom = "Belal"
```

TypeScript voit que tu mets du texte dedans et devine automatiquement que `prenom` est de type `string`. C'est ce qu'on appelle **l'inférence de type**.

Mais c'est une bonne habitude de l'écrire explicitement quand c'est pas évident.

---

## Vu dans les cours Next.js — les types de props

Dans le cours Next.js 04 sur les composants, on a vu ça :

```tsx
type BoutonProps = {
  texte: string
}

export default function Bouton({ texte }: BoutonProps) {
  return <button>{texte}</button>
}
```

- `type BoutonProps = { ... }` → on crée un type personnalisé qui décrit la forme des props
- `texte: string` → la prop `texte` doit être du texte
- `{ texte }: BoutonProps` → on extrait `texte` du paquet, et ce paquet doit avoir la forme de `BoutonProps`

---

## Résumé

- Un type = une étiquette sur une variable
- `string` = texte, `number` = nombre, `boolean` = vrai/faux, `string[]` = liste de textes
- TypeScript peut deviner le type tout seul (inférence)
- `type NomDuType = { ... }` permet de créer ses propres types

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*

---

## Prochain cours :
**Cours TypeScript 03 — Les interfaces et les objets**
