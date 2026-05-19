import { Injectable, NotFoundException } from '@nestjs/common';
import { Projet } from './projet.entity';

@Injectable()
export class ProjetsService {
  private readonly projets: Projet[] = [
    {
      slug: 'portfolio',
      titre: 'Portfolio personnel',
      description: 'Mon site vitrine en Next.js et Tailwind.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind'],
      lien: 'https://exemple.com/portfolio',
    },
    {
      slug: 'gestion-tacos',
      titre: 'App de commande de tacos',
      description: 'Une petite app pour commander son tacos prefere.',
      technologies: ['React', 'Node.js'],
      lien: 'https://exemple.com/tacos',
    },
  ];

  trouverTous(): Projet[] {
    return this.projets;
  }

  trouverParSlug(slug: string): Projet {
    const projet = this.projets.find((p) => p.slug === slug);

    if (!projet) {
      throw new NotFoundException(`Projet "${slug}" introuvable`);
    }

    return projet;
  }
}
