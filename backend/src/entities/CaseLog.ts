import { 
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, 
  JoinColumn, CreateDateColumn, UpdateDateColumn, Relation 
} from 'typeorm';
import { Case } from './Case.js';
import { User } from './User.js';

@Entity('case_logs')
export class CaseLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  case_id!: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  log_date!: Date;

  @Column('varchar')
  purpose!: string; 
  
  @Column('text', { nullable: true })
  remarks?: string;

  @Column('varchar', { nullable: true })
  file_path?: string;
  
  @Column('varchar', { length: 10, nullable: true })
  file_extension?: string; 

  // --- WORKFLOW COLUMNS ---
  
  @Column('boolean', { default: true }) // Default is NOT pending (just a simple log)
  is_pending!: boolean;

  @Column('int', { nullable: true })
  assigned_to_id?: number;

  @Column('int', { nullable: true })
  completed_by_id?: number;

  @Column('timestamp', { nullable: true })
  completed_at?: Date;

  // ------------------------

  @Column('int')
  created_by_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Case, (c) => c.logs)
  @JoinColumn({ name: 'case_id' })
  case!: Relation<Case>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  creator!: Relation<User>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignee?: Relation<User>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'completed_by_id' })
  completer?: Relation<User>;
}