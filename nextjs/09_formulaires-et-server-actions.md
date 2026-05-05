# Cours 09 — Formulaires et Server Actions

## Ce qu'on va voir
Comment **vraiment envoyer** les données du formulaire au serveur, les valider, et afficher un message de succès. Pour ça, Next.js a une fonctionnalité géniale : les **Server Actions**.

---

## Le problème

Au cours 08, on a un formulaire qui retient les valeurs et les `console.log`. Mais ça reste dans le navigateur. Il faut maintenant les envoyer à **un serveur** qui pourra les enregistrer (dans un fichier, une base, un email...).

Avant Next.js, on aurait fait :
1. Un endpoint `/api/contact` côté serveur.
2. Un `fetch("/api/contact", { method: "POST", body: ... })` côté client.
3. Gérer les erreurs réseau.
4. Mettre à jour l'affichage selon la réponse.

C'est verbeux. Next.js a une approche plus simple : les **Server Actions**.

---

## C'est quoi une Server Action ?

Une **Server Action** est une fonction qui **a l'air d'être appelée depuis le navigateur**, mais qui en réalité **s'exécute sur le serveur**. Next.js fait tout le travail invisible : envoyer les données, recevoir le résultat.

Analogie : c'est comme une télécommande. Tu cliques sur un bouton **chez toi**, mais l'action se passe **dans la box internet** (changer de chaîne). Tu ne te soucies pas du signal, tu cliques juste.

### La directive `"use server"`

Pour marquer une fonction comme Server Action, on met **en haut du fichier** :

```ts
"use server";
```

Ou bien on met cette directive à l'intérieur d'une seule fonction :

```ts
async function envoyerMessage(formData: FormData) {
  "use server";
  // ...
}
```

Convention recommandée pour les vrais projets : créer un fichier `actions.ts` dédié, avec `"use server"` tout en haut. Toutes les exports de ce fichier sont alors des Server Actions.

---

## La forme d'une Server Action

Une Server Action est :
- Une fonction **async**.
- Elle reçoit un objet `FormData` quand on l'utilise avec un `<form>`.
- Elle peut faire ce qu'elle veut côté serveur (lire/écrire en base, envoyer un email...).
- Elle peut retourner un objet (pour donner du feedback à l'utilisateur).

Exemple basique :

```ts
"use server";

export async function envoyerMessage(formData: FormData) {
  const nom = formData.get("nom");
  const email = formData.get("email");
  console.log("Reçu sur le serveur :", { nom, email });
}
```

`formData.get("nom")` lit la valeur de l'input dont l'attribut `name` est `"nom"`. Important : les inputs HTML doivent avoir un `name` pour que `FormData` les voie.

---

## Brancher une action sur un `<form>`

Au lieu de gérer manuellement le submit, on passe l'action à la prop `action` du formulaire :

```tsx
import { envoyerMessage } from "./actions";

export default function ContactForm() {
  return (
    <form action={envoyerMessage}>
      <input name="nom" />
      <input name="email" />
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

Quand l'utilisateur clique sur "Envoyer" :
1. Next.js empaquette les valeurs des inputs en `FormData`.
2. Il appelle `envoyerMessage` **sur le serveur** avec ce `FormData`.
3. Pas besoin de `e.preventDefault()`, pas besoin de `fetch`, rien.

Bonus : ça marche **même si JavaScript est désactivé** dans le navigateur (progressive enhancement). Parce que techniquement, c'est juste un `<form>` qui POST quelque chose.

---

## Valider les données — toujours côté serveur

**Règle de sécurité fondamentale** : ne fais JAMAIS confiance aux données envoyées par le navigateur. L'utilisateur peut envoyer n'importe quoi.

Donc on **valide toujours** avant d'utiliser les données. Pour ça, on utilise une bibliothèque appelée **Zod**, qui rend la validation simple et typée.

### Installer Zod

Dans le terminal, à la racine de `mon-premier-projet` :

```bash
npm install zod
```

### Créer un schéma de validation

Un **schéma**, c'est la description de ce qu'on attend. Zod nous laisse écrire ça en TypeScript :

```ts
import { z } from "zod";

const SchemaContact = z.object({
  nom: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  message: z.string().min(10, "Le message doit avoir au moins 10 caractères"),
});
```

Ensuite, on appelle `.safeParse()` ou `.parse()` sur les données reçues. `safeParse` ne crashe pas, il retourne un objet avec `success: true|false`.

```ts
const resultat = SchemaContact.safeParse({ nom, email, message });

if (!resultat.success) {
  // Erreurs de validation
  const erreurs = resultat.error.flatten().fieldErrors;
  // ...
}
```

---

## `useActionState` : afficher le résultat

`useActionState` est un hook React qui sert à connecter une Server Action à du state côté client. Il permet de récupérer le résultat de l'action (succès, erreurs) et de le réafficher.

```ts
const [etat, action, enCours] = useActionState(envoyerMessage, etatInitial);
```

- `etat` : la dernière valeur retournée par l'action (par exemple `{ ok: true }` ou `{ erreurs: { ... } }`).
- `action` : la fonction à passer à `<form action={action}>`.
- `enCours` : un booléen, `true` pendant que l'action s'exécute. Pratique pour afficher "Envoi en cours...".

---

## Application sur le portfolio

On va faire :
1. `app/contact/actions.ts` — la Server Action avec validation Zod.
2. `lib/messages.ts` — un faux "stockage en mémoire" (le temps qu'on n'ait pas de base).
3. `components/ContactForm.tsx` — refait avec `useActionState`.

### Étape 0 : installer Zod

```bash
cd mon-premier-projet
npm install zod
```

### Étape 1 : `lib/messages.ts`

On crée le dossier `lib/` à la racine du projet (au même niveau que `app/` et `components/`).

```ts
export type Message = {
  id: string;
  nom: string;
  email: string;
  message: string;
  envoyeLe: Date;
};

const messages: Message[] = [];

export function ajouterMessage(donnees: Omit<Message, "id" | "envoyeLe">): Message {
  const nouveau: Message = {
    id: crypto.randomUUID(),
    envoyeLe: new Date(),
    ...donnees,
  };
  messages.push(nouveau);
  return nouveau;
}

export function listerMessages(): readonly Message[] {
  return messages;
}
```

Notes pédagogiques :
- `Omit<Message, "id" | "envoyeLe">` veut dire "tous les champs de `Message` sauf `id` et `envoyeLe`". Pratique : on ne demande à l'appelant que ce dont on a besoin.
- `crypto.randomUUID()` génère un identifiant unique. Disponible nativement en Node.js.
- `readonly Message[]` empêche de modifier le tableau ailleurs. C'est plus sûr.
- **Attention** : ce stockage en mémoire est temporaire. À chaque redémarrage du serveur, tout disparaît. On le remplacera par une vraie base de données quand on apprendra Prisma + PostgreSQL.

### Étape 2 : `app/contact/actions.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ajouterMessage } from "@/lib/messages";

