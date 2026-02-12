var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, IsBoolean, IsDateString } from 'class-validator';
// --- AUTH DTOs ---
export class LoginDto {
}
__decorate([
    IsEmail({}, { message: 'Please provide a valid email' }),
    IsNotEmpty(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], LoginDto.prototype, "rememberMe", void 0);
/*
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Full Name is required' })
  full_name!: string;
}
*/
// --- LOG DTOs ---
// Used in LogController
export class CreateLogDto {
}
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateLogDto.prototype, "case_id", void 0);
__decorate([
    IsDateString() // Validates ISO date format
    ,
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "log_date", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "purpose", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "remarks", void 0);
__decorate([
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateLogDto.prototype, "is_pending", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "file_path", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "file_extension", void 0);
//# sourceMappingURL=validation.dto.js.map