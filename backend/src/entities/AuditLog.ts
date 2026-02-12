import { Entity, Relation, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  table_name!: string;

  @Column('int', { nullable: true }) // Assuming all your primary keys are integers
  record_id!: number;

  @Column('varchar')
  action!: string; // 'CREATE', 'UPDATE', 'DELETE'

  @Column('int', { nullable: true })
  performed_by_id?: number;

  @Column('jsonb', { nullable: true })
  old_values?: any;

  @Column('jsonb', { nullable: true })
  new_values?: any;

  @CreateDateColumn()
  timestamp!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by_id' })
  performed_by?: Relation<User>;
}