# Cours 10 — S'organiser pour grandir

## Ce qu'on va voir
Comment **structurer** ton backend pour qu'il tienne la route quand l'équipe passe de 1 à 50 développeurs. Conventions de dossiers, code partagé, health check, logger, et un mot sur Swagger.

---

## La règle d'or : un module par feature

Une **feature** (fonctionnalité), c'est un sujet métier : les projets, les messages, les utilisateurs, les commandes, etc.

Chaque feature doit avoir **son propre module**, dans son propre dossier. C'est ce qu'on a fait jusqu'ici sans en parler.

```
src/
├── projets/
│   ├── dto/
│   ├── projets.controller.ts
│   ├── projets.module.ts
│   ├── projets.service.ts
│   └── projet.entity.ts
├── messages/
│   ├── dto/
│   ├── messages.controller.ts
│   ├── messages.module.ts
│   ├── messages.service.ts
│   └── message.entity.ts
├── app.module.ts
└── main.ts
```

### Pourquoi c'est important ?

- Quand tu cherches du code, tu sais **où regarder**.
- Quand tu ajoutes une feature, tu sais **où la mettre**.
- Tu peux supprimer un module sans casser le reste.
- Plusieurs développeurs peuvent bosser sur des modules différents sans se gêner.

---

## La structure interne d'un module

Pour chaque feature, on adopte la même structure :

```
projets/
├── dto/                          <- DTOs (entrées et sorties)
│   ├── create-projet.dto.ts
│   └── update-projet.dto.ts
├── interfaces/                   <- types et interfaces partagés (optionnel)
├── projet.entity.ts              <- la forme de la donnée
├── projets.controller.ts         <- endpoints HTTP
├── projets.controller.spec.ts    <- tests du controller
├── projets.service.ts            <- logique métier
├── projets.service.spec.ts       <- tests du service
└── projets.module.ts             <- déclaration du module
```

### Les conventions de nommage

| Fichier | Convention |
|---|---|
| Module | `*.module.ts` |
| Controller | `*.controller.ts` |
| Service | `*.service.ts` |
| DTO | `*.dto.ts` (en kebab-case) |
| Entité | `*.entity.ts` |
| Test | `*.spec.ts` (unitaire) ou `*.e2e-spec.ts` (e2e) |

Tout le monde dans l'équipe sait à quoi sert un fichier juste en regardant son nom.

---

## Le dossier `common/` : ce qu'on partage entre tous les modules

Certaines briques sont **transversales** : elles ne sont pas liées à une feature particulière.

```
src/common/
├── filters/
│   └── http-exception.filter.ts
├── pipes/
│   └── parse-objectid.pipe.ts
├── guards/
│   └── auth.guard.ts
├── interceptors/
│   └── logging.interceptor.ts
└── decorators/
    └── current-user.decorator.ts
```

Quatre concepts à connaître par leur nom :

- **Filter** : intercepte les **erreurs** et formate la réponse (cours 06).
- **Pipe** : transforme ou valide une **donnée d'entrée** avant qu'elle arrive au controller. `ValidationPipe` en est un.
- **Guard** : décide si une requête peut passer (utile pour l'**authentification**, plus tard).
- **Interceptor** : enveloppe l'exécution pour faire un truc avant/après (logger, mettre en cache, transformer la réponse).

Pour l'instant, tu n'en as pas besoin. Mais quand tu liras du code NestJS d'autres équipes, tu verras ces noms partout. Maintenant tu sais ce qu'ils veulent dire.

---

## Le dossier `config/`

Tout ce qui touche à la **configuration** au démarrage :

```
src/config/
├── env.validation.ts       <- le schéma de validation (cours 08)
└── app.config.ts           <- export de constantes utiles
```

---

## Health check : "es-tu en vie ?"

Un **health check** est un endpoint qui répond simplement "oui je tourne". Très utile en production : les serveurs (Docker, Kubernetes, Vercel) appellent cet endpoint régulièrement pour savoir s'ils doivent redémarrer ton app.

NestJS fournit un module officiel : **`@nestjs/terminus`**.

```bash
npm install @nestjs/terminus
```

Crée `src/health/health.module.ts` :

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

Et `src/health/health.controller.ts` :

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check(): ReturnType<HealthCheckService['check']> {
    return this.health.check([]);
  }
}
```

Ajoute `HealthModule` dans `app.module.ts`.

`GET /health` répond :

```json
{
  "status": "ok",
  "info": {},
  "error": {},
  "details": {}
}
```

Plus tard, on ajoutera des indicateurs (la base est-elle joignable ? Le disque est-il plein ?).

---

## Logger structuré

NestJS livre un logger intégré, **`Logger`** :

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ProjetsService {
  private readonly logger = new Logger(ProjetsService.name);

  trouverTous() {
    this.logger.log('Récupération de tous les projets');
    return this.projets;
  }
}
```

