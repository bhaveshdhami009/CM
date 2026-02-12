import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateSettingDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]+$/, { message: 'Key must be lowercase snake_case' })
  key?: string;

  @IsNotEmpty()
  value!: any;

  @IsOptional()
  @IsString()
  description?: string;
}