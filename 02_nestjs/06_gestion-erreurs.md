# Cours 06 — Gestion des erreurs

## Ce qu'on va voir
Comment **renvoyer des erreurs propres** au client. Les exceptions Nest, le format JSON standard, et un petit exemple de filtre custom.

---

## Pourquoi c'est important ?

Un backend qui répond toujours "ça a marché" même quand ça a planté, c'est pire que pas de backend du tout.

Si Next.js demande un projet qui n'existe pas, il a besoin de savoir :
- **Quoi** s'est mal passé (le projet n'existe pas).
- **Quel code HTTP** (404 = pas trouvé, 400 = mauvaise requête, 500 = problème serveur).
- **Un message clair**.

NestJS te donne tout ça gratuitement avec ses **exceptions**.

---

## Les codes HTTP, rappel rapide

| Code | Sens | Quand l'utiliser |
|---|---|---|
| 200 | OK | Tout va bien |
| 201 | Created | Création réussie (réponse à un POST) |
| 400 | Bad Request | La requête est mal formée |
| 401 | Unauthorized | Pas connecté |
| 403 | Forbidden | Connecté mais pas le droit |
| 404 | Not Found | La ressource demandée n'existe pas |
| 409 | Conflict | Conflit (ex : email déjà pris) |
| 500 | Internal Server Error | Le serveur a planté |

Retiens surtout `400`, `404` et `500` pour commencer.

---

## Les exceptions Nest

NestJS fournit une classe de base **`HttpException`** et plein de **classes filles** déjà prêtes :

```typescript
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
```

Quand tu **`throw`** une de ces exceptions, NestJS la transforme **automatiquement** en réponse HTTP avec le bon code.

---

## Exemple : le service Projets

On l'a déjà fait au cours 04. On revient dessus pour bien comprendre :

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { Projet } from './projet.entity';

@Injectable()
export class ProjetsService {
  private readonly projets: Projet[] = [
    /* ... */
  ];

  trouverParSlug(slug: string): Projet {
    const projet = this.projets.find((p) => p.slug === slug);
    if (!projet) {
      throw new NotFoundException(`Projet "${slug}" introuvable`);
    }
    return projet;
  }
}
```

Quand on appelle `GET /projets/inexistant`, NestJS attrape l'exception et renvoie :

```json
{
  "message": "Projet \"inexistant\" introuvable",
  "error": "Not Found",
  "statusCode": 404
}
```

C'est le **format JSON standard** de NestJS. Tous les clients (ton frontend Next.js, une app mobile, etc.) peuvent compter dessus.

---

## Personnaliser le message ET les détails

Tu peux passer un objet à l'exception pour donner plus d'infos :

```typescript
throw new NotFoundException({
  message: `Projet "${slug}" introuvable`,
  slugDemande: slug,
  conseil: 'Vérifie l\'orthographe du slug',
});
```

Le client recevra ces infos en plus dans la réponse.

---

## Quand utiliser quelle exception ?

Petits exemples concrets :

```typescript
// L'utilisateur n'a pas envoyé un champ obligatoire (déjà géré par le DTO normalement)
throw new BadRequestException('Le champ email est obligatoire');

// La ressource demandée n'existe pas
throw new NotFoundException('Projet introuvable');

// On veut créer quelque chose qui existe déjà
throw new ConflictException('Cet email est déjà utilisé');

// Un truc imprévu (rare, à utiliser avec parcimonie)
throw new InternalServerErrorException('Impossible de joindre la base');
```

---

## HttpException brute (cas avancé)

Si aucune classe fille ne te convient, tu peux utiliser **`HttpException`** directement :

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

throw new HttpException('Je suis une théière', HttpStatus.I_AM_A_TEAPOT);
```

Premier argument : le message. Deuxième : le code HTTP. Mais en pratique, les classes filles couvrent 99% des cas.

---

## Exception filter (vue rapide)

Un **Exception Filter** est un fichier qui dit à NestJS **"voici comment je veux formater les erreurs"**. Utile en production quand tu veux :

- Toujours logger les erreurs dans un fichier.
- Renvoyer un format JSON personnalisé.
- Cacher les détails sensibles en prod.

Voici un exemple court (à comprendre, pas forcément à utiliser tout de suite) :

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erreur interne du serveur';

    this.logger.error(`${request.method} ${request.url} -> ${status}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

Et on l'active dans `main.ts` :

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

Pour ton portfolio, le format par défaut de NestJS est largement suffisant. **Tu n'as pas besoin de filtre custom maintenant**. Mais sache qu'il existe quand tu en auras besoin.

---

## TypeScript vu dans ce cours

- **`throw new Class()`** : on lance une exception en créant une nouvelle instance d'une classe d'erreur.
- **`unknown`** : un type encore plus strict que `any`. Tu dois vérifier le type avant de l'utiliser. C'est mieux pour la sécurité.
- **`instanceof`** : opérateur qui demande "est-ce que cet objet est une instance de cette classe ?".

---

## Application sur le projet

Tu as déjà `NotFoundException` dans `ProjetsService.trouverParSlug`. Pas besoin d'en faire plus pour l'instant.

Si tu veux, tu peux ajouter une exception dans `MessagesService.creer` pour refuser les doublons (même email envoyé deux fois) :

```typescript
import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  private readonly messages: Message[] = [];

  creer(dto: CreateMessageDto): Message {
    const dejaEnvoye = this.messages.some(
      (m) => m.email === dto.email && m.message === dto.message,
    );
    if (dejaEnvoye) {
      throw new ConflictException('Tu as déjà envoyé ce message');
    }

    const message: Message = {
      id: randomUUID(),
      nom: dto.nom,
      email: dto.email,
      message: dto.message,
      recuLe: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  trouverTous(): Message[] {
    return this.messages;
  }
}
```

C'est optionnel, mais c'est un bon réflexe.

---

## Résumé

- NestJS fournit des **exceptions toutes prêtes** : `NotFoundException`, `BadRequestException`, `ConflictException`, etc.
- Faire `throw new NotFoundException(...)` produit automatiquement une réponse `404` avec un JSON propre.
- Le **format JSON standard** : `{ message, error, statusCode }`.
- Pour des cas avancés, on écrit un **Exception Filter** custom.
- Toujours logger les erreurs côté serveur (on verra `Logger` au cours 10).

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 05 — DTO et validation](./05_dto-et-validation.md)
- → Suivant : [Cours 07 — CORS et connexion avec Next.js](./07_cors-et-connexion-nextjs.md)
- Sommaire : [README](../README.md)
