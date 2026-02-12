import { Entity, Relation, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ChatConversation } from './ChatConversation.js';
import { User } from './User.js';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  conversation_id!: number;

  @Column('int')
  sender_id!: number;

  @Column('text', { nullable: true })
  content?: string;

  // File Attachments
  @Column('varchar', { nullable: true })
  file_path?: string;

  @Column('varchar', { nullable: true })
  file_type?: string; // 'image', 'pdf', 'doc'

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => ChatConversation, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Relation<ChatConversation>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender!: Relation<User>;
}