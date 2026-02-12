import { Entity, Relation, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Case } from './Case.js';

@Entity('dlsa_records')
export class DlsaRecord {
  @PrimaryColumn('int')
  case_id!: number;

  @Column('varchar')
  letter_no?: string;

  @Column('varchar', { nullable: true })
  registration_no?: string;

  @Column('date')
  letter_date?: Date; // or string, depending on your TypeORM config preference

  @Column('text', { nullable: true })
  remarks?: string;

  // --- NEW COLUMNS ---
  @Column('date', { nullable: true })
  billed_on?: Date;

  @Column('date', { nullable: true })
  received_on?: Date;
  
  @CreateDateColumn()
  created_at!: Date;
  
  @UpdateDateColumn()
  updated_at!: Date;
  // -------------------

  @OneToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case!: Relation<Case>;
}