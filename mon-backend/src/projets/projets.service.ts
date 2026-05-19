import { Injectable, NotFoundException } from '@nestjs/common';
import { Projet } from './projet.entity';
import { PrismaService } from '../prisma/prisma.service';

type ProjetAvecTechnologies = {
  slug: string;
  titre: string;
  description: string;
  lien: string;
  technologies: {
    technologie: {
      nom: string;
    };
  }[];
};

@Injectable()
export class ProjetsService {
  constructor(private readonly prisma: PrismaService) {}

  async trouverTous(): Promise<Projet[]> {
    const projets = await this.prisma.projet.findMany({
      where: { estPublie: true },
      orderBy: { createdAt: 'desc' },
      include: {
        technologies: {
          include: { technologie: true },
        },
      },
    });

    return projets.map((projet) => this.toEntity(projet));
  }

  async trouverParSlug(slug: string): Promise<Projet> {
    const projet = await this.prisma.projet.findUnique({
      where: { slug },
      include: {
        technologies: {
          include: { technologie: true },
        },
      },
    });

    if (!projet) {
      throw new NotFoundException(`Projet "${slug}" introuvable`);
    }

    return this.toEntity(projet);
  }

  private toEntity(projet: ProjetAvecTechnologies): Projet {
    return {
      slug: projet.slug,
      titre: projet.titre,
      description: projet.description,
      lien: projet.lien,
      technologies: projet.technologies.map(
        ({ technologie }) => technologie.nom,
      ),
    };
  }
}
