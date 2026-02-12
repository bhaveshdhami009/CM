import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, Min, Max, MinLength, IsBoolean, IsHexColor } from 'class-validator';
import { ROLES } from '../config/roles.js';

export class CreateTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string; // Matches frontend payload usually, map to full_name in controller

  @IsEmail()
  email!: string;

  @IsInt()
  @Min(ROLES.VIEWER)
  @Max(ROLES.ORG_ADMIN)
  role!: number;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsHexColor()
  accent?: string;

  @IsOptional()
  @IsBoolean()
  is_dark_mode?: boolean;
}