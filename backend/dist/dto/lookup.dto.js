var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
export class CreateDistrictDto {
}
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateDistrictDto.prototype, "id", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateDistrictDto.prototype, "name", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateDistrictDto.prototype, "state", void 0);
export class CreateCourtDto {
}
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateCourtDto.prototype, "id", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "name", void 0);
__decorate([
    IsInt(),
    __metadata("design:type", Number)
], CreateCourtDto.prototype, "district_id", void 0);
export class CreateEstablishmentDto {
}
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateEstablishmentDto.prototype, "id", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateEstablishmentDto.prototype, "name", void 0);
__decorate([
    IsInt(),
    __metadata("design:type", Number)
], CreateEstablishmentDto.prototype, "district_id", void 0);
export class CreateJudgeDto {
}
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateJudgeDto.prototype, "id", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateJudgeDto.prototype, "name", void 0);
//# sourceMappingURL=lookup.dto.js.map