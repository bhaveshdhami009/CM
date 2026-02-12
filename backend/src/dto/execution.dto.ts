import { IsNumber, IsDateString, IsOptional, IsString, Min, IsNotEmpty } from 'class-validator';

export class StartExecutionDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  start_date!: string; // ISO Date String
  
  @IsDateString()
  next_due_date!: string; // ISO Date String

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateExecutionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
  
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  next_due_date?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class MarkCycleCompleteDto {
  @IsOptional()
  @IsString()
  remarks?: string;
}