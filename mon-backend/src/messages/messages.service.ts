import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  private readonly messages: Message[] = [];

  creer(dto: CreateMessageDto): Message {
    const dejaEnvoye = this.messages.some(
      (m) => m.email === dto.email && m.message === dto.message,
    );

    if (dejaEnvoye) {
      throw new ConflictException('Tu as deja envoye ce message');
    }

    const message: Message = {
      id: randomUUID(),
      nom: dto.nom,
      email: dto.email,
      message: dto.message,
      recuLe: new Date(),
    };

    this.messages.push(message);
    return message;
  }

  trouverTous(): Message[] {
    return this.messages;
  }
}
