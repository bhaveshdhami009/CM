import { Entity, Relation, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './Organization.js'; // <-- Import Organization

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  // --- Change This Section ---
  @Column('int', { nullable: true })
  organization_id?: number;

  // Add the Relationship
  @ManyToOne(() => Organization, (organization) => organization.users, { 
    onDelete: 'RESTRICT' // <--- Add this to auto-delete users when Org is deleted
  })
  @JoinColumn({ name: 'organization_id' }) // This links the column above to this relationship
  organization?: Relation<Organization>;
  // ---------------------------

  @Column('varchar', { unique: true })
  email!: string;

  @Column('varchar')
  password_hash!: string;

  @Column('varchar')
  full_name!: string;

  @Column('int', { default: 1 })
  role!: number;

  @Column('int', { nullable: true })
  created_by?: number;
  
  @Column('varchar', { default: '#007bff' })
  accent!: string;
  
  @Column('boolean', { default: false }) // Default to Light Mode
  is_dark_mode!: boolean;
}