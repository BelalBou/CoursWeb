# Cours 05 — DTO et validation

## Ce qu'on va voir
Comment **vérifier** ce que le client envoie au backend. On va créer l'endpoint `POST /messages` pour recevoir les messages du formulaire de contact.

---

## Le danger : on ne fait JAMAIS confiance au client

Imagine ton formulaire de contact. Quelqu'un peut envoyer :
- Un email mal écrit (`pas-un-email`).
- Un message vide.
- Un objet bizarre avec 50 champs au lieu de 3.
- Un nom de 10 000 caractères pour saturer ta base.

Si le backend accepte tout sans vérifier, c'est la **catastrophe assurée**. Donc il faut **valider à la porte d'entrée**.

---

## Qu'est-ce qu'un DTO ?

**DTO** veut dire **Data Transfer Object** ("objet de transfert de données").

C'est une **classe** qui décrit **exactement** la forme des données qu'on attend dans une requête.

### Analogie : le formulaire papier

Quand tu vas à la mairie, tu remplis un **formulaire pré-imprimé** : nom, prénom, date de naissance.
Si tu écris ta vie sur le papier, l'agent ne lit que ce qui est dans les bonnes cases.
Si tu laisses la case "nom" vide, il refuse ton dossier.

Un DTO, c'est exactement ça : un formulaire pré-imprimé, avec des règles sur ce que chaque case doit contenir.

---

## Installer les outils de validation

NestJS s'appuie sur deux librairies :

- **`class-validator`** : les règles (`@IsString`, `@IsEmail`, etc.).
- **`class-transformer`** : pour transformer le JSON reçu en vraie instance de classe.

Dans `mon-backend/`, tape :

```bash
npm install class-validator class-transformer
```

---

## Activer la validation globale

On va dire à NestJS : **"valide automatiquement toutes les requêtes"**.

Modifie `src/main.ts` :

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = 3001;
  await app.listen(port);
  console.log(`Backend lancé sur http://localhost:${port}`);
}

void bootstrap();
```

Décortiquons les options de `ValidationPipe` :

- **`whitelist: true`** : si le client envoie un champ qui n'est pas dans le DTO, NestJS le **supprime tout seul**. Plus de pollution.
- **`forbidNonWhitelisted: true`** : encore plus strict. Si un champ inconnu est envoyé, on **refuse la requête** avec une erreur. Sécurité maximale.
- **`transform: true`** : NestJS transforme le JSON en vraie instance de la classe DTO. Pratique pour les types (par exemple, transformer une string `"42"` en number).

---

## Générer le module Messages

```bash
nest g module messages
nest g controller messages
nest g service messages
```

Avec `npx`, même principe :

```bash
npx nest g module messages
npx nest g controller messages
npx nest g service messages
```

---

## Créer le DTO `CreateMessageDto`

Crée le dossier `src/messages/dto/` et le fichier `src/messages/dto/create-message.dto.ts` :

```typescript
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nom!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
```

Détaillons :

- **`@IsString()`** : doit être une chaîne de caractères.
- **`@MinLength(2)` / `@MaxLength(80)`** : nombre minimum et maximum de caractères.
- **`@IsEmail()`** : doit ressembler à un email valide.
- **Le `!` après le nom** (`nom!: string`) : c'est un **assertion non-null**. On dit à TypeScript : "fais-moi confiance, ce champ sera bien rempli (par class-validator)". Sans le `!`, TypeScript râlerait parce qu'on ne donne pas de valeur initiale.

Pourquoi des décorateurs sur les propriétés ? Parce que `class-validator` les lit pour vérifier les valeurs reçues.

---

## L'entité Message

Crée `src/messages/message.entity.ts` :

```typescript
export interface Message {
  id: string;
  nom: string;
  email: string;
  message: string;
  recuLe: Date;
}
```

---

## Le service Messages

Ouvre `src/messages/messages.service.ts` :

```typescript
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  private readonly messages: Message[] = [];

  creer(dto: CreateMessageDto): Message {
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

- **`randomUUID()`** : génère un identifiant unique style `f47ac10b-58cc-...`. Vient de Node.js, pas besoin d'installer une librairie.
- **`dto`** est déjà validé quand il arrive ici. Le service peut faire confiance.

---

## Le controller Messages

Ouvre `src/messages/messages.controller.ts` :

```typescript
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import type { Message } from './message.entity';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  creer(@Body() dto: CreateMessageDto): Message {
    return this.messagesService.creer(dto);
  }

  @Get()
  trouverTous(): Message[] {
    return this.messagesService.trouverTous();
  }
}
```

Nouveautés :

- **`@Post()`** : cette méthode répond aux requêtes `POST /messages`.
- **`@Body() dto: CreateMessageDto`** : récupère le **corps** de la requête (le JSON envoyé) et le transforme en instance de `CreateMessageDto`. La validation se fait automatiquement.
- **`@HttpCode(HttpStatus.CREATED)`** : par défaut, NestJS répond `201 Created` pour `@Post`, mais on l'écrit explicitement pour que ce soit clair pour quelqu'un qui lit le code.

---

## Tester avec curl

Lance le serveur (`npm run start:dev`), puis dans un autre terminal :

### Cas valide

```bash
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{"nom":"Belal","email":"belal@exemple.com","message":"Bonjour, super site !"}'
```

Réponse `201` avec l'objet créé.

### Cas invalide (email pourri)

```bash
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{"nom":"B","email":"pas-un-email","message":"trop court"}'
```

Réponse `400 Bad Request` avec un détail des erreurs :

```json
{
  "message": [
    "nom must be longer than or equal to 2 characters",
    "email must be an email",
    "message must be longer than or equal to 10 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

C'est **NestJS qui a fait tout le boulot**. Tu n'as pas écrit un seul `if`.

---

## TypeScript vu dans ce cours

- **Décorateurs sur les propriétés** : `@IsString()`, `@IsEmail()`, etc., placés au-dessus d'une propriété de classe.
- **Assertion non-null** (`!`) : `nom!: string` dit à TypeScript "fais-moi confiance, ce champ sera rempli".
- **`@Body()`** : un décorateur de paramètre qui récupère le corps de la requête.

---

## Application sur le projet

Tu as :
- Installé `class-validator` et `class-transformer`.
- Activé `ValidationPipe` global avec `whitelist`, `forbidNonWhitelisted` et `transform`.
- Créé le module `messages` avec son DTO, son entité, son service et son controller.
- Testé avec curl, vu que la validation fonctionne automatiquement.

---

## Résumé

- Un **DTO** = un formulaire pré-imprimé, qui définit la forme des données attendues.
- `class-validator` ajoute des règles via des décorateurs (`@IsString`, `@IsEmail`, `@MinLength`...).
- `ValidationPipe` global = NestJS valide tout, partout, automatiquement.
- Trois options indispensables : `whitelist`, `forbidNonWhitelisted`, `transform`.
- `@Body()` injecte le corps validé dans la méthode du controller.
- **Ne jamais faire confiance au client.** Toujours valider à l'entrée.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 04 — Premier endpoint : les projets](./04_premier-endpoint-projets.md)
- → Suivant : [Cours 06 — Gestion des erreurs](./06_gestion-erreurs.md)
- Sommaire : [README](../README.md)
