var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Case } from './Case.js';
import { User } from './User.js';
let CaseLog = class CaseLog {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], CaseLog.prototype, "id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], CaseLog.prototype, "case_id", void 0);
__decorate([
    Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CaseLog.prototype, "log_date", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], CaseLog.prototype, "purpose", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], CaseLog.prototype, "remarks", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], CaseLog.prototype, "file_path", void 0);
__decorate([
    Column('varchar', { length: 10, nullable: true }),
    __metadata("design:type", String)
], CaseLog.prototype, "file_extension", void 0);
__decorate([
    Column('boolean', { default: true }) // Default is NOT pending (just a simple log)
    ,
    __metadata("design:type", Boolean)
], CaseLog.prototype, "is_pending", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], CaseLog.prototype, "assigned_to_id", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], CaseLog.prototype, "completed_by_id", void 0);
__decorate([
    Column('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], CaseLog.prototype, "completed_at", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], CaseLog.prototype, "created_by_id", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], CaseLog.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], CaseLog.prototype, "updated_at", void 0);
__decorate([
    ManyToOne(() => Case, (c) => c.logs),
    JoinColumn({ name: 'case_id' }),
    __metadata("design:type", Object)
], CaseLog.prototype, "case", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'created_by_id' }),
    __metadata("design:type", Object)
], CaseLog.prototype, "creator", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'assigned_to_id' }),
    __metadata("design:type", Object)
], CaseLog.prototype, "assignee", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'completed_by_id' }),
    __metadata("design:type", Object)
], CaseLog.prototype, "completer", void 0);
CaseLog = __decorate([
    Entity('case_logs')
], CaseLog);
export { CaseLog };
//# sourceMappingURL=CaseLog.js.map