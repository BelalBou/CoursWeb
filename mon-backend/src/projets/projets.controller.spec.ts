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
      trouverTous: jest.fn().mockResolvedValue(projetsFictifs),
      trouverParSlug: jest.fn().mockResolvedValue(projetsFictifs[0]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjetsController],
      providers: [{ provide: ProjetsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProjetsController>(ProjetsController);
    service = module.get(ProjetsService);
  });

  it('GET /projets renvoie la liste', async () => {
    await expect(controller.trouverTous()).resolves.toEqual(projetsFictifs);
    expect(service.trouverTous.mock.calls).toHaveLength(1);
  });

  it('GET /projets/:slug renvoie le projet et appelle le service avec le bon slug', async () => {
    const projet = await controller.trouverParSlug('demo');

    expect(projet.slug).toBe('demo');
    expect(service.trouverParSlug.mock.calls[0]).toEqual(['demo']);
  });
});
