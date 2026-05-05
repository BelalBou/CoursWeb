# Cours 06 — Prisma dans NestJS

## Ce qu'on va voir
On refactor `mon-backend/` pour remplacer les tableaux en mémoire par de vraies requêtes Prisma. On gère proprement les erreurs (`P2025` → `NotFoundException`) et on garde une séparation claire entre la base et l'API.

## Avant / après

### Avant (tableau en mémoire)

```ts
// projets.service.ts
@Injectable()
export class ProjetsService {
  private readonly projets: Projet[] = [
    { id: 1, slug: "demo", titre: "Demo", description: "..." },
  ];

  findAll(): Projet[] {
    return this.projets;
  }
}
```

Problèmes :
- Tout disparaît au redémarrage.
- Pas de partage entre instances.
- Faux semblant de réalité.

### Après (Prisma)

```ts
@Injectable()
export class ProjetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Projet[]> {
    return this.prisma.projet.findMany();
  }
}
```

Court, persistant, vraie base.

## Refactor de `ProjetsService`

```ts
// src/projets/projets.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Prisma, Projet } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjetDto } from "./dto/create-projet.dto";
import { UpdateProjetDto } from "./dto/update-projet.dto";

@Injectable()
export class ProjetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Projet[]> {
    return this.prisma.projet.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(slug: string): Promise<Projet> {
    const projet = await this.prisma.projet.findUnique({
      where: { slug },
      include: { images: true },
    });

    if (projet === null) {
      throw new NotFoundException(`Projet avec slug "${slug}" introuvable.`);
    }

    return projet;
  }

  async create(dto: CreateProjetDto): Promise<Projet> {
    try {
      return await this.prisma.projet.create({ data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          `Un projet avec le slug "${dto.slug}" existe déjà.`,
        );
      }
      throw error;
    }
  }

  async update(slug: string, dto: UpdateProjetDto): Promise<Projet> {
    try {
      return await this.prisma.projet.update({
        where: { slug },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`Projet "${slug}" introuvable.`);
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<void> {
    try {
      await this.prisma.projet.delete({ where: { slug } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`Projet "${slug}" introuvable.`);
      }
      throw error;
    }
  }
}
```

Décortiquons les points importants.

### Le constructeur

```ts
constructor(private readonly prisma: PrismaService) {}
```

NestJS injecte automatiquement le `PrismaService` qu'on a déclaré dans `PrismaModule` au cours 4.

### `findAll` : pas de `try/catch`

Une lecture vide n'est pas une erreur, c'est juste un tableau `[]`. Pas besoin de gérer.

### `findOne` : la convention `findUnique` + check null

`findUnique` renvoie `Projet | null`. **Toujours** vérifier le `null` avant d'utiliser le résultat. On lance une `NotFoundException` (de NestJS) qui se transforme automatiquement en réponse HTTP 404.

### Codes d'erreur Prisma

Prisma jette des `Prisma.PrismaClientKnownRequestError` avec un **code** précis. Les plus courants :

| Code  | Signification |
|-------|---------------|
| `P2002` | Violation de contrainte d'unicité (`@unique` ou `@id`) |
| `P2025` | Enregistrement non trouvé pour `update`/`delete` |
| `P2003` | Violation de contrainte de clé étrangère |
| `P2014` | Violation de relation requise |

On les **transforme** en exceptions NestJS adaptées (`ConflictException` pour 409, `NotFoundException` pour 404).

### Pourquoi `try/catch` plutôt que `findUnique` avant `update` ?

On pourrait écrire :

```ts
const existe = await this.prisma.projet.findUnique({ where: { slug } });
if (!existe) throw new NotFoundException();
return this.prisma.projet.update({ where: { slug }, data: dto });
```

**Mauvais.** Deux requêtes à la place d'une, et une **race condition** : entre le `findUnique` et l'`update`, quelqu'un peut supprimer le projet. La version avec `try/catch` est **atomique** et **plus rapide**.

## Centraliser la gestion d'erreurs

Si tu fais le même `try/catch` dans 5 services, c'est du copier-coller. On peut créer un **helper** :

