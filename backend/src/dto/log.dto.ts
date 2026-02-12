import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, IsBoolean } from 'class-validator';

export class CreateLogDto {
  @IsDateString()
  log_date!: string;

  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsBoolean()
  is_pending?: boolean;

  // File handling is usually done via Multer, but good to validate if passed manually
  @IsOptional()
  @IsString()
  file_path?: string;

  @IsOptional()
  @IsString()
  file_extension?: string;
}