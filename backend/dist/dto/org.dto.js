var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';
export class CreateOrgDto {
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "address", void 0);
__decorate([
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "contact_email", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "phone", void 0);
__decorate([
    IsEmail(),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "admin_email", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "admin_name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MinLength(6),
    __metadata("design:type", String)
], CreateOrgDto.prototype, "admin_password", void 0);
//# sourceMappingURL=org.dto.js.map