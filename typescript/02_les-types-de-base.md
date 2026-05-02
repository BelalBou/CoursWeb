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
let aPaye: boolean = false
```

### `array` — une liste

```ts
let fruits: string[] = ["pomme", "banane", "kiwi"]
let notes: number[] = [12, 15, 18]
```

Le `[]` après le type veut dire "une liste de...". Donc `string[]` = une liste de textes.

---

## Les unions — plusieurs types possibles

Si une variable peut contenir plusieurs types différents, on utilise `|` qui veut dire **"ou"** :

```ts
let identifiant: string | number = "abc123"
identifiant = 42  // aussi valide
```

Pour un tableau avec plusieurs types :

```ts
let melange: (string | number | boolean)[] = ["Belal", 25, true]
```

TypeScript accepte seulement ces types — tout le reste est refusé :

```ts
melange.push("texte") // ok
melange.push(42)      // ok
melange.push(true)    // ok
melange.push({})      // ERREUR — un objet n'est pas autorisé
```

---

## `any` — le type "je m'en fous"

Il existe un type spécial : `any`. Il veut dire "cette variable peut contenir n'importe quoi".

```ts
let truc: any = "du texte"
truc = 42        // pas d'erreur
truc = true      // pas d'erreur
truc = [1, 2, 3] // pas d'erreur
```

C'est comme enlever la ceinture de sécurité : TypeScript arrête de vérifier quoi que ce soit.

**Règle : évite `any` autant que possible.** Tu le verras dans du code existant, c'est pour ça qu'il faut le connaître.

---

## TypeScript peut deviner le type tout seul

Tu n'es pas obligé d'écrire le type à chaque fois. Si tu écris :

```ts
let prenom = "Belal"
```

TypeScript voit que tu mets du texte dedans et devine automatiquement que `prenom` est de type `string`. C'est ce qu'on appelle **l'inférence de type**.

---

## Résumé

- `string` = texte, `number` = nombre, `boolean` = vrai/faux
- `string[]` = liste de textes, `number[]` = liste de nombres
- `|` = union, pour autoriser plusieurs types : `string | number`
- `any` = aucune vérification — à éviter
- TypeScript peut deviner le type tout seul (inférence)

---

## Questions

**Q : Si un tableau contient des nombres, du texte et des booléens, c'est `any` comme type ?**

Non ! On utilise une union : `(string | number | boolean)[]`
TypeScript accepte seulement ces types — tout le reste est encore refusé.

**Q : C'est quoi le type `any` ?**

`any` = "n'importe quel type". TypeScript arrête de vérifier la variable.
Utile à connaître car tu le verras dans du code existant, mais évite de l'utiliser.

---

## Prochain cours :
**[Cours TypeScript 03 — Les objets et le mot-clé `type`](./03_les-objets-et-type.md)**
