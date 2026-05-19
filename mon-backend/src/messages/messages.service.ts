import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(dto: CreateMessageDto): Promise<Message> {
    try {
      const message = await this.prisma.message.create({
        data: dto,
      });

      return this.toEntity(message);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Tu as deja envoye ce message');
      }

      throw error;
    }
  }

  async trouverTous(): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      orderBy: { recuLe: 'desc' },
    });

    return messages.map((message) => this.toEntity(message));
  }

  private toEntity(message: Message): Message {
    return {
      id: message.id,
      nom: message.nom,
      email: message.email,
      message: message.message,
      recuLe: message.recuLe,
    };
  }
}
