# Cours 09 — Tests unitaires

## Ce qu'on va voir
Pourquoi et comment **tester** ton code. Écrire un test du `ProjetsService`, un test du controller avec un service "faux" (un mock), et lancer la batterie de tests.

---

## Pourquoi tester ?

Imagine que tu cuisines une grande sauce pour 50 personnes. Tu **goûtes** au fur et à mesure. Tu ne sers pas à l'aveugle.

Tester ton code, c'est goûter ta sauce. C'est vérifier que chaque petit morceau marche **avant** que le client ne s'en aperçoive.

### Les bénéfices

- Tu **détectes les bugs avant la prod**.
- Tu peux **refactorer** sans peur (changer l'intérieur sans casser l'extérieur).
- Les tests servent de **documentation vivante** : ils montrent comment utiliser ton code.
- Une équipe avec des tests dort mieux la nuit. Vraiment.

---

## Trois niveaux de tests

| Type | Ce qu'on teste | Vitesse | Fragilité |
|---|---|---|---|
| **Unitaire** | Une fonction / une classe isolée | Très rapide | Très stable |
| **Intégration** | Plusieurs morceaux qui communiquent | Moyen | Moyenne |
| **End-to-end (e2e)** | L'application entière, comme un vrai utilisateur | Lent | Plus fragile |

On commence par les **tests unitaires**, c'est ce qui rapporte le plus pour l'effort.

---

## Jest, l'outil de test

NestJS livre **Jest** par défaut. Pas besoin d'installer quoi que ce soit. Les fichiers de test ont l'extension **`.spec.ts`**.

Le CLI a déjà créé `projets.service.spec.ts` quand on a généré le service au cours 04. Ouvrons-le.

---

## Tester `ProjetsService`

Remplace le contenu de `src/projets/projets.service.spec.ts` par :

```typescript
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjetsService } from './projets.service';

describe('ProjetsService', () => {
  let service: ProjetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjetsService],
    }).compile();

    service = module.get<ProjetsService>(ProjetsService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('trouverTous', () => {
    it('retourne au moins un projet', () => {
      const projets = service.trouverTous();
      expect(projets.length).toBeGreaterThan(0);
    });

    it('chaque projet a un slug et un titre', () => {
      const projets = service.trouverTous();
      for (const projet of projets) {
        expect(projet.slug).toBeDefined();
        expect(projet.titre).toBeDefined();
      }
    });
  });

  describe('trouverParSlug', () => {
    it('retourne le projet quand le slug existe', () => {
      const projet = service.trouverParSlug('portfolio');
      expect(projet.slug).toBe('portfolio');
    });

    it('lance NotFoundException quand le slug n\'existe pas', () => {
      expect(() => service.trouverParSlug('inexistant')).toThrow(NotFoundException);
    });
  });
});
```

Décortiquons :

### `describe`
Regroupe des tests qui parlent de la même chose. C'est juste pour organiser. On peut les imbriquer.

### `beforeEach`
S'exécute **avant chaque test**. On y crée une instance fraîche du service. Ça garantit que les tests n'interfèrent pas entre eux.

### `Test.createTestingModule`
Un mini-NestJS spécialement pour les tests. On dit "j'ai besoin de `ProjetsService` comme provider". NestJS construit le module et nous le donne.

### `it`
Un test individuel. La phrase doit décrire ce que le test vérifie.

### `expect(...).toBe(...)`, `.toBeDefined()`, `.toBeGreaterThan(...)`, `.toThrow(...)`
Les **matchers** de Jest : ce qu'on vérifie. Très lisible : "j'attends que X soit défini", "j'attends que Y lance une exception".

---

## Lancer les tests

Dans `mon-backend/` :

```bash
npm test
```

Tu vas voir une jolie sortie verte si tout passe :

```
PASS  src/projets/projets.service.spec.ts
  ProjetsService
    ✓ doit être défini
    trouverTous
      ✓ retourne au moins un projet
      ✓ chaque projet a un slug et un titre
    trouverParSlug
      ✓ retourne le projet quand le slug existe
      ✓ lance NotFoundException quand le slug n'existe pas
```

Pour les **relancer automatiquement** à chaque modification :

```bash
npm run test:watch
```

---

## Tester un controller avec un mock du service

Le controller dépend du service. Dans un test unitaire, on **ne veut pas du vrai service** : on veut un **faux** qu'on contrôle. Ça permet d'isoler le controller.

