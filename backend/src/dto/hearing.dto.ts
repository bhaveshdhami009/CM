import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateHearingDto {
  @IsDateString()
  hearing_date!: string;

  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @IsOptional()
  @IsString()
  court_room?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number) // Cast "5" to 5
  @Transform(({ value }) => value === '' ? null : value) 
  judge_id?: number;
}
