import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsInt } from 'class-validator';
import { AnnouncementScope } from '../entities/Announcement.js'; // Ensure path
import { Transform } from 'class-transformer';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(AnnouncementScope)
  scope!: AnnouncementScope;

  @IsOptional()
  @IsDateString() // Validates ISO 8601 strings
  @Transform(({ value }) => value === '' ? null : value)
  expires_at?: string;

  @IsOptional()
  @IsInt()
  target_org_id?: number;
}