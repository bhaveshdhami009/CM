var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Case } from './Case.js';
let DlsaRecord = class DlsaRecord {
};
__decorate([
    PrimaryColumn('int'),
    __metadata("design:type", Number)
], DlsaRecord.prototype, "case_id", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], DlsaRecord.prototype, "letter_no", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], DlsaRecord.prototype, "registration_no", void 0);
__decorate([
    Column('date'),
    __metadata("design:type", Date)
], DlsaRecord.prototype, "letter_date", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], DlsaRecord.prototype, "remarks", void 0);
__decorate([
    Column('date', { nullable: true }),
    __metadata("design:type", Date)
], DlsaRecord.prototype, "billed_on", void 0);
__decorate([
    Column('date', { nullable: true }),
    __metadata("design:type", Date)
], DlsaRecord.prototype, "received_on", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], DlsaRecord.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], DlsaRecord.prototype, "updated_at", void 0);
__decorate([
    OneToOne(() => Case),
    JoinColumn({ name: 'case_id' }),
    __metadata("design:type", Object)
], DlsaRecord.prototype, "case", void 0);
DlsaRecord = __decorate([
    Entity('dlsa_records')
], DlsaRecord);
export { DlsaRecord };
//# sourceMappingURL=DlsaRecord.js.map