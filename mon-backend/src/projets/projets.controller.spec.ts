import { Test, TestingModule } from '@nestjs/testing';
import type { Projet } from './projet.entity';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';

describe('ProjetsController', () => {
  let controller: ProjetsController;
  let service: jest.Mocked<ProjetsService>;

  const projetsFictifs: Projet[] = [
    {
      slug: 'demo',
      titre: 'Demo',
      description: 'Un projet de demo',
      technologies: ['TypeScript'],
      lien: 'https://exemple.com',
    },
  ];

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<ProjetsService>> = {
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
