import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('districts')
@Unique(['name', 'state']) // Prevent duplicate districts in the same state
export class District {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  name!: string;

  @Column('varchar', { default: 'Delhi' })
  state!: string;
}