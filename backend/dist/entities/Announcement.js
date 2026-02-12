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
import { Organization } from './Organization.js';
export var AnnouncementScope;
(function (AnnouncementScope) {
    AnnouncementScope["GLOBAL"] = "GLOBAL";
    AnnouncementScope["ORG"] = "ORG";
})(AnnouncementScope || (AnnouncementScope = {}));
let Announcement = class Announcement {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Announcement.prototype, "id", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], Announcement.prototype, "title", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Announcement.prototype, "message", void 0);
__decorate([
    Column({ type: 'enum', enum: AnnouncementScope, default: AnnouncementScope.ORG }),
    __metadata("design:type", String)
], Announcement.prototype, "scope", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], Announcement.prototype, "organization_id", void 0);
__decorate([
    Column('boolean', { default: true }),
    __metadata("design:type", Boolean)
], Announcement.prototype, "is_active", void 0);
__decorate([
    Column('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], Announcement.prototype, "expires_at", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], Announcement.prototype, "created_by_id", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Announcement.prototype, "created_at", void 0);
__decorate([
    ManyToOne(() => Organization, { nullable: true, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'organization_id' }),
    __metadata("design:type", Object)
], Announcement.prototype, "organization", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'created_by_id' }),
    __metadata("design:type", Object)
], Announcement.prototype, "creator", void 0);
Announcement = __decorate([
    Entity('announcements')
], Announcement);
export { Announcement };
//# sourceMappingURL=Announcement.js.map