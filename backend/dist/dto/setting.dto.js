var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
export class CreateSettingDto {
}
__decorate([
    IsOptional(),
    IsString(),
    Matches(/^[a-z0-9_]+$/, { message: 'Key must be lowercase snake_case' }),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "key", void 0);
__decorate([
    IsNotEmpty(),
    __metadata("design:type", Object)
], CreateSettingDto.prototype, "value", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "description", void 0);
//# sourceMappingURL=setting.dto.js.map