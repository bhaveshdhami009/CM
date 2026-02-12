var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';
export class CreateHearingDto {
}
__decorate([
    IsDateString(),
    __metadata("design:type", String)
], CreateHearingDto.prototype, "hearing_date", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateHearingDto.prototype, "purpose", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateHearingDto.prototype, "court_room", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateHearingDto.prototype, "remarks", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateHearingDto.prototype, "outcome", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Type(() => Number) // Cast "5" to 5
    ,
    Transform(({ value }) => value === '' ? null : value),
    __metadata("design:type", Number)
], CreateHearingDto.prototype, "judge_id", void 0);
//# sourceMappingURL=hearing.dto.js.map