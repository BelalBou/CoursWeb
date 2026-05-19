import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminProjetDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  titre!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @IsString()
  @IsUrl({ require_tld: false })
  lien!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  technologies!: string[];

  @IsOptional()
  @IsBoolean()
  estPublie?: boolean;
}
