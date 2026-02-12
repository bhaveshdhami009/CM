var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';
export class StartExecutionDto {
}
__decorate([
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], StartExecutionDto.prototype, "amount", void 0);
__decorate([
    IsDateString(),
    __metadata("design:type", String)
], StartExecutionDto.prototype, "start_date", void 0);
__decorate([
    IsDateString(),
    __metadata("design:type", String)
], StartExecutionDto.prototype, "next_due_date", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], StartExecutionDto.prototype, "remarks", void 0);
export class UpdateExecutionDto {
}
__decorate([
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], UpdateExecutionDto.prototype, "amount", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UpdateExecutionDto.prototype, "start_date", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UpdateExecutionDto.prototype, "next_due_date", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateExecutionDto.prototype, "remarks", void 0);
export class MarkCycleCompleteDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], MarkCycleCompleteDto.prototype, "remarks", void 0);
//# sourceMappingURL=execution.dto.js.map