# Cours 02 — Installation et structure du projet

## Ce qu'on va voir
Installer NestJS, créer le projet `mon-backend/`, comprendre les fichiers de base, et le lancer.

---

## Installer la commande `nest`

NestJS est livré avec un outil en ligne de commande qui s'appelle le **CLI** (Command Line Interface). C'est lui qui crée tes projets et tes fichiers.

Ouvre ton terminal et tape :

```bash
npm install -g @nestjs/cli
```

Le `-g` veut dire **global** : on l'installe sur toute ta machine, pas dans un projet en particulier. Une fois installé, tu peux taper `nest` n'importe où dans ton terminal.

Pour vérifier que c'est installé :

```bash
nest --version
```

Tu dois voir un numéro (par exemple `10.x.x`).

---

## Créer le projet `mon-backend/`

On va créer le projet **à côté** de ton portfolio Next.js, pas dedans. Place-toi dans `CoursWeb/` :

```bash
cd ~/Documents/Projets/CoursWeb
nest new mon-backend
```

Le CLI va te poser une question : **quel gestionnaire de paquets ?**
Choisis **`npm`** (avec les flèches puis Entrée).

Tu vas voir plein d'installations défiler. C'est normal, NestJS télécharge tout ce qu'il faut.

À la fin, tu dois avoir une structure comme ça :

```
CoursWeb/
├── mon-premier-projet/   <- ton portfolio Next.js
└── mon-backend/          <- ton nouveau backend NestJS
```

---

## La structure du projet généré

Va dans `mon-backend/` et regarde les fichiers. On s'intéresse surtout au dossier **`src/`** (source = "le code") :

```
mon-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   └── app.service.ts
├── test/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

Voyons ce que fait chaque fichier important.

### `src/main.ts` — la porte d'entrée

C'est le fichier qui **démarre** ton backend. Si tu fermes ce fichier, plus rien ne tourne.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

`bootstrap` veut dire "amorcer". C'est la fonction qui lance la machine. Elle dit : "crée une application à partir de `AppModule`, et écoute sur le port 3000".

### `src/app.module.ts` — le plan général

Un **module** est comme une **pièce** de ton bâtiment. Le `AppModule` est la pièce principale, qui connaît toutes les autres.

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

On va expliquer **`@Module`** au cours suivant. Pour l'instant, retiens que ce fichier dit : "voici les controllers et les services de cette pièce".

### `src/app.controller.ts` — qui reçoit les demandes

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

Ce controller dit : "si quelqu'un fait une demande `GET /`, je lui réponds en demandant à `AppService` de me donner un message".

### `src/app.service.ts` — qui fait le travail

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

Le service contient le **vrai travail**. Ici, c'est tout simple : retourner la chaîne `'Hello World!'`.

---

## Lancer le projet

Toujours dans `mon-backend/`, tape :

```bash
npm run start:dev
```

`start:dev` veut dire "démarre en mode développement". Le serveur va **redémarrer tout seul** à chaque fois que tu modifies un fichier. Très pratique.

Tu vas voir un message du genre :

```
[Nest] 12345  - LOG [NestApplication] Nest application successfully started
```

Maintenant ouvre ton navigateur sur :

```
http://localhost:3000
```

Tu dois voir : **Hello World!**

Bravo, ton backend tourne.

---

## Petit problème : le port 3000

Tu te souviens ? Ton portfolio Next.js tourne déjà sur **`http://localhost:3000`**.
Si tu lances aussi NestJS sur 3000, ça va se bagarrer.

On va dire à NestJS d'utiliser **3001** à la place.

Modifie `src/main.ts` :

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = 3001;
  await app.listen(port);
  console.log(`Backend lancé sur http://localhost:${port}`);
}

void bootstrap();
```

Quelques détails de pro :
- `: Promise<void>` : on dit à TypeScript que cette fonction est asynchrone et ne retourne rien d'utile.
- `void bootstrap()` : `void` ici dit "je sais que cette fonction renvoie une promesse, je l'ignore exprès". Ça calme certaines règles de lint.
- On affiche un message clair dans la console pour savoir où l'app écoute.

Maintenant, va sur **`http://localhost:3001`**. Tu vois `Hello World!`.

Plus tard (cours 08), on mettra ce port dans une variable d'environnement, parce qu'écrire `3001` en dur n'est pas une bonne idée pour un vrai projet.

---

## TypeScript vu dans ce cours

- **`async / await`** : pour gérer les opérations qui prennent du temps (comme démarrer un serveur).
- **`Promise<void>`** : un type qui dit "je rends une promesse qui ne contient rien".
- **`void`** comme opérateur : ignorer volontairement le résultat d'une promesse.

---

## Application sur le projet

Tu as :
- Installé `@nestjs/cli` globalement.
- Créé `mon-backend/` à côté de `mon-premier-projet/`.
- Modifié `main.ts` pour écouter sur le port **3001**.
- Lancé `npm run start:dev`.
- Vérifié dans le navigateur que tu vois `Hello World!`.

---

## Résumé

- `@nestjs/cli` est l'outil qui crée des projets et des fichiers NestJS.
- `nest new mon-backend` génère un projet complet avec une structure standard.
- Trois fichiers clés : **`main.ts`** (démarrage), **`app.module.ts`** (organisation), **`app.controller.ts`** + **`app.service.ts`** (l'exemple Hello World).
- On lance avec `npm run start:dev` qui redémarre tout seul à chaque changement.
- On a mis le port à **3001** pour ne pas écraser Next.js sur 3000.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 01 — C'est quoi NestJS ?](./01_cest-quoi-nestjs.md)
- → Suivant : [Cours 03 — Controllers, services, modules](./03_controllers-services-modules.md)
- Sommaire : [README](../README.md)
