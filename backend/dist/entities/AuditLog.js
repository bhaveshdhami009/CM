var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js';
let AuditLog = class AuditLog {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], AuditLog.prototype, "id", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], AuditLog.prototype, "table_name", void 0);
__decorate([
    Column('int', { nullable: true }) // Assuming all your primary keys are integers
    ,
    __metadata("design:type", Number)
], AuditLog.prototype, "record_id", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "performed_by_id", void 0);
__decorate([
    Column('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "old_values", void 0);
__decorate([
    Column('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "new_values", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], AuditLog.prototype, "timestamp", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'performed_by_id' }),
    __metadata("design:type", Object)
], AuditLog.prototype, "performed_by", void 0);
AuditLog = __decorate([
    Entity('audit_logs')
], AuditLog);
export { AuditLog };
//# sourceMappingURL=AuditLog.js.map