var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './Organization.js'; // <-- Import Organization
let User = class User {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "organization_id", void 0);
__decorate([
    ManyToOne(() => Organization, (organization) => organization.users, {
        onDelete: 'RESTRICT' // <--- Add this to auto-delete users when Org is deleted
    }),
    JoinColumn({ name: 'organization_id' }) // This links the column above to this relationship
    ,
    __metadata("design:type", Object)
], User.prototype, "organization", void 0);
__decorate([
    Column('varchar', { unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], User.prototype, "password_hash", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], User.prototype, "full_name", void 0);
__decorate([
    Column('int', { default: 1 }),
    __metadata("design:type", Number)
], User.prototype, "role", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "created_by", void 0);
__decorate([
    Column('varchar', { default: '#007bff' }),
    __metadata("design:type", String)
], User.prototype, "accent", void 0);
__decorate([
    Column('boolean', { default: false }) // Default to Light Mode
    ,
    __metadata("design:type", Boolean)
], User.prototype, "is_dark_mode", void 0);
User = __decorate([
    Entity('users')
], User);
export { User };
//# sourceMappingURL=User.js.map