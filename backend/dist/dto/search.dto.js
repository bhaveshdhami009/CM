var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsInt, IsEnum, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
export class FilterCondition {
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], FilterCondition.prototype, "field", void 0);
__decorate([
    IsString(),
    IsNotEmpty()
    // You can create a custom validator here to check if operator is valid
    ,
    __metadata("design:type", String)
], FilterCondition.prototype, "operator", void 0);
__decorate([
    IsNotEmpty(),
    __metadata("design:type", Object)
], FilterCondition.prototype, "value", void 0);
export class AdvancedSearchDto {
}
__decorate([
    IsString(),
    IsNotEmpty()
    // Could allow specific strings: @IsIn(['cases', 'hearings', 'logs'])
    ,
    __metadata("design:type", String)
], AdvancedSearchDto.prototype, "entityType", void 0);
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => FilterCondition),
    __metadata("design:type", Array)
], AdvancedSearchDto.prototype, "filters", void 0);
__decorate([
    IsString(),
    IsEnum(['AND', 'OR']),
    __metadata("design:type", String)
], AdvancedSearchDto.prototype, "logic", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], AdvancedSearchDto.prototype, "page", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], AdvancedSearchDto.prototype, "limit", void 0);
//# sourceMappingURL=search.dto.js.map