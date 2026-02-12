var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ChatConversation } from './ChatConversation.js';
import { User } from './User.js';
export var ParticipantStatus;
(function (ParticipantStatus) {
    ParticipantStatus["PENDING"] = "PENDING";
    ParticipantStatus["ACTIVE"] = "ACTIVE";
    ParticipantStatus["REJECTED"] = "REJECTED";
    ParticipantStatus["LEFT"] = "LEFT"; // Left the group
})(ParticipantStatus || (ParticipantStatus = {}));
let ChatParticipant = class ChatParticipant {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ChatParticipant.prototype, "id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], ChatParticipant.prototype, "conversation_id", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], ChatParticipant.prototype, "user_id", void 0);
__decorate([
    Column('boolean', { default: false }),
    __metadata("design:type", Boolean)
], ChatParticipant.prototype, "is_admin", void 0);
__decorate([
    Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], ChatParticipant.prototype, "last_read_at", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: ParticipantStatus,
        default: ParticipantStatus.ACTIVE
    }),
    __metadata("design:type", String)
], ChatParticipant.prototype, "status", void 0);
__decorate([
    ManyToOne(() => ChatConversation, (c) => c.participants, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'conversation_id' }),
    __metadata("design:type", Object)
], ChatParticipant.prototype, "conversation", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], ChatParticipant.prototype, "user", void 0);
ChatParticipant = __decorate([
    Entity('chat_participants'),
    Unique(['conversation_id', 'user_id'])
], ChatParticipant);
export { ChatParticipant };
//# sourceMappingURL=ChatParticipant.js.map