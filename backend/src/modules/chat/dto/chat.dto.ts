import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class CreateSessionDto {
  @IsString()
  @IsOptional()
  title?: string;
}
