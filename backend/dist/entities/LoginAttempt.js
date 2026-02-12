var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';
let LoginAttempt = class LoginAttempt {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], LoginAttempt.prototype, "id", void 0);
__decorate([
    Column('varchar', { unique: true }),
    __metadata("design:type", String)
], LoginAttempt.prototype, "email", void 0);
__decorate([
    Column('int', { default: 0 }),
    __metadata("design:type", Number)
], LoginAttempt.prototype, "count", void 0);
__decorate([
    Column('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], LoginAttempt.prototype, "lockout_until", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], LoginAttempt.prototype, "last_attempt_at", void 0);
LoginAttempt = __decorate([
    Entity('login_attempts')
], LoginAttempt);
export { LoginAttempt };
//# sourceMappingURL=LoginAttempt.js.map