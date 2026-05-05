# Cours 08 — Configuration et environnement

## Ce qu'on va voir
Sortir les valeurs sensibles (port, URL, secrets) du code et les mettre dans des **fichiers de configuration**. Utiliser `@nestjs/config`. Valider la config au démarrage.

---

## Pourquoi ?

Pour l'instant, on a écrit `3001` en dur dans `main.ts`. Et `http://localhost:3000` en dur dans `enableCors`. C'est **mauvais**.

Imagine : tu déploies ton backend en production. Là-bas, le port n'est pas 3001, c'est 8080. Le frontend n'est plus sur `localhost`, mais sur `https://monsite.com`.

Si tu veux changer ces valeurs, tu dois **modifier le code et redéployer**. C'est lent et risqué.

La bonne pratique : lire ces valeurs depuis l'**environnement** (un fichier `.env` ou des variables système). Comme ça, on change la config sans toucher au code.

---

## Le fichier `.env`

Crée un fichier `.env` à la racine de `mon-backend/` :

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

C'est un fichier texte simple : `CLE=valeur`, une par ligne.

**Règle d'or** : `.env` ne se commit **jamais** dans Git. Il peut contenir des secrets (mots de passe de base, clés d'API, etc.).

Ajoute-le à `.gitignore` (NestJS l'a fait par défaut, mais vérifie) :

```
.env
.env.local
*.env
```

---

## Le fichier `.env.example`

Pour que les autres développeurs sachent **quelles variables** sont nécessaires, on commit un fichier `.env.example` qui montre les clés mais **sans les vraies valeurs**.

Crée `mon-backend/.env.example` :

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Quand un nouveau dev arrive, il fait `cp .env.example .env` et remplit avec ses vraies valeurs.

---

## Installer `@nestjs/config`

```bash
npm install @nestjs/config
```

Ce paquet officiel ajoute :
- Le chargement automatique du `.env`.
- Un service `ConfigService` injectable partout.
- La possibilité de **valider** la config au démarrage.

---

## Activer `ConfigModule`

Modifie `src/app.module.ts` :

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjetsModule } from './projets/projets.module';
import { MessagesModule } from './messages/messages.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ProjetsModule,
    MessagesModule,
  ],
})
export class AppModule {}
```

- **`isGlobal: true`** : `ConfigService` est dispo dans tout le projet sans avoir à réimporter `ConfigModule` partout.
- **`validate`** : une fonction qu'on va écrire pour vérifier que toutes les variables nécessaires sont là et bien typées.

---

## Valider la config

On va écrire une fonction qui dit : **"voici les variables que j'attends, et leur type"**. Si quelque chose manque, le serveur ne démarre **pas**. Mieux vaut planter au démarrage que plus tard en plein milieu d'une requête.

On utilise `class-validator` (déjà installé au cours 05) avec `class-transformer`.

Crée `src/config/env.validation.ts` :

```typescript
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsUrl, validateSync } from 'class-validator';

enum Environnement {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environnement)
  NODE_ENV!: Environnement;

  @IsNumber()
  PORT!: number;

  @IsString()
  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
```

Détails :
- **`plainToInstance`** : transforme l'objet brut (où tout est string) en instance de la classe (avec les bons types). `enableImplicitConversion: true` permet de convertir automatiquement `"3001"` en number.
- **`validateSync`** : valide tout de suite, en lançant une erreur si quelque chose cloche.
- **`@IsUrl({ require_tld: false })`** : accepte `http://localhost:3000` même sans `.com`.

Si tu lances le serveur sans le `PORT`, tu vois quelque chose comme :

```
Error: An instance of EnvironmentVariables has failed the validation:
 - property PORT has failed the following constraints: isNumber
```

Magnifique. Plus de "ça plante mystérieusement en production".

---

## Utiliser `ConfigService` dans `main.ts`

Modifie `src/main.ts` pour lire la config :

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [config.get<string>('FRONTEND_URL', 'http://localhost:3000')],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Backend lancé sur http://localhost:${port}`);
}

void bootstrap();
```

- **`app.get(ConfigService)`** : on récupère le service de config.
- **`config.get<string>('FRONTEND_URL', 'http://localhost:3000')`** : lit la variable `FRONTEND_URL`. Le deuxième argument est une **valeur par défaut** si la variable n'est pas définie.
- **`config.get<number>(...)`** : on précise le type entre `< >`. C'est un **générique** TypeScript.

---

## Utiliser `ConfigService` ailleurs

Tu peux injecter `ConfigService` dans n'importe quel service :

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonService {
  constructor(private readonly config: ConfigService) {}

  faireQuelqueChose(): void {
    const env = this.config.get<string>('NODE_ENV');
    if (env === 'production') {
      // logique de prod
    }
  }
}
```

---

## TypeScript vu dans ce cours

- **`enum`** : un type qui n'accepte qu'un ensemble fini de valeurs (ici `'development' | 'production' | 'test'`).
- **Génériques** : `config.get<string>(...)` indique le type retourné. Les `< >` permettent de paramétrer un type.
- **`Record<string, unknown>`** : un objet dont les clés sont des strings et les valeurs de type inconnu (à valider).

---

## Application sur le projet

Tu as :
- Créé `.env` et `.env.example` à la racine de `mon-backend/`.
- Vérifié que `.env` est dans `.gitignore`.
- Installé `@nestjs/config`.
- Branché `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`.
- Écrit `src/config/env.validation.ts` qui valide les variables au démarrage.
- Lu `PORT` et `FRONTEND_URL` via `ConfigService` dans `main.ts`.

---

## Bonnes pratiques

1. **Jamais de valeur sensible dans le code source.**
2. **Toujours un `.env.example`** à jour avec les clés mais pas les valeurs.
3. **Toujours valider la config au démarrage.** Plante tôt = bug détecté tôt.
4. **`ConfigService` partout**, jamais `process.env.X` directement dans la logique métier.
5. **Variables différentes par environnement** : dev, test, production.

---

## Résumé

- `.env` contient les valeurs sensibles, **jamais commité**.
- `.env.example` montre les clés sans les valeurs, **commité**.
- `@nestjs/config` charge tout ça automatiquement.
- `ConfigModule.forRoot({ isGlobal: true, validate })` rend `ConfigService` dispo partout et **valide les variables au démarrage**.
- `ConfigService.get<Type>('CLE', defaut)` lit une variable typée.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 07 — CORS et connexion avec Next.js](./07_cors-et-connexion-nextjs.md)
- → Suivant : [Cours 09 — Tests unitaires](./09_tests-unitaires.md)
- Sommaire : [README](../README.md)
