import { Entity, Relation, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { District } from './District.js';

@Entity('establishments')
@Unique(['name', 'district_id']) // Prevent duplicates in same district
export class Establishment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  district_id!: number;

  @Column('varchar')
  name!: string;

  // Relationship: Many Establishments belong to One District
  @ManyToOne(() => District)
  @JoinColumn({ name: 'district_id' })
  district!: Relation<District>;
}