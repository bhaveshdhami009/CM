import { Entity, PrimaryGeneratedColumn, Relation, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Case } from './Case.js';
import { Judge } from './Judge.js';

@Entity('hearings')
export class Hearing {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  case_id!: number;

  @Column('timestamp')
  hearing_date!: Date; // The date this hearing happened/will happen

  //@Column('date', { nullable: true })
  //next_date?: Date; // The *next* date given by the court

  @Column('varchar')
  purpose!: string; // e.g. "Arguments"

  @Column('int', { nullable: true })
  judge_id?: number;

  @Column('varchar', { nullable: true })
  court_room?: string;

  @Column('text', { nullable: true })
  outcome?: string; // e.g. "Adjourned"
  
  @Column('text', { nullable: true })
  remarks?: string;
  
  @Column('int', { nullable: true })
  next_hearing_id?: number;

  @OneToOne(() => Hearing, { nullable: true })
  @JoinColumn({ name: 'next_hearing_id' })
  next_hearing?: Relation<Hearing>;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Case, (c) => c.hearings)
  @JoinColumn({ name: 'case_id' })
  case!: Relation<Case>;

  @ManyToOne(() => Judge)
  @JoinColumn({ name: 'judge_id' })
  judge?: Relation<Judge>;
}