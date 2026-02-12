var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsDateString, ValidateNested, IsNumber, Min, registerDecorator } from 'class-validator';
import { Type, Transform } from 'class-transformer';
const EmptyToNull = () => Transform(({ value }) => value === '' ? null : value);
export function IsDistinctParties(property, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: 'isDistinctParties',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = args.object[relatedPropertyName];
                    // value = petitionerIds, relatedValue = respondentIds
                    if (!Array.isArray(value) || !Array.isArray(relatedValue))
                        return true; // Skip if format invalid
                    const setA = new Set(value);
                    // Check if any item in setA exists in relatedValue
                    for (const item of relatedValue) {
                        if (setA.has(item))
                            return false; // Duplicate found!
                    }
                    return true;
                },
                defaultMessage(args) {
                    return 'A party cannot be both a Petitioner and a Respondent in the same case.';
                }
            },
        });
    };
}
class DlsaDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DlsaDto.prototype, "letterNo", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DlsaDto.prototype, "registrationNo", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    EmptyToNull(),
    __metadata("design:type", String)
], DlsaDto.prototype, "letterDate", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DlsaDto.prototype, "remarks", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    EmptyToNull(),
    __metadata("design:type", String)
], DlsaDto.prototype, "billedOn", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    EmptyToNull(),
    __metadata("design:type", String)
], DlsaDto.prototype, "receivedOn", void 0);
class ExecutionDto {
}
__decorate([
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], ExecutionDto.prototype, "amount", void 0);
__decorate([
    IsDateString(),
    __metadata("design:type", String)
], ExecutionDto.prototype, "start_date", void 0);
__decorate([
    IsDateString(),
    __metadata("design:type", String)
], ExecutionDto.prototype, "next_due_date", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ExecutionDto.prototype, "remarks", void 0);
export class CreateCaseDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "fileNo", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "filingNo", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    EmptyToNull(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "filingDate", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "caseType", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "caseNo", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    EmptyToNull(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "receivedDate", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "act", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "section", void 0);
__decorate([
    IsInt(),
    __metadata("design:type", Number)
], CreateCaseDto.prototype, "districtId", void 0);
__decorate([
    IsInt(),
    __metadata("design:type", Number)
], CreateCaseDto.prototype, "courtId", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateCaseDto.prototype, "establishmentId", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "remarks", void 0);
__decorate([
    IsArray(),
    IsInt({ each: true }),
    IsNotEmpty({ message: 'At least one Petitioner is required' }),
    __metadata("design:type", Array)
], CreateCaseDto.prototype, "petitionerIds", void 0);
__decorate([
    IsArray(),
    IsInt({ each: true }),
    IsNotEmpty({ message: 'At least one Respondent is required' }),
    IsDistinctParties('petitionerIds') // Check against petitionerIds
    ,
    __metadata("design:type", Array)
], CreateCaseDto.prototype, "respondentIds", void 0);
__decorate([
    IsOptional(),
    ValidateNested(),
    Type(() => DlsaDto),
    __metadata("design:type", DlsaDto)
], CreateCaseDto.prototype, "dlsa", void 0);
__decorate([
    IsOptional(),
    ValidateNested(),
    Type(() => ExecutionDto),
    __metadata("design:type", ExecutionDto)
], CreateCaseDto.prototype, "execution", void 0);
//# sourceMappingURL=case.dto.js.map