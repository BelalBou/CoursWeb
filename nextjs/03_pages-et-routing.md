# Cours 03 — Les pages et le routing

## C'est quoi le routing ?

Le **routing**, c'est le système qui décide quelle page afficher selon l'adresse dans le navigateur.

Imagine un hôtel :
- Tu vas à la réception → chambre d'accueil
- Tu vas au restaurant → salle à manger
- Tu vas au 3ème étage chambre 12 → chambre 312

Sur un site web, c'est pareil :
- Tu vas sur `/` → page d'accueil
- Tu vas sur `/contact` → page de contact
- Tu vas sur `/blog/mon-article` → l'article en question

Dans Next.js, ce système est **automatique**. Tu n'as pas besoin de configurer quoi que ce soit. Il suffit de **créer un fichier** et la page existe.

---

## Comment ça marche concrètement

Dans le dossier `app/`, chaque **sous-dossier** = une nouvelle URL.
Et dans ce sous-dossier, le fichier **`page.tsx`** = le contenu de la page.

```
app/
├── page.tsx           → localhost:3000/
├── contact/
│   └── page.tsx       → localhost:3000/contact
├── blog/
│   └── page.tsx       → localhost:3000/blog
│   └── mon-article/
│       └── page.tsx   → localhost:3000/blog/mon-article
```

La règle est simple : **dossier = URL, `page.tsx` = contenu**.

---

## Créer ta première page — la page contact du portfolio

Dans ton projet, crée un dossier `contact` dans `app/`, puis un fichier `page.tsx` dedans :

```
app/
└── contact/
    └── page.tsx
```

Dans ce fichier, écris ça :

```tsx
export default function ContactPage() {
  return (
    <main>
      <h1>Contact</h1>
      <p>Remplis le formulaire et je te réponds dès que possible.</p>
    </main>
  )
}
```

Maintenant va sur **http://localhost:3000/contact** — ta page est là. On la stylisera dans le cours 05.

---

## Décortiquer ce qu'on vient d'écrire

```tsx
export default function ContactPage() {
```

- `function ContactPage()` → on crée une fonction qui s'appelle `ContactPage`. C'est notre composant React.
- `export default` → on dit "ce composant, c'est le principal de ce fichier". Next.js a besoin de ça pour trouver quoi afficher.

```tsx
  return (
    <main>
      <h1>Page de contact</h1>
    </main>
  )
```

- `return` → la fonction renvoie du HTML
- Le HTML à l'intérieur d'une fonction JavaScript/TypeScript, ça s'appelle du **JSX** (ou **TSX** avec TypeScript). C'est une particularité de React.

> **C'est quoi JSX/TSX ?** C'est du HTML qu'on écrit directement dans le code JavaScript/TypeScript. Le navigateur ne comprend pas ça tout seul — Next.js le transforme en vrai HTML avant de te l'envoyer.

---

## Le fichier `layout.tsx` — le cadre commun

Tu te souviens du fichier `layout.tsx` dans `app/` ? Il sert de **cadre** autour de toutes tes pages.

Imagine un livre : chaque chapitre a son contenu différent, mais la couverture, les marges et le numéro de page sont les mêmes partout. Le `layout.tsx`, c'est ça.

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}   ← ici s'affiche le contenu de chaque page
      </body>
    </html>
  )
}
```

`{children}` c'est l'endroit où Next.js va coller le contenu de ta `page.tsx` courante.
Tu mets une navbar ici → elle apparaît sur toutes les pages automatiquement.

---

## Exemple concret : ajouter une navbar

On va créer une navbar et l'ajouter dans le layout.

### Étape 1 — Créer le composant Navbar

Crée un dossier `components/` à la racine du projet, puis un fichier `Navbar.tsx` dedans :

```
mon-premier-projet/
├── app/
│   └── ...
└── components/
    └── Navbar.tsx     ← nouveau fichier
```

Dans `Navbar.tsx`, écris ça :

```tsx
export default function Navbar() {
  return (
    <nav>
      <span>Mon Portfolio</span>
      <div>
        <a href="/">Accueil</a>
        <a href="/contact">Contact</a>
      </div>
    </nav>
  )
}
```

C'est un composant React classique : une fonction qui retourne du TSX.

### Étape 2 — L'utiliser dans le layout

Maintenant dans `app/layout.tsx`, on importe la Navbar et on la place **au-dessus de `{children}`** :

```tsx
import Navbar from "@/components/Navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Navbar />       ← affiché sur TOUTES les pages
        {children}       ← contenu spécifique à chaque page
      </body>
    </html>
  )
}
```

Résultat : peu importe sur quelle page tu vas (`/`, `/contact`, `/blog`...), la navbar est toujours là en haut.

> **C'est quoi `@/components/Navbar` ?** Le `@/` est un raccourci qui pointe vers la racine de ton projet. C'est plus pratique qu'écrire `../../components/Navbar` quand tu es dans un dossier profond.

### Ce que ça donne visuellement

```
┌─────────────────────────────────┐
│  Accueil   Contact              │  ← Navbar (layout.tsx)
├─────────────────────────────────┤
│                                 │
│   Contenu de la page            │  ← {children} (page.tsx)
│                                 │
└─────────────────────────────────┘
```

---

## TypeScript vu dans ce cours

Dans `page.tsx`, tu remarques qu'on n'a pas encore mis de types TypeScript particuliers. Mais retiens ce point :

Le nom `React.ReactNode` qu'on voit dans `layout.tsx` est un **type TypeScript**.
Il dit : "children peut être n'importe quoi qu'on peut afficher : du texte, des balises HTML, d'autres composants..."

---

## Résumé du cours 03

- Routing = quel contenu afficher selon l'URL
- Dans Next.js : **dossier = URL**, **`page.tsx` = contenu de la page**
- Un composant = une fonction qui `return` du TSX (HTML dans TypeScript)
- `export default` = obligatoire pour que Next.js trouve ta page
- `layout.tsx` = le cadre commun à toutes les pages, `{children}` = l'endroit où le contenu s'insère

---

## Questions

**Q : On peut voir un exemple concret avec une navbar dans le layout ?**

Oui ! Un composant Navbar se crée dans un dossier `components/` à la racine.
On l'importe ensuite dans `layout.tsx` avec `import Navbar from "@/components/Navbar"` et on le place au-dessus de `{children}`.
Comme ça, la navbar apparaît automatiquement sur toutes les pages du site.
Voir la section "Exemple concret : ajouter une navbar" juste au-dessus.

---

## Prochain cours :
**Cours 04 — Les composants : découper sa page en morceaux réutilisables**
