import { IsString, IsOptional, IsInt, IsEnum, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export type Operator = 'equals' | 'contains' | 'gt' | 'lt' | 'startsWith';

export class FilterCondition {
  @IsString()
  @IsNotEmpty()
  field!: string;

  @IsString()
  @IsNotEmpty()
  // You can create a custom validator here to check if operator is valid
  operator!: Operator; 

  @IsNotEmpty()
  value!: any;
}

export class AdvancedSearchDto {
  @IsString()
  @IsNotEmpty()
  // Could allow specific strings: @IsIn(['cases', 'hearings', 'logs'])
  entityType!: string; 

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterCondition)
  filters!: FilterCondition[];

  @IsString()
  @IsEnum(['AND', 'OR'])
  logic!: 'AND' | 'OR';

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  limit?: number;
}