```ts
// src/prisma/prisma-error.helper.ts
import {
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

export function handlePrismaError(
  error: unknown,
  context: { entity: string; identifier?: string },
): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new NotFoundException(
        `${context.entity} ${context.identifier ?? ""} introuvable.`,
      );
    }
    if (error.code === "P2002") {
      throw new ConflictException(
        `${context.entity} déjà existant (contrainte d'unicité).`,
      );
    }
  }
  throw error;
}
```

Et dans le service :

```ts
async update(slug: string, dto: UpdateProjetDto): Promise<Projet> {
  try {
    return await this.prisma.projet.update({ where: { slug }, data: dto });
  } catch (error) {
    handlePrismaError(error, { entity: "Projet", identifier: slug });
  }
}
```

`never` comme type de retour de `handlePrismaError` indique à TypeScript : "cette fonction ne revient jamais normalement, elle lance toujours". TypeScript comprend qu'après l'appel, le code suivant est inatteignable.

## Refactor de `MessagesService`

```ts
// src/messages/messages.service.ts
import { Injectable } from "@nestjs/common";
import { Message } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMessageDto } from "./dto/create-message.dto";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMessageDto): Promise<Message> {
    return this.prisma.message.create({ data: dto });
  }

  findAll(): Promise<Message[]> {
    return this.prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async marquerCommeLu(id: number): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data: { lu: true },
    });
  }
}
```

Court et expressif. La beauté de Prisma.

## Le pattern entity ↔ DTO

Un piège courant : **renvoyer directement l'entity Prisma** au front. Problèmes potentiels :

1. Tu exposes des champs sensibles (`passwordHash`, `email` interne...).
2. Le format change si tu modifies la base, et le front casse.
3. Pas de transformation possible (formatter une date, calculer un champ dérivé).

Bonne pratique : **mapper** vers un DTO de réponse.

```ts
// src/projets/dto/projet-response.dto.ts
export class ProjetResponseDto {
  id!: number;
  slug!: string;
  titre!: string;
  description!: string;
  technos!: string[];
  createdAt!: string;
}

export function toProjetResponse(projet: Projet): ProjetResponseDto {
  return {
    id: projet.id,
    slug: projet.slug,
    titre: projet.titre,
    description: projet.description,
    technos: projet.technos.split(","),  // string -> string[]
    createdAt: projet.createdAt.toISOString(),
  };
}
```

Et dans le contrôleur :

```ts
@Get()
async findAll(): Promise<ProjetResponseDto[]> {
  const projets = await this.projetsService.findAll();
  return projets.map(toProjetResponse);
}
```

Pour un petit projet, c'est facultatif. Pour un projet d'équipe, c'est **obligatoire**. Ça crée une frontière nette : la base évolue indépendamment de l'API publique.

## Validation : DTOs côté NestJS

Avant que les données arrivent à Prisma, on les **valide**. C'est NestJS + `class-validator` qui s'en occupe (vu en NestJS), mais ça reste vrai avec Prisma.

```ts
// create-projet.dto.ts
import { IsString, IsNotEmpty, Length } from "class-validator";

export class CreateProjetDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 60)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  titre!: string;

  @IsString()
  description!: string;

  @IsString()
  technos!: string;
}
```

Règle : **Prisma vérifie la base** (types, contraintes), **les DTOs vérifient l'entrée HTTP**. Les deux sont complémentaires.

## TypeScript vu dans ce cours

- **`Promise<Projet[]>`** : on type explicitement les retours asynchrones.
- **Les types `Prisma.PrismaClientKnownRequestError`** sont importés depuis `@prisma/client`.
- **Le type `never`** : pour des fonctions qui lancent toujours.
- **`Prisma.ProjetGetPayload<{...}>`** : pour typer un projet avec ses relations.
- **Mapping fonctions** : `toProjetResponse(projet)` : prend un `Projet`, renvoie un `ProjetResponseDto`.

## Application sur le projet

Dans `mon-backend/` :

1. **Refactor `ProjetsService`** : remplace le tableau par les méthodes Prisma ci-dessus.
2. **Refactor `MessagesService`** : pareil.
3. **Crée `src/prisma/prisma-error.helper.ts`** et utilise-le dans les services.
4. (Optionnel mais recommandé) **Crée les DTOs de réponse** `ProjetResponseDto`, `MessageResponseDto`.
5. Lance `npm run start:dev` et teste avec un client HTTP (curl, Postman, ou directement dans `mon-premier-projet/` avec un fetch) :
   - `GET /projets` → tableau vide au début.
   - `POST /projets` avec un slug → projet créé en base.
   - `POST /projets` avec le même slug → 409 Conflict.
   - `GET /projets/:slug` → trouvé.
   - `GET /projets/inexistant` → 404 Not Found.
6. Ouvre Prisma Studio (`npx prisma studio`) pour voir les données qui s'accumulent.

## Résumé
- On injecte `PrismaService` dans les services métier ; on n'instancie **jamais** `PrismaClient` directement.
- Toujours convertir les erreurs Prisma (`P2025`, `P2002`...) en exceptions NestJS adaptées.
- Préfère `try/catch` autour de `update`/`delete` plutôt qu'un `findUnique` préalable (atomique, plus rapide).
- **DTOs côté HTTP** pour valider l'entrée et formatter la sortie. Garde une frontière nette entre base et API.
- Centralise la gestion d'erreurs Prisma dans un helper.

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 05 — Les relations](./05_relations.md)
- → Suivant : [Cours 07 — Seed et données de test](./07_seed-et-data-test.md)
- Sommaire : [README](../README.md)
