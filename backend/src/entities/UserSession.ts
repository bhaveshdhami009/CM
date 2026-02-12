import { Entity, Relation, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User.js';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid') // Use UUID for session IDs so they are hard to guess
  id!: string;

  @Column('int')
  user_id!: number;

  @Column('varchar') // We store the hash of the refresh token for security
  refresh_token_hash!: string;

  @Column('varchar', { nullable: true })
  device_name?: string; // e.g. "Chrome on Windows 10"

  @Column('varchar', { nullable: true })
  ip_address?: string;

  @Column('timestamp')
  expires_at!: Date;

  @Column('timestamp')
  last_active!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // If user is deleted, sessions are gone
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;
}