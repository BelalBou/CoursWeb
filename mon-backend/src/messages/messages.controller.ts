import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import type { Message } from './message.entity';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  creer(@Body() dto: CreateMessageDto): Promise<Message> {
    return this.messagesService.creer(dto);
  }
}
