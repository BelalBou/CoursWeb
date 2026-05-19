# Cours 03 — Controllers, Services, Modules

## Ce qu'on va voir
Les **trois piliers** de NestJS. Comprendre qui fait quoi, et comment ils discutent ensemble.

---

## L'image du restaurant (encore)

Imagine un restaurant qui marche bien.

| Dans le restaurant | Dans NestJS |
|---|---|
| Le **serveur** qui prend ta commande à la table | Le **Controller** |
| Le **cuisinier** qui prépare le plat en cuisine | Le **Service** |
| **La cuisine entière** (serveurs + cuisiniers + frigo) | Le **Module** |

Le serveur ne cuisine pas. Le cuisinier ne va pas voir les clients. Chacun son rôle.
NestJS impose la même règle.

---

## Le Controller — qui reçoit les demandes

Un **Controller**, c'est la classe qui reçoit les requêtes HTTP (les demandes du navigateur ou de Next.js) et qui répond.

C'est lui qui dit : **"si quelqu'un fait `GET /projets`, je m'en occupe"**.

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('projets')
export class ProjetsController {
  @Get()
  trouverTous(): string {
    return 'Voici la liste des projets';
  }
}
```

- **`@Controller('projets')`** : tout ce qui est dans cette classe répond à des URL qui commencent par `/projets`.
- **`@Get()`** : cette méthode répond aux demandes `GET` sur `/projets`.

Important : **un controller ne fait pas le travail**. Il ne cherche pas dans la base, il ne calcule rien. Il **délègue** au service.

---

## Le Service — qui fait le travail

Un **Service**, c'est la classe qui contient la **logique métier**. C'est lui qui sait chercher les projets, valider des choses, calculer.

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjetsService {
  trouverTous(): string[] {
    return ['Portfolio', 'Blog', 'Site de tacos'];
  }
}
```

- **`@Injectable()`** : "cette classe est un service, NestJS peut la fournir à d'autres".

Si demain tu changes de base de données, ou si tu changes la façon de stocker les projets, tu modifies seulement le **service**. Le controller ne bouge pas.

---

## Le Module — qui regroupe les morceaux

Un **Module**, c'est une **boîte** qui contient ensemble :
- les controllers liés à un sujet,
- les services liés à un sujet,
- ce que le module veut **partager** avec d'autres modules.

```typescript
import { Module } from '@nestjs/common';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';

@Module({
  controllers: [ProjetsController],
  providers: [ProjetsService],
})
export class ProjetsModule {}
```

- **`controllers`** : la liste des controllers de la boîte.
- **`providers`** : la liste des services (et autres choses qu'on peut "fournir") de la boîte.

Et ensuite, dans `app.module.ts`, on dit que la grande boîte (`AppModule`) contient cette nouvelle petite boîte :

```typescript
import { Module } from '@nestjs/common';
import { ProjetsModule } from './projets/projets.module';

@Module({
  imports: [ProjetsModule],
})
export class AppModule {}
```

---

## L'injection de dépendances (un mot compliqué)

Regarde un controller qui utilise un service :

```typescript
import { Controller, Get } from '@nestjs/common';
import { ProjetsService } from './projets.service';

@Controller('projets')
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  @Get()
  trouverTous(): string[] {
    return this.projetsService.trouverTous();
  }
}
```

Tu vois cette ligne `constructor(private readonly projetsService: ProjetsService) {}` ?
On n'écrit **nulle part** `new ProjetsService()`. Et pourtant, ça marche.

C'est ça **l'injection de dépendances** (DI = Dependency Injection).

### Analogie

Imagine que le serveur du restaurant a besoin du cuisinier pour faire son travail.
Au lieu que le serveur aille chercher un cuisinier dans la rue, **le restaurant lui en livre un** quand il commence sa journée.

NestJS, c'est le restaurant. Quand il crée le `ProjetsController`, il regarde les paramètres du constructor, voit qu'il a besoin d'un `ProjetsService`, et **lui en livre un automatiquement**.

### Pourquoi c'est génial ?

- **Tu ne fabriques jamais les services à la main** : moins d'erreurs.
- **Tu peux échanger un vrai service contre un faux** dans les tests (cours 09).
- **Tout est branché tout seul**.

### Les mots-clés du constructor

```typescript
constructor(private readonly projetsService: ProjetsService) {}
```

- `private` : ce service est utilisable seulement à l'intérieur de la classe.
- `readonly` : on ne peut pas le remplacer par un autre après. Sécurité.
- `projetsService: ProjetsService` : nom + type. Le type sert à NestJS pour savoir **quoi livrer**.

C'est un raccourci de TypeScript : en mettant `private readonly` dans le constructor, ça crée automatiquement la propriété `this.projetsService`. Pas besoin de l'écrire deux fois.

---

## Le triangle Controller / Service / Module

```
            Module (la cuisine)
           /                  \
   Controller  --utilise-->  Service
   (le serveur)              (le cuisinier)
```

- Le **Controller** reçoit les demandes HTTP et délègue.
- Le **Service** fait le vrai travail.
- Le **Module** range les deux ensemble et les présente au reste de l'application.

---

## TypeScript vu dans ce cours

- **Décorateurs** : `@Controller`, `@Get`, `@Injectable`, `@Module`. Une fonction qui s'attache à une classe ou à une méthode pour ajouter du comportement. On reconnaît un décorateur à son `@`.
- **Constructor avec `private readonly`** : raccourci pour déclarer une propriété et la rendre lisible-seule, en une seule ligne.

---

## Application sur le projet

Pas encore de code à taper, c'est de la théorie. Au prochain cours, on génère le **vrai module Projets** dans ton backend.

---

## Résumé

- **Controller** = serveur du restaurant : reçoit la commande, ne cuisine pas.
- **Service** = cuisinier : fait le vrai travail.
- **Module** = la cuisine entière : range les controllers et les services ensemble.
- **Injection de dépendances** : NestJS livre les services dont tu as besoin, tu n'as jamais à faire `new`.
- Décorateurs : `@Controller`, `@Injectable`, `@Module`, `@Get`.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 02 — Installation et structure](./02_installation-et-structure.md)
- → Suivant : [Cours 04 — Premier endpoint : les projets](./04_premier-endpoint-projets.md)
- Sommaire : [README](../README.md)
