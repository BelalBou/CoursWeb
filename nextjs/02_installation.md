# Cours 02 — Installer Next.js et créer ton premier projet

## Ce dont tu as besoin avant de commencer

Pour créer un projet Next.js, ton ordinateur a besoin de deux outils installés :

### 1. Node.js
C'est quoi Node.js ? C'est un programme qui permet à ton ordinateur de lire et exécuter du JavaScript **en dehors du navigateur**.

Normalement, JavaScript ne fonctionne que dans Chrome, Firefox, etc.
Node.js, c'est comme donner à JavaScript la capacité de tourner directement sur ton PC.

**Vérifier si tu l'as déjà :**
Ouvre un terminal et tape :
```bash
node -v
```
Si tu vois quelque chose comme `v20.11.0`, c'est bon. Sinon, télécharge-le sur https://nodejs.org (prends la version "LTS").

---

### 2. npm (ou pnpm)
npm s'installe automatiquement avec Node.js. C'est un **gestionnaire de paquets**.

C'est quoi un gestionnaire de paquets ? Imagine un magasin de LEGO.
Au lieu d'inventer chaque pièce toi-même, tu vas dans le magasin et tu télécharges les pièces dont tu as besoin.
npm, c'est ce magasin. Il te permet de télécharger du code fait par d'autres développeurs.

**Vérifier si tu l'as :**
```bash
npm -v
```
Tu dois voir un numéro de version.

---

## Créer ton premier projet Next.js

Dans le terminal, va là où tu veux créer ton projet, puis tape cette commande :

```bash
npx create-next-app@latest mon-premier-projet
```

**C'est quoi `npx` ?** C'est un outil qui permet d'exécuter une commande npm sans l'installer définitivement sur ton PC. Pratique pour les outils qu'on utilise juste une fois.

---

## Les questions qu'il va te poser

Next.js va te poser des questions. Voilà quoi répondre :

```
Would you like to use TypeScript?         → Yes   ← on l'utilise toujours
Would you like to use ESLint?             → Yes
Would you like to use Tailwind CSS?       → No
Would you like your code inside a `src/` directory? → No
Would you like to use App Router?         → Yes   ← important !
Would you like to use Turbopack?          → No
Would you like to customize the import alias? → No
```

> **Pourquoi "Yes" à TypeScript ?** TypeScript, c'est JavaScript avec des règles de sécurité en plus. Imagine que JavaScript c'est conduire sans ceinture : ça marche, mais si tu fais une erreur tu t'en rends compte trop tard. TypeScript, c'est conduire avec la ceinture ET les airbags : il te prévient **avant** que ça plante. On va l'utiliser dans tous nos projets. Ne t'inquiète pas si tu ne comprends pas encore tout, on va l'expliquer au fur et à mesure.

> **Pourquoi "Yes" à App Router ?** C'est la façon moderne de faire les pages avec Next.js. On va apprendre directement la bonne méthode.

---

## TypeScript : ce que tu remarques tout de suite

Quand tu regardes les fichiers du projet, tu vois des extensions `.tsx` et `.ts` au lieu de `.js` et `.jsx`.

| Extension | C'est quoi |
|---|---|
| `.js` | JavaScript classique |
| `.ts` | TypeScript (JavaScript + règles) |
| `.jsx` | JavaScript avec du HTML dedans (React) |
| `.tsx` | TypeScript avec du HTML dedans (React + règles) |

La plupart du temps dans Next.js, tu vas utiliser **`.tsx`** pour tes pages et composants.

Pour l'instant, retiens juste : **TypeScript = JavaScript plus sécurisé**.

---

## Lancer le projet

Une fois créé, entre dans le dossier et lance le projet :

```bash
cd mon-premier-projet
npm run dev
```

Puis ouvre ton navigateur et va sur : **http://localhost:3000**

Tu devrais voir la page de bienvenue de Next.js. Bravo, ton premier projet tourne !

---

## C'est quoi `localhost:3000` ?

`localhost`, c'est ton propre ordinateur. Quand tu développes, tu n'as pas encore de vrai site sur internet.
Tu fais tourner le site **sur ton PC**, et tu y accèdes via cette adresse spéciale.

`3000`, c'est le **port**. Imagine que ton ordinateur est un immeuble et que chaque port est un appartement.
Next.js s'installe dans l'appartement numéro 3000.

---

## La structure des fichiers créés

Quand tu ouvres le dossier dans VS Code, tu vois ça :

```
mon-premier-projet/
├── app/               ← c'est ici que tu vas travailler
│   ├── page.tsx       ← la page d'accueil (localhost:3000)
│   ├── layout.tsx     ← le "cadre" commun à toutes les pages
│   └── globals.css    ← les styles globaux
├── public/            ← les images et fichiers statiques
├── package.json       ← la liste des outils installés
└── next.config.ts     ← la configuration de Next.js
```

Le dossier le plus important pour toi en ce moment : **`app/`**

---

## Résumé du cours 02

- Node.js = permet de faire tourner JavaScript sur ton PC
- npm = le magasin de code (paquets)
- `npx create-next-app@latest` = la commande pour créer un projet
- `npm run dev` = lance le projet en mode développement
- `localhost:3000` = l'adresse de ton site sur ton propre PC
- Le dossier `app/` = là où tu vas coder tes pages

---

## Questions

*(Cette section sera remplie au fur et à mesure de tes questions)*

---

## Prochain cours :
**[Cours 03 — Les pages et le routing](./03_pages-et-routing.md)**
