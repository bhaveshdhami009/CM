import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, IsPhoneNumber } from 'class-validator';

export class CreatePartyDto {
  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @IsOptional()
  @IsString()
  middle_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  // Enforce Mobile Format (Indian)
  @IsOptional()
  @IsPhoneNumber('IN') 
  mobile?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  mobile2?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  father_name?: string;

  @IsOptional()
  @IsString()
  mother_name?: string;

  @IsOptional()
  @IsString()
  guardian?: string;

  @IsOptional()
  @IsString()
  guardian_relation?: string;

  @IsOptional()
  @IsString()
  address_line_1?: string;

  @IsOptional()
  @IsString()
  address_line_2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  // Strict Pincode: 6 digits
  @IsOptional()
  @Matches(/^[0-9]{6}$/, { message: 'Pincode must be exactly 6 digits' })
  pincode?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}