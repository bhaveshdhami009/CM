import { 
  IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsDateString, 
  ValidateNested, IsNumber, Min, registerDecorator, ValidationOptions, ValidationArguments 
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const EmptyToNull = () => Transform(({ value }) => value === '' ? null : value);

export function IsDistinctParties(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDistinctParties',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          
          // value = petitionerIds, relatedValue = respondentIds
          if (!Array.isArray(value) || !Array.isArray(relatedValue)) return true; // Skip if format invalid

          const setA = new Set(value);
          // Check if any item in setA exists in relatedValue
          for (const item of relatedValue) {
            if (setA.has(item)) return false; // Duplicate found!
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'A party cannot be both a Petitioner and a Respondent in the same case.';
        }
      },
    });
  };
}


class DlsaDto {
  @IsOptional()
  @IsString()
  letterNo!: string;

  @IsOptional()
  @IsString()
  registrationNo?: string;

  @IsOptional()
  @IsDateString()
  @EmptyToNull()
  letterDate?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsDateString()
  @EmptyToNull()
  billedOn?: string;

  @IsOptional()
  @IsDateString()
  @EmptyToNull()
  receivedOn?: string;
}

class ExecutionDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  start_date!: string;
  
  @IsDateString()
  next_due_date!: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateCaseDto {
  @IsOptional()
  @IsString()
  fileNo?: string;

  @IsOptional()
  @IsString()
  filingNo?: string;

  @IsOptional()
  @IsDateString()
  @EmptyToNull()
  filingDate?: string;

  @IsString()
  @IsNotEmpty()
  caseType!: string;

  @IsOptional()
  @IsString()
  caseNo?: string;

  //@IsOptional()
  //@IsInt()
  //courtNo?: number;

  @IsOptional()
  @IsDateString()
  @EmptyToNull()
  receivedDate?: string;

  @IsOptional()
  @IsString()
  act?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsInt()
  districtId!: number; // For filtering

  @IsInt()
  courtId!: number;
  
  @IsOptional()
  @IsInt()
  establishmentId?: number; // Optional foreign key

  @IsOptional()
  @IsString()
  remarks?: string;

  // Arrays of IDs
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'At least one Petitioner is required' })
  petitionerIds!: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'At least one Respondent is required' })
  @IsDistinctParties('petitionerIds') // Check against petitionerIds
  respondentIds!: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DlsaDto)
  dlsa?: DlsaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExecutionDto)
  execution?: ExecutionDto;
}