Un **mock** = un objet qui imite l'interface du vrai, mais avec un comportement programmé pour le test.

Modifie `src/projets/projets.controller.spec.ts` :

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';
import { Projet } from './projet.entity';

describe('ProjetsController', () => {
  let controller: ProjetsController;
  let service: jest.Mocked<ProjetsService>;

  const projetsFictifs: Projet[] = [
    {
      slug: 'demo',
      titre: 'Démo',
      description: 'Un projet de démo',
      technologies: ['TypeScript'],
      lien: 'https://exemple.com',
    },
  ];

  beforeEach(async () => {
    const mockService: Partial<ProjetsService> = {
      trouverTous: jest.fn().mockReturnValue(projetsFictifs),
      trouverParSlug: jest.fn().mockReturnValue(projetsFictifs[0]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjetsController],
      providers: [{ provide: ProjetsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProjetsController>(ProjetsController);
    service = module.get(ProjetsService);
  });

  it('GET /projets renvoie la liste', () => {
    expect(controller.trouverTous()).toEqual(projetsFictifs);
    expect(service.trouverTous.mock.calls).toHaveLength(1);
  });

  it('GET /projets/:slug renvoie le projet et appelle le service avec le bon slug', () => {
    const projet = controller.trouverParSlug('demo');
    expect(projet.slug).toBe('demo');
    expect(service.trouverParSlug.mock.calls[0]).toEqual(['demo']);
  });
});
```

Points clés :

### `jest.fn().mockReturnValue(...)`
Crée une fonction "espionne" qui :
- Retourne ce qu'on lui dit.
- **Note tous les appels** : combien de fois, avec quels arguments.

### `useValue: mockService`
On dit à NestJS : "quand quelqu'un demande `ProjetsService`, donne-lui **ça** à la place du vrai".

C'est **ça** la magie de l'injection de dépendances : on échange une vraie classe contre une fausse sans toucher au controller.

### `mock.calls`
On vérifie que le controller a bien appelé le service, **comme il fallait**. `mock.calls` contient la liste des appels reçus par la fonction mockée. Avec ESLint strict, cette forme évite aussi l'erreur `unbound-method`.

---

## Tests end-to-end (en bref)

Le CLI a aussi créé `test/app.e2e-spec.ts`. C'est un test qui démarre **une vraie app NestJS** et envoie de vraies requêtes HTTP avec **`supertest`**.

Exemple :

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/projets (GET) renvoie 200 et un tableau', () => {
    return request(app.getHttpServer())
      .get('/projets')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

Pour les lancer :

```bash
npm run test:e2e
```

Ces tests sont plus lents mais beaucoup plus proches de la réalité. À utiliser pour les flows critiques (par exemple : "le formulaire de contact créé bien un message en base").

---

## TypeScript vu dans ce cours

- **`jest.Mocked<T>`** : un type qui dit "c'est une version mockée de `T`". Pratique pour avoir l'autocomplétion sur les `mockReturnValue`.
- **`Partial<T>`** : un type qui dit "tous les champs de `T` deviennent optionnels". Utile quand on mocke seulement une partie des méthodes.
- **`{ provide: ProjetsService, useValue: mockService }`** : la syntaxe NestJS pour fournir un objet à la place d'un service.

---

## Application sur le projet

Tu as :
- Écrit un test du `ProjetsService` qui couvre `trouverTous` et `trouverParSlug` (cas OK + cas not found).
- Écrit un test du `ProjetsController` avec un mock du service.
- Lancé `npm test` et vu les tests passer en vert.
- Pris connaissance des tests e2e dans `test/app.e2e-spec.ts`.

---

## Résumé

- Tester = goûter la sauce avant de servir.
- **Jest** est livré d'office avec NestJS, pas d'install supplémentaire.
- Tests unitaires : `Test.createTestingModule({ providers: [...] })`.
- Mock = un faux service qu'on contrôle avec `jest.fn().mockReturnValue(...)`.
- `npm test` lance tout, `npm run test:watch` relance à chaque change.
- `npm run test:e2e` pour les tests bout en bout (plus lents, plus réalistes).

---

## Questions
*(Cette section sera remplie au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 08 — Configuration et environnement](./08_config-et-environnement.md)
- → Suivant : [Cours 10 — S'organiser pour grandir](./10_organisation-pour-grandir.md)
- Sommaire : [README](../README.md)
