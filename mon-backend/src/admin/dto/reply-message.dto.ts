import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyMessageDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;
}
