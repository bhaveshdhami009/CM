var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsEnum, IsEmail, ValidateIf, Min } from 'class-validator';
// Enum for Invite Response
export var InviteStatus;
(function (InviteStatus) {
    InviteStatus["ACCEPT"] = "ACCEPT";
    InviteStatus["REJECT"] = "REJECT";
})(InviteStatus || (InviteStatus = {}));
// 1. Create Group
export class CreateGroupDto {
}
__decorate([
    IsString(),
    IsNotEmpty({ message: 'Group name is required' }),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateGroupDto.prototype, "min_role_read", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateGroupDto.prototype, "min_role_write", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], CreateGroupDto.prototype, "memberIds", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateGroupDto.prototype, "auto_add_role", void 0);
// 2. Create DM (Flexible: accepts ID or Email)
export class CreateDMDto {
}
__decorate([
    ValidateIf(o => !o.email),
    IsInt({ message: 'Target User ID must be an integer' }),
    __metadata("design:type", Number)
], CreateDMDto.prototype, "targetUserId", void 0);
__decorate([
    ValidateIf(o => !o.targetUserId),
    IsEmail({}, { message: 'Invalid email address' }),
    __metadata("design:type", String)
], CreateDMDto.prototype, "email", void 0);
// 3. Send Message
export class SendMessageDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
// 4. Respond to Invite
export class InviteResponseDto {
}
__decorate([
    IsEnum(InviteStatus, { message: 'Status must be ACCEPT or REJECT' }),
    __metadata("design:type", String)
], InviteResponseDto.prototype, "status", void 0);
// 5. Add Member
export class AddMemberDto {
}
__decorate([
    IsInt(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], AddMemberDto.prototype, "userId", void 0);
// 6. Update Group
export class UpdateGroupDto {
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateGroupDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateGroupDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateGroupDto.prototype, "min_role_read", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateGroupDto.prototype, "min_role_write", void 0);
//# sourceMappingURL=chat.dto.js.map