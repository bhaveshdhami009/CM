var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
//import { CaseType } from './CaseType.js';
import { Court } from './Court.js';
import { User } from './User.js';
import { CaseParty } from './CaseParty.js';
import { CaseLog } from './CaseLog.js';
import { Execution } from './Execution.js';
import { DlsaRecord } from './DlsaRecord.js';
import { Hearing } from './Hearing.js';
import { Establishment } from './Establishment.js';
let Case = class Case {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Case.prototype, "id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], Case.prototype, "organization_id", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "file_no", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "filing_no", void 0);
__decorate([
    Column('date', { nullable: true }),
    __metadata("design:type", Date)
], Case.prototype, "filing_date", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], Case.prototype, "case_type", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], Case.prototype, "court_id", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], Case.prototype, "establishment_id", void 0);
__decorate([
    ManyToOne(() => Establishment),
    JoinColumn({ name: 'establishment_id' }),
    __metadata("design:type", Object)
], Case.prototype, "establishment", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "case_no", void 0);
__decorate([
    Column('date', { nullable: true }),
    __metadata("design:type", Date)
], Case.prototype, "received_date", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "act", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "section", void 0);
__decorate([
    DeleteDateColumn() // Automatically handles soft deletes
    ,
    __metadata("design:type", Date)
], Case.prototype, "deleted_at", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "remarks", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], Case.prototype, "created_by", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Case.prototype, "created_at", void 0);
__decorate([
    ManyToOne(() => Court),
    JoinColumn({ name: 'court_id' }),
    __metadata("design:type", Object)
], Case.prototype, "court", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'created_by' }),
    __metadata("design:type", Object)
], Case.prototype, "creator", void 0);
__decorate([
    OneToMany(() => CaseParty, (caseParty) => caseParty.case),
    __metadata("design:type", Object)
], Case.prototype, "parties", void 0);
__decorate([
    OneToOne(() => Execution, (exec) => exec.case),
    __metadata("design:type", Object)
], Case.prototype, "execution", void 0);
__decorate([
    OneToOne(() => DlsaRecord, (dlsa) => dlsa.case),
    __metadata("design:type", Object)
], Case.prototype, "dlsa", void 0);
__decorate([
    OneToMany(() => Hearing, (h) => h.case),
    __metadata("design:type", Object)
], Case.prototype, "hearings", void 0);
__decorate([
    OneToMany(() => CaseLog, (l) => l.case),
    __metadata("design:type", Object)
], Case.prototype, "logs", void 0);
Case = __decorate([
    Entity('cases')
], Case);
export { Case };
//# sourceMappingURL=Case.js.map