Les niveaux : `log`, `warn`, `error`, `debug`, `verbose`.

En production, on remplace souvent `Logger` par **Pino** ou **Winston**, qui produisent du **JSON structuré** (plus facile à parser par un outil de logs comme Datadog, Loki...). Ce sera ton problème quand tu en auras un. Pour l'instant, le `Logger` natif suffit.

---

## Swagger : la documentation API automatique

**Swagger** (alias OpenAPI) est un standard pour décrire ton API. Il affiche une **page web interactive** où tu peux tester chaque endpoint en cliquant sur des boutons.

NestJS s'intègre nativement :

```bash
npm install @nestjs/swagger
```

Dans `main.ts` :

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const swaggerConfig = new DocumentBuilder()
  .setTitle('Mon Backend')
  .setDescription('API du portfolio')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api/docs', app, document);
```

Va sur `http://localhost:3001/api/docs` : tu vois ta doc auto-générée. Tu peux annoter tes DTOs avec `@ApiProperty()` pour enrichir la doc.

C'est génial pour :
- Travailler avec d'autres équipes (mobile, front).
- Onboarder de nouveaux développeurs.
- Tester rapidement sans Postman.

---

## Quelques règles d'équipe à 50 développeurs

1. **Un module = une feature.** Pas de fourre-tout.
2. **Pas de logique métier dans les controllers.** Ils orchestrent, point.
3. **DTO en entrée, entité en sortie.** Toujours typer.
4. **Pas de `any` sauf raison écrite en commentaire.**
5. **Tests pour toute logique non triviale.**
6. **Variables d'environnement validées au démarrage.**
7. **Erreurs explicites avec exceptions Nest.**
8. **Format JSON cohérent pour toutes les réponses.**
9. **Logger les erreurs serveur, pas les afficher au client.**
10. **Une PR = une feature ou un fix, jamais les deux mélangés.**

---

## Et ensuite ?

Tu maîtrises maintenant :
- Une architecture **propre** : controllers / services / modules.
- La **validation** des entrées.
- La **gestion des erreurs**.
- La **connexion** avec ton frontend Next.js (CORS).
- La **configuration** par environnement.
- Les **tests** unitaires.

Mais ton backend stocke encore tes données dans un **tableau en mémoire**. Si tu redémarres le serveur, tout est perdu.

C'est pour ça que la prochaine étape est essentielle : on va apprendre **PostgreSQL**, une vraie base de données. Ensuite seulement, on ajoutera **Prisma**, l'outil qui permettra à NestJS de parler à cette base proprement. Puis **Linux**, pour déployer tout ça sur un serveur.

Une couche à la fois, comme toujours.

---

## TypeScript vu dans ce cours

- **`ReturnType<T>`** : un type qui prend automatiquement le type de retour d'une fonction. Pratique quand on ne veut pas le répéter.
- **`T['method']`** : accéder au type d'une propriété d'un objet (`HealthCheckService['check']`).

---

## Application sur le projet

À tête reposée, regarde l'arborescence de ton `mon-backend/src/` :
- `projets/` et `messages/` sont des features bien séparées.
- `config/env.validation.ts` valide la config au démarrage.
- Tu peux ajouter `health/` pour le health check si tu veux t'entraîner.
- Si tu veux jouer avec Swagger, ajoute-le dans `main.ts` et explore l'interface.

---

## Résumé

- **Un module par feature**, structure interne identique partout.
- **Conventions de nommage strictes** : `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.entity.ts`.
- Dossier **`common/`** pour les filters, pipes, guards, interceptors.
- **Health check** avec `@nestjs/terminus`.
- **Logger** intégré pour les messages serveur.
- **Swagger** pour la doc API automatique.
- Prochaine étape : **PostgreSQL**, puis **Prisma**, pour stocker pour de vrai.

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 09 — Tests unitaires](./09_tests-unitaires.md)
- → Suivant : [Cours 01 PostgreSQL — C'est quoi une base de données ?](../postgresql/01_cest-quoi-une-base-de-donnees.md)
- Sommaire : [README](../README.md)
