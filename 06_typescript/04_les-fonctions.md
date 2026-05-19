# Cours TypeScript 04 — Les fonctions

## Typer les paramètres d'une fonction

En JavaScript, une fonction ressemble à ça :

```js
function direBonjour(prenom) {
  return "Bonjour " + prenom
}
```

TypeScript ne sait pas ce que `prenom` est censé être. En TypeScript, on précise :

```ts
function direBonjour(prenom: string) {
  return "Bonjour " + prenom
}
```

Maintenant si tu appelles `direBonjour(42)`, TypeScript crie : "42 n'est pas du texte !".

---

## Typer le retour d'une fonction

On peut aussi dire ce que la fonction **retourne** en ajoutant `: type` après les parenthèses :

```ts
function additionner(a: number, b: number): number {
  return a + b
}
```

Ici la fonction prend deux nombres et retourne un nombre.

Si tu essaies de retourner du texte, TypeScript crie :

```ts
function additionner(a: number, b: number): number {
  return "bonjour" // ERREUR — on attendait un number, pas un string
}
```

---

## `void` — une fonction qui ne retourne rien

Si ta fonction ne retourne rien (elle fait juste une action), son type de retour est `void` :

```ts
function afficherMessage(message: string): void {
  console.log(message)
  // pas de return
}
```

`void` veut dire "vide" en anglais.

---

## Les paramètres optionnels

Comme pour les propriétés d'objets, un paramètre peut être optionnel avec `?` :

```ts
function direBonjour(prenom: string, surnom?: string): string {
  if (surnom) {
    return "Bonjour " + prenom + " alias " + surnom
  }
  return "Bonjour " + prenom
}

direBonjour("Belal")           // ok
direBonjour("Belal", "BG")    // aussi ok
```

---

## Les paramètres par défaut

On peut donner une valeur par défaut à un paramètre :

```ts
function direBonjour(prenom: string, langue: string = "fr"): string {
  if (langue === "fr") return "Bonjour " + prenom
  return "Hello " + prenom
}

direBonjour("Belal")        // → "Bonjour Belal"
direBonjour("Belal", "en") // → "Hello Belal"
```

---

## Les fonctions fléchées

En JavaScript moderne (et TypeScript), il existe une autre façon d'écrire les fonctions :

```ts
// Fonction classique
function additionner(a: number, b: number): number {
  return a + b
}

// Fonction fléchée — même chose, écriture différente
const additionner = (a: number, b: number): number => {
  return a + b
}

// Version encore plus courte si une seule ligne
const additionner = (a: number, b: number): number => a + b
```

Les deux font exactement la même chose. La flèche `=>` remplace le mot `function`.
Tu verras beaucoup les fonctions fléchées dans React et Next.js.

---

## Typer une fonction comme variable

On peut décrire le type d'une fonction elle-même :

```ts
type Operation = (a: number, b: number) => number

const additionner: Operation = (a, b) => a + b
const multiplier: Operation = (a, b) => a * b
```

Ici `Operation` décrit "une fonction qui prend deux nombres et retourne un nombre".

---

## Résumé

- On type les paramètres : `(prenom: string)`
- On type le retour après les `()` : `): string`
- `void` = la fonction ne retourne rien
- `?` après un paramètre = il est optionnel
- `= valeur` = valeur par défaut
- Les fonctions fléchées `=>` sont très courantes en React

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*

---

## Navigation

- ← Précédent : [Cours TypeScript 03 — Les objets et le mot-clé `type`](./03_les-objets-et-type.md)
- → Suivant : [Cours TypeScript 05 — Les interfaces](./05_les-interfaces.md)
- Sommaire : [README](../README.md)
