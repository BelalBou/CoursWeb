# Cours TypeScript 05 — Les interfaces

## `interface` vs `type` — quelle différence ?

Dans le cours 03, on a utilisé `type` pour décrire la forme d'un objet.
Il existe aussi le mot-clé `interface` qui fait presque la même chose.

```ts
// Avec type
type Utilisateur = {
  nom: string
  age: number
}

// Avec interface
interface Utilisateur {
  nom: string
  age: number
}
```

Les deux fonctionnent pour typer des objets. La différence principale :

| | `type` | `interface` |
|---|---|---|
| Objets | ✅ | ✅ |
| Unions (`string \| number`) | ✅ | ❌ |
| Extension (héritage) | ✅ avec `&` | ✅ avec `extends` |
| Usage général | Pour tout | Surtout pour les objets |

**Règle simple :** utilise `type` par défaut. Utilise `interface` quand tu travailles avec des classes ou de l'héritage.

---

## Étendre un type avec `&`

Imagine que tu as un type `Personne` et tu veux créer un type `Employe` qui a tout ce que `Personne` a, plus des infos en plus.

```ts
type Personne = {
  nom: string
  age: number
}

type Employe = Personne & {
  poste: string
  salaire: number
}

let employe: Employe = {
  nom: "Belal",
  age: 25,
  poste: "Développeur",
  salaire: 3000
}
```

Le `&` veut dire "et" : `Employe` = tout ce qu'est `Personne` **et** `poste` + `salaire`.

---

## Étendre une interface avec `extends`

Même chose mais avec `interface` :

```ts
interface Personne {
  nom: string
  age: number
}

interface Employe extends Personne {
  poste: string
  salaire: number
}
```

---

## Les tableaux d'objets

Maintenant qu'on sait typer les objets, on peut faire des listes d'objets :

```ts
type Produit = {
  nom: string
  prix: number
  disponible: boolean
}

let catalogue: Produit[] = [
  { nom: "T-shirt", prix: 25, disponible: true },
  { nom: "Pantalon", prix: 60, disponible: false },
  { nom: "Chaussures", prix: 90, disponible: true },
]
```

`Produit[]` = une liste de `Produit`. TypeScript vérifie que chaque élément a bien la bonne forme.

---

## Résumé

- `interface` et `type` servent souvent à la même chose pour les objets
- Préfère `type` par défaut
- `&` combine deux types : `TypeA & TypeB`
- `extends` dans une interface fait la même chose
- `Produit[]` = liste d'objets de type `Produit`

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*

---

## Prochain cours :
**Cours TypeScript 06 — Les génériques**
