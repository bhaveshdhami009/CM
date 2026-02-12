import { Entity, Relation, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from './Organization.js';
import { ChatParticipant } from './ChatParticipant.js';
import { ChatMessage } from './ChatMessage.js';

export enum ChatType {
  DM = 'DM',
  GROUP = 'GROUP'
}

@Entity('chat_conversations')
export class ChatConversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  organization_id!: number;

  @Column({ type: 'enum', enum: ChatType })
  type!: ChatType;

  @Column('varchar', { nullable: true })
  name?: string; 

  @Column('text', { nullable: true })
  description?: string;

  // --- NEW: Role-Based Permissions ---
  // Minimum role required to READ (See the group)
  // Default 1 (Viewer)
  @Column('int', { default: 1 })
  min_role_read!: number; 

  // Minimum role required to WRITE (Send messages)
  // Default 1 (Everyone can write). If set to 5, Viewers are Read-Only.
  @Column('int', { default: 1 })
  min_role_write!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization!: Relation<Organization>;

  @OneToMany(() => ChatParticipant, (p) => p.conversation)
  participants!: Relation<ChatParticipant[]>;
  
  @OneToMany(() => ChatMessage, (m) => m.conversation)
  messages!: Relation<ChatMessage[]>;
}