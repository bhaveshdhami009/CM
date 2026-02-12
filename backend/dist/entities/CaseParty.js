var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Case } from './Case.js';
import { Party } from './Party.js';
export var PartyRole;
(function (PartyRole) {
    PartyRole["PETITIONER"] = "Petitioner";
    PartyRole["RESPONDENT"] = "Respondent";
})(PartyRole || (PartyRole = {}));
let CaseParty = class CaseParty {
};
__decorate([
    PrimaryColumn('int'),
    __metadata("design:type", Number)
], CaseParty.prototype, "case_id", void 0);
__decorate([
    PrimaryColumn('int'),
    __metadata("design:type", Number)
], CaseParty.prototype, "party_id", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: PartyRole,
    }),
    __metadata("design:type", String)
], CaseParty.prototype, "role", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], CaseParty.prototype, "party_number", void 0);
__decorate([
    ManyToOne(() => Case),
    JoinColumn({ name: 'case_id' }),
    __metadata("design:type", Object)
], CaseParty.prototype, "case", void 0);
__decorate([
    ManyToOne(() => Party),
    JoinColumn({ name: 'party_id' }),
    __metadata("design:type", Object)
], CaseParty.prototype, "party", void 0);
CaseParty = __decorate([
    Entity('case_parties'),
    Unique(['case_id', 'role', 'party_number']) // Enforce unique numbering
], CaseParty);
export { CaseParty };
//# sourceMappingURL=CaseParty.js.map