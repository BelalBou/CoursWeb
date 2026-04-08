# Cours TypeScript 06 — Les génériques

## Le problème qu'ils résolvent

Imagine que tu veux créer une fonction qui retourne le premier élément d'un tableau.

```ts
function premier(tableau: number[]): number {
  return tableau[0]
}
```

Ça marche pour les tableaux de nombres. Mais si tu veux faire pareil avec un tableau de textes, tu dois réécrire la même fonction :

```ts
function premierTexte(tableau: string[]): string {
  return tableau[0]
}
```

C'est répétitif. Les **génériques** résolvent ce problème.

---

## C'est quoi un générique ?

Un générique, c'est un **type variable**. On lui donne un nom (souvent `T` par convention) et TypeScript le remplace par le vrai type au moment où on appelle la fonction.

```ts
function premier<T>(tableau: T[]): T {
  return tableau[0]
}
```

- `<T>` → "cette fonction a un type variable qu'on appelle T"
- `tableau: T[]` → le tableau contient des éléments de type T
- `: T` → la fonction retourne un élément de type T

Utilisation :

```ts
premier([1, 2, 3])          // TypeScript devine T = number, retourne un number
premier(["a", "b", "c"])    // TypeScript devine T = string, retourne un string
premier([true, false])      // TypeScript devine T = boolean, retourne un boolean
```

Une seule fonction, tous les types. TypeScript s'adapte tout seul.

---

## Pourquoi `T` ?

`T` c'est juste une convention (comme "Type"). Tu peux mettre ce que tu veux :

```ts
function premier<TypeDuTableau>(tableau: TypeDuTableau[]): TypeDuTableau {
  return tableau[0]
}
```

Ça marche pareil. Mais `T` est court et tout le monde l'utilise, alors autant respecter la convention.

---

## Les génériques dans les objets

On peut aussi utiliser les génériques dans les types :

```ts
type Reponse<T> = {
  donnees: T
  succes: boolean
  message: string
}

type ReponseUtilisateur = Reponse<{ nom: string; age: number }>
type ReponseProduits = Reponse<string[]>
```

Ici `Reponse<T>` est un "moule" qu'on remplit avec le type qu'on veut.

---

## Un exemple concret — une fonction `envelopper`

```ts
type Boite<T> = {
  contenu: T
  dateCreation: string
}

function envelopper<T>(element: T): Boite<T> {
  return {
    contenu: element,
    dateCreation: new Date().toISOString()
  }
}

envelopper("un texte")   // Boite<string>
envelopper(42)           // Boite<number>
envelopper({ nom: "Belal" }) // Boite<{ nom: string }>
```

---

## Résumé

- Un générique = un type variable, souvent noté `T`
- `<T>` se déclare juste après le nom de la fonction ou du type
- TypeScript remplace `T` automatiquement selon ce qu'on lui passe
- Ça évite de réécrire la même fonction pour chaque type
- Tu verras souvent les génériques dans les librairies comme React

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*

---

## Prochain cours :
**Cours TypeScript 07 — TypeScript et React**
