import { Entity, PrimaryColumn, Relation, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Case } from './Case.js';
import { Party } from './Party.js';

export enum PartyRole {
  PETITIONER = 'Petitioner',
  RESPONDENT = 'Respondent'
}

@Entity('case_parties')
@Unique(['case_id', 'role', 'party_number']) // Enforce unique numbering
export class CaseParty {
  @PrimaryColumn('int')
  case_id!: number;

  @PrimaryColumn('int')
  party_id!: number;

  @Column({
    type: 'enum',
    enum: PartyRole,
  })
  role!: PartyRole;

  @Column('int')
  party_number!: number;

  // 2. Wrap the type in Relation<...>
  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case!: Relation<Case>; // <--- FIX HERE

  // Do the same for Party (good practice)
  @ManyToOne(() => Party)
  @JoinColumn({ name: 'party_id' })
  party!: Relation<Party>;
}