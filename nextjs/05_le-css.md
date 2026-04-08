# Cours 05 — Le CSS dans Next.js

## Les différentes façons de styliser

Dans Next.js, il y a plusieurs façons d'ajouter du style. On va voir les trois principales :

1. Le CSS global
2. Les CSS Modules
3. Tailwind CSS

---

## 1. Le CSS global

C'est le fichier `app/globals.css`. Tout ce que tu écris dedans s'applique à **toutes les pages** du site.

```css
/* globals.css */
body {
  font-family: Arial, sans-serif;
  margin: 0;
}

h1 {
  color: navy;
}
```

Ce fichier est importé dans `layout.tsx` :

```tsx
import "./globals.css"
```

**Quand l'utiliser ?** Pour les styles de base qui concernent tout le site : la police, les couleurs générales, les marges globales.

---

## 2. Les CSS Modules — le style par composant

Le CSS global, c'est pratique, mais il y a un problème : si tu as deux composants qui ont chacun une classe `.titre`, elles vont se mélanger et se marcher dessus.

Les **CSS Modules** résolvent ce problème. Chaque composant a son propre fichier CSS, et les classes sont **isolées** — elles n'affectent que ce composant.

### Comment ça marche

Tu crées un fichier qui finit par `.module.css` à côté de ton composant :

```
components/
├── Carte.tsx
└── Carte.module.css    ← le CSS de ce composant uniquement
```

Dans `Carte.module.css` :

```css
.carte {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
}

.titre {
  font-size: 20px;
  color: navy;
}
```

Dans `Carte.tsx`, tu importes le fichier et tu utilises les classes via l'objet `styles` :

```tsx
import styles from "./Carte.module.css"

export default function Carte() {
  return (
    <div className={styles.carte}>
      <h2 className={styles.titre}>Mon titre</h2>
    </div>
  )
}
```

> **Pourquoi `className` et pas `class` ?** En HTML on écrit `class="..."`. En React/JSX, `class` est un mot réservé en JavaScript, donc on utilise `className` à la place. C'est juste une règle de React.

### L'avantage des CSS Modules

Next.js transforme automatiquement le nom de tes classes pour les rendre uniques :
`.titre` dans `Carte.module.css` devient quelque chose comme `.Carte_titre__x7k2`.

Du coup deux composants peuvent avoir une classe `.titre` sans que ça se mélange.

---

## 3. Tailwind CSS

Tailwind, c'est une approche complètement différente. Au lieu d'écrire du CSS dans des fichiers séparés, tu appliques des **classes utilitaires** directement dans ton TSX.

Chaque classe fait une seule chose précise :

```tsx
export default function Carte() {
  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <h2 className="text-xl font-bold text-navy">Mon titre</h2>
    </div>
  )
}
```

| Classe Tailwind | Ce qu'elle fait |
|---|---|
| `border` | ajoute une bordure |
| `border-gray-300` | bordure grise claire |
| `rounded-lg` | coins arrondis |
| `p-4` | padding (espace intérieur) de 16px |
| `text-xl` | texte grand |
| `font-bold` | texte en gras |

**Avantage :** tout est au même endroit, pas besoin d'aller dans un fichier CSS séparé.
**Inconvénient :** ça peut vite devenir long à lire quand il y a beaucoup de classes.

Tailwind était disponible lors de l'installation. Si tu l'as activé, il est déjà prêt à utiliser.

---

## Laquelle choisir ?

| Méthode | Quand l'utiliser |
|---|---|
| CSS global | Styles de base du site entier |
| CSS Modules | Composants avec du style complexe et isolé |
| Tailwind | Prototypage rapide, projets modernes |

Dans les vrais projets, on mélange souvent CSS global + Tailwind, ou CSS global + CSS Modules.

---

## Résumé

- `globals.css` = styles pour tout le site, importé dans `layout.tsx`
- CSS Modules = fichier `.module.css` par composant, classes isolées
- `className` en React au lieu de `class` en HTML
- Tailwind = classes utilitaires directement dans le TSX

---

## Questions

**Q : Pourquoi mes boutons deviennent du texte sans style quand j'utilise Tailwind ?**

Tailwind inclut un "reset CSS" appelé **Preflight** qui efface volontairement tous les styles par défaut du navigateur (boutons, titres, listes, liens...). C'est fait exprès pour avoir une base identique sur tous les navigateurs et tout contrôler soi-même.

Pour redonner du style à un bouton, on utilise les classes Tailwind :

```tsx
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Clique-moi
</button>
```

| Classe | Ce qu'elle fait |
|---|---|
| `bg-blue-500` | fond bleu |
| `text-white` | texte blanc |
| `px-4` | espace gauche/droite |
| `py-2` | espace haut/bas |
| `rounded` | coins arrondis |

---

## Prochain cours :
**Cours 06 — Les liens et la navigation entre pages**
