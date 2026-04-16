import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class SubmitFeedbackDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateFeedbackDto {
  @IsEnum(['PENDING', 'REVIEWED', 'RESOLVED'])
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
}
