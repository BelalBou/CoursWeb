import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AdminTokenGuard } from './admin-token.guard';
import { CreateAdminProjetDto } from './dto/create-admin-projet.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';

@Controller('admin')
@UseGuards(AdminTokenGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  @Get('messages')
  async listerMessages() {
    return this.prisma.message.findMany({
      orderBy: { recuLe: 'desc' },
    });
  }

  @Post('messages/:id/reply')
  async repondreAuMessage(
    @Param('id') id: string,
    @Body() dto: ReplyMessageDto,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    await this.mail.envoyerReponse({
      to: message.email,
      subject: dto.subject,
      text: dto.message,
    });

    return { ok: true };
  }

  @Get('projets')
  async listerProjets() {
    return this.prisma.projet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        technologies: {
          include: { technologie: true },
        },
      },
    });
  }

  @Post('projets')
  async creerProjet(@Body() dto: CreateAdminProjetDto) {
    return this.prisma.projet.create({
      data: {
        slug: dto.slug,
        titre: dto.titre,
        description: dto.description,
        lien: dto.lien,
        estPublie: dto.estPublie ?? true,
        technologies: {
          create: dto.technologies.map((nom) => ({
            technologie: {
              connectOrCreate: {
                where: { nom },
                create: { nom },
              },
            },
          })),
        },
      },
    });
  }
}
