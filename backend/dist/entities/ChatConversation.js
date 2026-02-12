var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from './Organization.js';
import { ChatParticipant } from './ChatParticipant.js';
import { ChatMessage } from './ChatMessage.js';
export var ChatType;
(function (ChatType) {
    ChatType["DM"] = "DM";
    ChatType["GROUP"] = "GROUP";
})(ChatType || (ChatType = {}));
let ChatConversation = class ChatConversation {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ChatConversation.prototype, "id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], ChatConversation.prototype, "organization_id", void 0);
__decorate([
    Column({ type: 'enum', enum: ChatType }),
    __metadata("design:type", String)
], ChatConversation.prototype, "type", void 0);
__decorate([
    Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], ChatConversation.prototype, "name", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], ChatConversation.prototype, "description", void 0);
__decorate([
    Column('int', { default: 1 }),
    __metadata("design:type", Number)
], ChatConversation.prototype, "min_role_read", void 0);
__decorate([
    Column('int', { default: 1 }),
    __metadata("design:type", Number)
], ChatConversation.prototype, "min_role_write", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], ChatConversation.prototype, "created_at", void 0);
__decorate([
    ManyToOne(() => Organization),
    JoinColumn({ name: 'organization_id' }),
    __metadata("design:type", Object)
], ChatConversation.prototype, "organization", void 0);
__decorate([
    OneToMany(() => ChatParticipant, (p) => p.conversation),
    __metadata("design:type", Object)
], ChatConversation.prototype, "participants", void 0);
__decorate([
    OneToMany(() => ChatMessage, (m) => m.conversation),
    __metadata("design:type", Object)
], ChatConversation.prototype, "messages", void 0);
ChatConversation = __decorate([
    Entity('chat_conversations')
], ChatConversation);
export { ChatConversation };
//# sourceMappingURL=ChatConversation.js.map