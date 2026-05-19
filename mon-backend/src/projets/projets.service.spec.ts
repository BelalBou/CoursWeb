import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProjetsService } from './projets.service';

describe('ProjetsService', () => {
  let service: ProjetsService;
  let prisma: {
    projet: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  const projetPrisma = {
    slug: 'portfolio',
    titre: 'Portfolio personnel',
    description: 'Mon site vitrine en Next.js et Tailwind.',
    lien: 'https://exemple.com/portfolio',
    technologies: [
      { technologie: { nom: 'Next.js' } },
      { technologie: { nom: 'TypeScript' } },
    ],
  };

  beforeEach(async () => {
    prisma = {
      projet: {
        findMany: jest.fn().mockResolvedValue([projetPrisma]),
        findUnique: jest.fn().mockResolvedValue(projetPrisma),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjetsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ProjetsService>(ProjetsService);
  });

  it('doit etre defini', () => {
    expect(service).toBeDefined();
  });

  describe('trouverTous', () => {
    it('retourne au moins un projet', async () => {
      const projets = await service.trouverTous();
      expect(projets.length).toBeGreaterThan(0);
    });

    it('chaque projet a un slug et un titre', async () => {
      const projets = await service.trouverTous();

      for (const projet of projets) {
        expect(projet.slug).toBeDefined();
        expect(projet.titre).toBeDefined();
      }
    });
  });

  describe('trouverParSlug', () => {
    it('retourne le projet quand le slug existe', async () => {
      const projet = await service.trouverParSlug('portfolio');
      expect(projet.slug).toBe('portfolio');
    });

    it("lance NotFoundException quand le slug n'existe pas", async () => {
      prisma.projet.findUnique.mockResolvedValue(null);

      await expect(service.trouverParSlug('inexistant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
