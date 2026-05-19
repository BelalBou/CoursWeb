import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.header('x-admin-token');
    const expectedToken = this.config.get<string>('ADMIN_TOKEN');

    if (!expectedToken || token !== expectedToken) {
      throw new UnauthorizedException('Acces admin refuse');
    }

    return true;
  }
}
