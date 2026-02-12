import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn, DeleteDateColumn, Relation } from 'typeorm';
//import { CaseType } from './CaseType.js';
import { Court } from './Court.js';
import { User } from './User.js';
import { CaseParty } from './CaseParty.js'; 
import { CaseLog } from './CaseLog.js';
import { Execution } from './Execution.js';
import { DlsaRecord } from './DlsaRecord.js';
import { Hearing } from './Hearing.js';
import { Establishment } from './Establishment.js';


@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  organization_id!: number;

  @Column('varchar', { nullable: true })
  file_no?: string;

  @Column('varchar', { nullable: true })
  filing_no?: string;

  @Column('date', { nullable: true })
  filing_date?: Date;

  @Column('varchar')
  case_type!: string;

  @Column('int')
  court_id!: number;
  
  // ADD: Foreign Key Column
  @Column('int', { nullable: true })
  establishment_id?: number;

  // ADD: Relation
  @ManyToOne(() => Establishment)
  @JoinColumn({ name: 'establishment_id' })
  establishment?: Relation<Establishment>;

  @Column('varchar', { nullable: true })
  case_no?: string;

  //@Column('int', { nullable: true })
  //court_no?: number;

  @Column('date', { nullable: true })
  received_date?: Date;

  @Column('varchar', { nullable: true })
  act?: string;

  @Column('varchar', { nullable: true })
  section?: string;
  
  @DeleteDateColumn() // Automatically handles soft deletes
  deleted_at?: Date;

  //@Column('varchar', { default: 'To be Filed' })
  //status!: string;
  
  // ADD: Cached Timeline Info
  //@Column('date', { nullable: true })
  //next_hearing_date?: Date;

  //@Column('varchar', { default: 'New Case' })
  //stage!: string; // e.g. "Evidence"

  @Column('text', { nullable: true })
  remarks?: string;

  @Column('int')
  created_by!: number;

  @CreateDateColumn()
  created_at!: Date;
  

  // Relationships
  //@ManyToOne(() => CaseType)
  //@JoinColumn({ name: 'case_type_id' })
  //caseType!: CaseType;

  @ManyToOne(() => Court)
  @JoinColumn({ name: 'court_id' })
  court!: Relation<Court>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: Relation<User>;
  
  @OneToMany(() => CaseParty, (caseParty) => caseParty.case)
  parties!: Relation<CaseParty[]>; 
  
  @OneToOne(() => Execution, (exec) => exec.case)
  execution?: Relation<Execution>;
  
  @OneToOne(() => DlsaRecord, (dlsa) => dlsa.case)
  dlsa?: Relation<DlsaRecord>;
  
  @OneToMany(() => Hearing, (h) => h.case)
  hearings!: Relation<Hearing[]>;

  @OneToMany(() => CaseLog, (l) => l.case)
  logs!: Relation<CaseLog[]>;

}