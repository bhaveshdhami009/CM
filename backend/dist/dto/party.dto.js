var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, IsPhoneNumber } from 'class-validator';
export class CreatePartyDto {
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "first_name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "middle_name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "last_name", void 0);
__decorate([
    IsOptional(),
    IsPhoneNumber('IN'),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "mobile", void 0);
__decorate([
    IsOptional(),
    IsPhoneNumber('IN'),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "mobile2", void 0);
__decorate([
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "email", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "father_name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "mother_name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "guardian", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "guardian_relation", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "address_line_1", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "address_line_2", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "city", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "state", void 0);
__decorate([
    IsOptional(),
    Matches(/^[0-9]{6}$/, { message: 'Pincode must be exactly 6 digits' }),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "pincode", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "remarks", void 0);
//# sourceMappingURL=party.dto.js.map