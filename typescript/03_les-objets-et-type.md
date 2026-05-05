# Cours TypeScript 03 — Les objets et le mot-clé `type`

## C'est quoi un objet ?

Un objet, c'est une variable qui contient **plusieurs informations liées ensemble**.

Imagine une fiche de joueur de foot :
- Nom : Mbappé
- Numéro : 10
- Actif : true

En JavaScript/TypeScript, ça ressemble à ça :

```ts
let joueur = {
  nom: "Mbappé",
  numero: 10,
  actif: true
}
```

Chaque information dans l'objet s'appelle une **propriété**.

---

## Typer un objet directement

On peut écrire le type d'un objet directement sur la variable :

```ts
let joueur: { nom: string; numero: number; actif: boolean } = {
  nom: "Mbappé",
  numero: 10,
  actif: true
}
```

Mais c'est vite illisible. C'est pour ça qu'on utilise le mot-clé `type`.

---

## Le mot-clé `type` — créer ses propres types

`type` permet de donner un nom à la forme d'un objet pour le réutiliser :

```ts
type Joueur = {
  nom: string
  numero: number
  actif: boolean
}

let joueur: Joueur = {
  nom: "Mbappé",
  numero: 10,
  actif: true
}

let autreJoueur: Joueur = {
  nom: "Benzema",
  numero: 9,
  actif: true
}
```

Maintenant `Joueur` est un type qu'on peut utiliser autant de fois qu'on veut.

Si tu oublies une propriété ou tu mets le mauvais type, TypeScript crie :

```ts
let joueur: Joueur = {
  nom: "Mbappé",
  // ERREUR : il manque "numero" et "actif"
}
```

---

## Les propriétés optionnelles avec `?`

Si une propriété n'est pas toujours obligatoire, on met un `?` après son nom :

```ts
type Joueur = {
  nom: string
  numero: number
  actif: boolean
  surnom?: string    // ← optionnel, peut ne pas être là
}

let joueur: Joueur = {
  nom: "Mbappé",
  numero: 10,
  actif: true
  // "surnom" est absent — pas d'erreur
}
```

---

## Imbriquer des objets

Un objet peut contenir un autre objet :

```ts
type Adresse = {
  ville: string
  codePostal: string
}

type Utilisateur = {
  nom: string
  age: number
  adresse: Adresse   // ← un objet dans un objet
}

let utilisateur: Utilisateur = {
  nom: "Belal",
  age: 25,
  adresse: {
    ville: "Paris",
    codePostal: "75001"
  }
}
```

---

## Résumé

- Un objet regroupe plusieurs propriétés liées
- `type NomDuType = { ... }` permet de créer un type réutilisable
- Chaque propriété a son propre type : `nom: string`, `age: number`...
- `?` rend une propriété optionnelle : `surnom?: string`
- Un objet peut contenir un autre objet

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*

---

## Navigation

- ← Précédent : [Cours TypeScript 02 — Les types de base](./02_les-types-de-base.md)
- → Suivant : [Cours TypeScript 04 — Les fonctions](./04_les-fonctions.md)
- Sommaire : [README](../README.md)
