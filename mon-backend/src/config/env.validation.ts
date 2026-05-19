import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  Matches,
  IsNumber,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

enum Environnement {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environnement)
  NODE_ENV!: Environnement;

  @IsNumber()
  PORT!: number;

  @IsString()
  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;

  @IsString()
  @Matches(/^postgresql:\/\/.+/)
  DATABASE_URL!: string;

  @IsString()
  ADMIN_TOKEN!: string;

  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @IsOptional()
  @IsNumber()
  SMTP_PORT?: number;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SMTP_PASS?: string;

  @IsOptional()
  @IsString()
  SMTP_FROM?: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
