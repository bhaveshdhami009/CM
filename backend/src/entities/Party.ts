import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js'; // Assuming you track who added the party, or link to org

@Entity('parties')
export class Party {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  organization_id!: number; // Multi-tenancy

  @Column('varchar')
  first_name!: string;

  @Column('varchar', { nullable: true })
  middle_name?: string;

  @Column('varchar', { nullable: true })
  last_name?: string;

  @Column('text', { nullable: true })
  address_line_1?: string;

  @Column('text', { nullable: true })
  address_line_2?: string;

  @Column('varchar', { nullable: true })
  city?: string;

  @Column('varchar', { nullable: true })
  state?: string;

  @Column('varchar', { nullable: true })
  pincode?: string;

  @Column('varchar', { nullable: true })
  mobile?: string;
  
  @Column('varchar', { nullable: true })
  mobile2?: string;
  
  @Column('varchar', { nullable: true })
  email?: string;

  @Column('varchar', { nullable: true })
  father_name?: string;

  @Column('varchar', { nullable: true })
  mother_name?: string;

  @Column('varchar', { nullable: true })
  guardian?: string;

  @Column('varchar', { nullable: true })
  guardian_relation?: string;

  @Column('text', { nullable: true })
  remarks?: string;
}