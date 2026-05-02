# Cours TypeScript 01 — C'est quoi TypeScript ?

## TypeScript, c'est JavaScript avec des règles de sécurité

Imagine que tu construis une maison avec des LEGO.
JavaScript, c'est une boîte de LEGO où toutes les pièces sont mélangées et tu peux les mettre ensemble comme tu veux — même si ça tient pas vraiment.
TypeScript, c'est la même boîte, mais chaque pièce a une forme précise et ne peut s'emboîter qu'avec la bonne autre pièce. Si tu essaies de mettre la mauvaise pièce, il te prévient **avant** que tu finisses ta maison.

**En clair :** TypeScript détecte les erreurs dans ton code **pendant que tu écris**, pas seulement quand ça plante dans le navigateur.

---

## La différence concrète

**En JavaScript :**
```js
let age = "vingt"
age + 5           // ça donne "vingt5" — c'est n'importe quoi mais JS s'en fout
```

**En TypeScript :**
```ts
let age: number = "vingt" // ERREUR immédiate : "vingt" n'est pas un nombre !
```

Le `: number` après `age`, c'est ce qu'on appelle un **type**. On dit à TypeScript : "cette variable doit toujours être un nombre". Si tu essaies de mettre du texte dedans, il crie tout de suite.

---

## Les extensions de fichiers

Avec TypeScript, les fichiers changent d'extension :

| Extension | C'est quoi |
|---|---|
| `.js` | JavaScript classique |
| `.ts` | TypeScript |
| `.jsx` | JavaScript avec du HTML React dedans |
| `.tsx` | TypeScript avec du HTML React dedans |

---

## Résumé

- TypeScript = JavaScript + règles de sécurité
- Il détecte les erreurs pendant que tu écris
- Les fichiers finissent en `.ts` ou `.tsx`

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*

---

## Prochain cours :
**[Cours TypeScript 02 — Les types de base](./02_les-types-de-base.md)**
