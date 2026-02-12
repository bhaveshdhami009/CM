import { Entity, Relation, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { District } from './District.js'; // Note the .js extension!

@Entity('courts')
@Unique(['name', 'district_id']) // Prevent duplicate courts in the same district
export class Court {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  district_id!: number;

  @Column('varchar')
  name!: string;

  // Relationship: Many Courts belong to One District
  @ManyToOne(() => District)
  @JoinColumn({ name: 'district_id' })
  district!: Relation<District>;
}