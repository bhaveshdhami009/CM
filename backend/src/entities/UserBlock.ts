import { Entity, Relation, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User.js';

@Entity('user_blocks')
@Unique(['blocker_id', 'blocked_id'])
export class UserBlock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  blocker_id!: number;

  @Column('int')
  blocked_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blocker_id' })
  blocker!: Relation<User>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blocked_id' })
  blocked!: Relation<User>;
}