const SchemaContact = z.object({
  nom: z.string().trim().min(2, "Le nom doit avoir au moins 2 caractères"),
  email: z.string().trim().email("Email invalide"),
  message: z.string().trim().min(10, "Le message doit avoir au moins 10 caractères"),
});

export type EtatFormulaire = {
  ok: boolean;
  message: string;
  erreurs?: {
    nom?: string[];
    email?: string[];
    message?: string[];
  };
};

export const ETAT_INITIAL: EtatFormulaire = {
  ok: false,
  message: "",
};

export async function envoyerMessage(
  _etatPrecedent: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const donneesBrutes = {
    nom: formData.get("nom"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const resultat = SchemaContact.safeParse(donneesBrutes);

  if (!resultat.success) {
    return {
      ok: false,
      message: "Le formulaire contient des erreurs.",
      erreurs: resultat.error.flatten().fieldErrors,
    };
  }

  ajouterMessage(resultat.data);
  revalidatePath("/contact");

  return {
    ok: true,
    message: "Merci ! Ton message a bien été envoyé.",
  };
}
```

Notes pédagogiques :
- `"use server"` en haut : tout ce fichier est exécuté sur le serveur.
- Le schéma Zod fait la validation **et** le typage. Si `safeParse` réussit, `resultat.data` est de type `{ nom: string; email: string; message: string }`.
- `EtatFormulaire` est le type de ce que l'action renvoie. On l'exporte parce que le composant client en a besoin.
- `_etatPrecedent` : le `_` au début indique qu'on n'utilise pas ce paramètre. C'est juste là parce que `useActionState` l'exige.
- `revalidatePath("/contact")` dit à Next.js : "rafraîchis le cache de cette page". Utile si la page affichait par exemple la liste des messages reçus.
- On retourne un objet structuré que le client va savoir lire.

### Étape 3 : `components/ContactForm.tsx` refait

```tsx
"use client";

import { useActionState } from "react";
import { envoyerMessage, ETAT_INITIAL } from "@/app/contact/actions";

export default function ContactForm() {
  const [etat, action, enCours] = useActionState(envoyerMessage, ETAT_INITIAL);

  return (
    <form className="flex flex-col gap-4" action={action}>
      <div className="flex flex-col gap-1">
        <label htmlFor="nom" className="text-sm font-medium text-gray-700">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          placeholder="Ton nom"
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
        {etat.erreurs?.nom && (
          <p className="text-sm text-red-600">{etat.erreurs.nom[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="ton@email.com"
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
        {etat.erreurs?.email && (
          <p className="text-sm text-red-600">{etat.erreurs.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Ton message..."
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900 resize-none"
        />
        {etat.erreurs?.message && (
          <p className="text-sm text-red-600">{etat.erreurs.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={enCours}
        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
      >
        {enCours ? "Envoi en cours..." : "Envoyer le message"}
      </button>

      {etat.message && (
        <p
          className={
            etat.ok ? "text-sm text-green-600" : "text-sm text-red-600"
          }
        >
          {etat.message}
        </p>
      )}
    </form>
  );
}
```

Notes pédagogiques :
- On a remis chaque `<input>` avec son attribut `name`. C'est nécessaire pour que `FormData` les attrape.
- Plus besoin de `useState` ni de `onChange` : on utilise les inputs **non contrôlés**. Le navigateur garde lui-même la valeur. C'est plus simple et tout aussi correct.
- Le bouton est désactivé pendant que `enCours` est `true`. Ça évite les double-clics.
- Sous chaque input, on affiche une erreur si elle existe (`etat.erreurs?.nom`).
- Tout en bas, on affiche le message global (succès vert ou erreur rouge).

### Étape 4 : `app/contact/page.tsx` n'a pas besoin de changer

Le fichier reste un Server Component qui affiche le titre et le formulaire.

---

## Tester

1. `npm run dev`.
2. Va sur `/contact`.
3. Clique sur "Envoyer" en laissant les champs vides → tu vois trois erreurs s'afficher.
4. Remplis les champs correctement → tu vois "Envoi en cours..." puis "Merci ! Ton message a bien été envoyé.".
5. Le message est stocké côté serveur dans le tableau de `lib/messages.ts`. Tu peux ajouter un `console.log(listerMessages())` temporaire dans l'action pour le vérifier.

---

## Pourquoi c'est puissant

- **Pas d'API à écrire à la main.** Pas besoin de faire `fetch("/api/contact", ...)`.
- **Validation côté serveur garantie.** L'utilisateur ne peut pas la contourner.
- **Code partagé.** Le type `EtatFormulaire` est utilisé côté client ET serveur.
- **Progressive enhancement.** Si JS est désactivé, le formulaire fonctionne quand même.

---

## TypeScript vu dans ce cours

### `Omit<T, K>`

```ts
Omit<Message, "id" | "envoyeLe">
```

Crée un type avec tous les champs de `Message` sauf `id` et `envoyeLe`.

### `Promise<T>`

```ts
async function envoyerMessage(...): Promise<EtatFormulaire>
```

Une fonction `async` retourne toujours une `Promise`. `Promise<EtatFormulaire>` veut dire "elle promet de finir par fournir un `EtatFormulaire`".

### Le `?` dans les types d'objets

```ts
erreurs?: {
  nom?: string[];
  email?: string[];
};
```

Le `?` après le nom d'une propriété la rend **facultative**. Le champ peut être absent.

### Inférence de type avec Zod

```ts
const resultat = SchemaContact.safeParse(donneesBrutes);
if (resultat.success) {
  resultat.data; // typé { nom: string; email: string; message: string }
}
```

Zod génère le type tout seul depuis le schéma. On n'écrit pas le type deux fois.

---

## Résumé

- Une **Server Action** est une fonction async qui s'exécute sur le serveur, déclarée avec `"use server"`.
- On la branche directement sur `<form action={...}>`. Pas besoin de `fetch`.
- On la met dans un fichier `actions.ts` dédié pour les vrais projets.
- On valide **toujours** côté serveur avec un outil comme **Zod**.
- `useActionState(action, etatInitial)` côté client pour récupérer le résultat et l'état "en cours".
- Pour le moment on stocke en mémoire. C'est temporaire — on remplacera par Prisma + PostgreSQL plus tard.
- `revalidatePath` rafraîchit le cache d'une page après une mutation.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 08 — State et interactivité](./08_state-et-interactivite.md)
- → Suivant : [Cours 10 — Données et routes dynamiques](./10_donnees-et-routes-dynamiques.md)
- Sommaire : [README](../README.md)
