import { Entity, Relation, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './User.js';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { unique: true })
  name!: string;

  @Column('text', { nullable: true })
  address?: string;

  @Column('varchar', { nullable: true })
  contact_email?: string;

  @Column('varchar', { nullable: true })
  phone?: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relationship: One Organization has Many Users
  @OneToMany(() => User, (user) => user.organization)
  users!: Relation<User[]>;
}