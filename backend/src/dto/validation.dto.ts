import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsInt, IsBoolean, IsDateString } from 'class-validator';

// --- AUTH DTOs ---

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
  
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

/*
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Full Name is required' })
  full_name!: string;
}
*/
// --- LOG DTOs ---
// Used in LogController

export class CreateLogDto {
  @IsOptional()
  @IsInt()
  case_id?: number; // Often passed via URL params, but good to have in DTO type

  @IsDateString() // Validates ISO date format
  @IsNotEmpty()
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

  @IsOptional()
  @IsString()
  file_path?: string;

  @IsOptional()
  @IsString()
  file_extension?: string;
}