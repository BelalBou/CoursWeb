# Cours 04 — Premier endpoint : les projets

## Ce qu'on va voir
Construire le **vrai** module `projets` dans ton backend. Deux endpoints : la liste des projets et un projet précis. Données en mémoire (un tableau dans le service).

---

## Générer le module avec le CLI

NestJS a un super pouvoir : il peut **générer les fichiers pour toi** avec la bonne structure. Plus besoin de créer les fichiers à la main.

Place-toi dans `mon-backend/`, puis tape ces trois commandes :

```bash
nest generate module projets
nest generate controller projets
nest generate service projets
```

Ou en plus court (`g` au lieu de `generate`) :

```bash
nest g module projets
nest g controller projets
nest g service projets
```

Tu vas voir apparaître un dossier `src/projets/` avec :

```
src/projets/
├── projets.controller.ts
├── projets.controller.spec.ts
├── projets.module.ts
├── projets.service.ts
└── projets.service.spec.ts
```

Et bonus, **NestJS a mis à jour `app.module.ts` tout seul** pour importer `ProjetsModule`. Il a aussi branché le controller et le service dans le module.

---

## Le type d'un projet

Un projet n'est pas juste une chaîne de caractères. C'est un objet avec un slug, un titre, une description, etc. On va définir son **type**.

Crée un fichier `src/projets/projet.entity.ts` :

```typescript
export interface Projet {
  slug: string;
  titre: string;
  description: string;
  technologies: string[];
  lien: string;
}
```

Le mot **entité** (entity) veut dire "une chose représentée dans le programme". Plus tard, avec Prisma et PostgreSQL, ce type correspondra à une vraie table en base de données. Pour l'instant, c'est juste une forme d'objet.

---

## Les données en mémoire (pour l'instant)

On va mettre une petite liste de projets directement dans le **service**. C'est temporaire : dans le cours Prisma, on remplacera ça par une vraie base.

Ouvre `src/projets/projets.service.ts` :

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { Projet } from './projet.entity';

@Injectable()
export class ProjetsService {
  private readonly projets: Projet[] = [
    {
      slug: 'portfolio',
      titre: 'Portfolio personnel',
      description: 'Mon site vitrine en Next.js et Tailwind.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind'],
      lien: 'https://exemple.com/portfolio',
    },
    {
      slug: 'gestion-tacos',
      titre: 'App de commande de tacos',
      description: 'Une petite app pour commander son tacos préféré.',
      technologies: ['React', 'Node.js'],
      lien: 'https://exemple.com/tacos',
    },
  ];

  trouverTous(): Projet[] {
    return this.projets;
  }

  trouverParSlug(slug: string): Projet {
    const projet = this.projets.find((p) => p.slug === slug);
    if (!projet) {
      throw new NotFoundException(`Projet "${slug}" introuvable`);
    }
    return projet;
  }
}
```

Détails de pro :
- **`private readonly projets`** : le tableau est interne et ne peut pas être remplacé.
- **`Projet[]`** : on type le tableau, pas de `any`.
- **`trouverTous(): Projet[]`** et **`trouverParSlug(slug: string): Projet`** : tous les retours sont typés.
- **`NotFoundException`** : si le slug n'existe pas, on lance une erreur claire. NestJS la transforme en réponse HTTP `404`. On en reparle au cours 06.

---

## Le controller : recevoir les requêtes

Ouvre `src/projets/projets.controller.ts` :

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { Projet } from './projet.entity';

@Controller('projets')
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  @Get()
  trouverTous(): Projet[] {
    return this.projetsService.trouverTous();
  }

  @Get(':slug')
  trouverParSlug(@Param('slug') slug: string): Projet {
    return this.projetsService.trouverParSlug(slug);
  }
}
```

Décortiquons :

### `@Controller('projets')`
Toutes les routes de cette classe commencent par `/projets`.

### `@Get()`
Cette méthode répond à `GET /projets`.

### `@Get(':slug')`
Le `:slug` veut dire **"il y a une partie variable dans l'URL"**.
- `GET /projets/portfolio` → `slug = 'portfolio'`
- `GET /projets/gestion-tacos` → `slug = 'gestion-tacos'`

### `@Param('slug') slug: string`
On dit à NestJS : "récupère la partie `slug` de l'URL et donne-la moi en paramètre, je veux une string".

### Le controller ne fait que déléguer
Regarde bien : pas de logique, pas de `if`, pas de `find`. Il appelle juste le service.
**Le controller orchestre, le service travaille.** C'est la règle d'or.

---

## Tester dans le navigateur

Avec `npm run start:dev` lancé, ouvre :

```
http://localhost:3001/projets
```

Tu dois voir un tableau JSON avec tes deux projets.

Puis :

```
http://localhost:3001/projets/portfolio
```

Tu dois voir un seul projet.

Et :

```
http://localhost:3001/projets/inexistant
```

Tu dois voir une erreur 404 :

```json
{
  "message": "Projet \"inexistant\" introuvable",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Tester avec curl (en bonus)

Dans un autre terminal :

```bash
curl http://localhost:3001/projets
curl http://localhost:3001/projets/portfolio
```

`curl` est un outil en ligne de commande qui fait des requêtes HTTP. Très pratique pour tester un backend sans navigateur.

---

## TypeScript vu dans ce cours

- **`interface`** : décrit la forme d'un objet. On a fait `interface Projet`.
- **`Projet[]`** : un tableau de `Projet`.
- **`@Param('slug') slug: string`** : un décorateur qui s'applique sur un **paramètre de méthode**, pas sur la méthode entière.

---

## Application sur le projet

Tu as :
- Généré le module Projets avec le CLI.
- Créé l'entité `Projet`.
- Rempli le service avec un tableau en mémoire et deux méthodes : `trouverTous` et `trouverParSlug`.
- Créé le controller avec `GET /projets` et `GET /projets/:slug`.
- Testé dans le navigateur (et avec curl si tu l'as fait).

---

## Résumé

- `nest g module/controller/service projets` génère les fichiers et les branche tout seul.
- Le **service** garde la logique et les données.
- Le **controller** reçoit les requêtes HTTP et appelle le service.
- `@Get(':slug')` + `@Param('slug')` permettent de capter une partie variable de l'URL.
- `NotFoundException` produit automatiquement une réponse `404`.
- Les données sont **en mémoire** pour l'instant, on remplacera par une vraie base avec Prisma.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 03 — Controllers, services, modules](./03_controllers-services-modules.md)
- → Suivant : [Cours 05 — DTO et validation](./05_dto-et-validation.md)
- Sommaire : [README](../README.md)
