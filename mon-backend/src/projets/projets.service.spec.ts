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

  it('doit etre defini', () => {
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

    it("lance NotFoundException quand le slug n'existe pas", () => {
      expect(() => service.trouverParSlug('inexistant')).toThrow(
        NotFoundException,
      );
    });
  });
});
