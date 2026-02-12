import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateDistrictDto {
  @IsOptional()
  @IsInt()
  id?: number;
  
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;
}

export class CreateCourtDto {
  @IsOptional()
  @IsInt()
  id?: number;
  
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  district_id!: number;
}

export class CreateEstablishmentDto {
  @IsOptional()
  @IsInt()
  id?: number;
  
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  district_id!: number;
}

export class CreateJudgeDto {
  @IsOptional()
  @IsInt()
  id?: number;
  
  @IsString()
  @IsNotEmpty()
  name!: string;
}