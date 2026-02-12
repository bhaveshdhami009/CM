var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsInt } from 'class-validator';
import { AnnouncementScope } from '../entities/Announcement.js'; // Ensure path
import { Transform } from 'class-transformer';
export class CreateAnnouncementDto {
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "title", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "message", void 0);
__decorate([
    IsEnum(AnnouncementScope),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "scope", void 0);
__decorate([
    IsOptional(),
    IsDateString() // Validates ISO 8601 strings
    ,
    Transform(({ value }) => value === '' ? null : value),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "expires_at", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateAnnouncementDto.prototype, "target_org_id", void 0);
//# sourceMappingURL=announcement.dto.js.map