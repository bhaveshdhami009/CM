import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('judges')
export class Judge {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  name!: string;
}