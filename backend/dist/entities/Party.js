var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
let Party = class Party {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Party.prototype, "id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], Party.prototype, "organization_id", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], Party.prototype, "first_name", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "middle_name", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "last_name", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "address_line_1", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "address_line_2", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "city", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "state", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "pincode", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "mobile", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "mobile2", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "email", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "father_name", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "mother_name", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "guardian", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "guardian_relation", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "remarks", void 0);
Party = __decorate([
    Entity('parties')
], Party);
export { Party };
//# sourceMappingURL=Party.js.map