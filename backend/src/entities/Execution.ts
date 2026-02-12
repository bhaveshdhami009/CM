import { Entity, Relation, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Case } from './Case.js';

@Entity('execution_details')
export class Execution {
  @PrimaryColumn('int')
  case_id!: number;

  @Column('boolean', { default: true })
  is_active!: boolean; 

  @Column('date')
  next_due_date!: string; // TypeORM handles dates as strings often in JSON

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  amount?: number;

  @Column('text', { nullable: true })
  remarks?: string;

  @Column('date')
  start_date!: string;
  
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationship: One Case has One Active Execution State
  @OneToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case!: Relation<Case>;
}