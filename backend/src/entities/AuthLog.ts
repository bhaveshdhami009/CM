import { Entity, Relation, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User.js';

@Entity('auth_logs')
export class AuthLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  user_id!: number;

  @Column('varchar', { nullable: true })
  ip_address?: string;

  @Column('varchar', { nullable: true })
  user_agent?: string;

  @CreateDateColumn()
  login_at!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;
}