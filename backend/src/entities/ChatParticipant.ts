import { Entity, Relation, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ChatConversation } from './ChatConversation.js';
import { User } from './User.js';


export enum ParticipantStatus {
  PENDING = 'PENDING',   // Waiting for acceptance
  ACTIVE = 'ACTIVE',     // Can chat
  REJECTED = 'REJECTED', // Declined invite
  LEFT = 'LEFT'          // Left the group
}


@Entity('chat_participants')
@Unique(['conversation_id', 'user_id'])
export class ChatParticipant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  conversation_id!: number;

  @Column('int')
  user_id!: number;

  @Column('boolean', { default: false })
  is_admin!: boolean; // Can add/remove people

  // Timestamp of the last message seen by this user (for Unread Counts)
  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  last_read_at!: Date;
  
  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.ACTIVE 
  })
  status!: ParticipantStatus;

  @ManyToOne(() => ChatConversation, (c) => c.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Relation<ChatConversation>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;
}