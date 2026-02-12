import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateOrgDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Admin User Init
  @IsEmail()
  admin_email!: string;

  @IsString()
  @IsNotEmpty()
  admin_name!: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  admin_password?: string;
}