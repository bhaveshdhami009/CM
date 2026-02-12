var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Case } from './Case.js';
import { Judge } from './Judge.js';
let Hearing = class Hearing {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Hearing.prototype, "id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], Hearing.prototype, "case_id", void 0);
__decorate([
    Column('timestamp'),
    __metadata("design:type", Date)
], Hearing.prototype, "hearing_date", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], Hearing.prototype, "purpose", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], Hearing.prototype, "judge_id", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Hearing.prototype, "court_room", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], Hearing.prototype, "outcome", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], Hearing.prototype, "remarks", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], Hearing.prototype, "next_hearing_id", void 0);
__decorate([
    OneToOne(() => Hearing, { nullable: true }),
    JoinColumn({ name: 'next_hearing_id' }),
    __metadata("design:type", Object)
], Hearing.prototype, "next_hearing", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Hearing.prototype, "created_at", void 0);
__decorate([
    ManyToOne(() => Case, (c) => c.hearings),
    JoinColumn({ name: 'case_id' }),
    __metadata("design:type", Object)
], Hearing.prototype, "case", void 0);
__decorate([
    ManyToOne(() => Judge),
    JoinColumn({ name: 'judge_id' }),
    __metadata("design:type", Object)
], Hearing.prototype, "judge", void 0);
Hearing = __decorate([
    Entity('hearings')
], Hearing);
export { Hearing };
//# sourceMappingURL=Hearing.js.map