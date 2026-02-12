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
let UserSession = class UserSession {
};
__decorate([
    PrimaryGeneratedColumn('uuid') // Use UUID for session IDs so they are hard to guess
    ,
    __metadata("design:type", String)
], UserSession.prototype, "id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], UserSession.prototype, "user_id", void 0);
__decorate([
    Column('varchar') // We store the hash of the refresh token for security
    ,
    __metadata("design:type", String)
], UserSession.prototype, "refresh_token_hash", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "device_name", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "ip_address", void 0);
__decorate([
    Column('timestamp'),
    __metadata("design:type", Date)
], UserSession.prototype, "expires_at", void 0);
__decorate([
    Column('timestamp'),
    __metadata("design:type", Date)
], UserSession.prototype, "last_active", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], UserSession.prototype, "created_at", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'CASCADE' }) // If user is deleted, sessions are gone
    ,
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], UserSession.prototype, "user", void 0);
UserSession = __decorate([
    Entity('user_sessions')
], UserSession);
export { UserSession };
//# sourceMappingURL=UserSession.js.map