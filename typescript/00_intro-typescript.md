# Cours TypeScript — Introduction

> Ce cours sera complété au fur et à mesure qu'on utilise TypeScript dans les projets Next.js.
> Chaque fois qu'on rencontre un concept TypeScript dans le code, on l'explique ici.

---

## C'est quoi TypeScript ?

TypeScript, c'est JavaScript avec des **règles de sécurité**.

Imagine que tu construis une maison avec des LEGO.
JavaScript, c'est une boîte de LEGO où toutes les pièces sont mélangées et tu peux les mettre ensemble comme tu veux — même si ça tient pas vraiment.
TypeScript, c'est la même boîte, mais chaque pièce a une forme précise et ne peut s'emboîter qu'avec la bonne autre pièce. Si tu essaies de mettre la mauvaise pièce, il te prévient **avant** que tu finisses ta maison.

**En clair :** TypeScript détecte les erreurs dans ton code **pendant que tu écris**, pas seulement quand ça plante dans le navigateur.

---

## La différence concrète

**En JavaScript :**
```js
let age = "vingt"; // personne ne dit rien
age + 5;           // ça donne "vingt5" — c'est n'importe quoi mais JS s'en fout
```

**En TypeScript :**
```ts
let age: number = "vingt"; // ERREUR immédiate : "vingt" n'est pas un nombre !
```

Le `: number` après `age`, c'est ce qu'on appelle un **type**. On dit à TypeScript : "cette variable doit toujours être un nombre". Si tu essaies de mettre du texte dedans, il crie tout de suite.

---

## Les concepts vus au fil des cours

*(Cette section sera remplie au fur et à mesure)*

### Vu dans le cours 02 — Installation
- Les fichiers `.ts` et `.tsx` = fichiers TypeScript
- `.tsx` = TypeScript avec du HTML React dedans

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*
