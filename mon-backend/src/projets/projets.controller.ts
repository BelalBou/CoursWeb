import { Controller, Get, Param } from '@nestjs/common';
import type { Projet } from './projet.entity';
import { ProjetsService } from './projets.service';

@Controller('projets')
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  @Get()
  trouverTous(): Projet[] {
    return this.projetsService.trouverTous();
  }

  @Get(':slug')
  trouverParSlug(@Param('slug') slug: string): Projet {
    return this.projetsService.trouverParSlug(slug);
  }
}
