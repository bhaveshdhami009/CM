var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User.js';
let AuthLog = class AuthLog {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], AuthLog.prototype, "id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], AuthLog.prototype, "user_id", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "ip_address", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], AuthLog.prototype, "user_agent", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], AuthLog.prototype, "login_at", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], AuthLog.prototype, "user", void 0);
AuthLog = __decorate([
    Entity('auth_logs')
], AuthLog);
export { AuthLog };
//# sourceMappingURL=AuthLog.js.map