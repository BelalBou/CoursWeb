import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { AdminController } from './admin.controller';
import { AdminTokenGuard } from './admin-token.guard';

@Module({
  imports: [MailModule],
  controllers: [AdminController],
  providers: [AdminTokenGuard],
})
export class AdminModule {}
