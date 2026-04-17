import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum FeedbackStatusDto {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

export class SubmitFeedbackDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class UpdateFeedbackDto {
  @IsEnum(FeedbackStatusDto)
  status!: FeedbackStatusDto;
}
