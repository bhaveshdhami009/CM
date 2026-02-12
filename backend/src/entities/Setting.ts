import { Entity, Relation, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  // CHANGED: Removed { unique: true }. 
  // We allow duplicates because we keep history.
  @Column('varchar')
  key!: string; 

  @Column('jsonb') 
  value!: any; 

  @Column('varchar', { nullable: true })
  description?: string;

  // NEW: Track who made this specific version
  @Column('int', { nullable: true })
  created_by_id?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by?: Relation<User>;

  @CreateDateColumn()
  created_at!: Date;
}