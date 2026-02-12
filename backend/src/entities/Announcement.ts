import { Entity, Relation, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js';
import { Organization } from './Organization.js';

export enum AnnouncementScope {
  GLOBAL = 'GLOBAL',
  ORG = 'ORG'
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  title!: string;

  @Column('text')
  message!: string;

  @Column({ type: 'enum', enum: AnnouncementScope, default: AnnouncementScope.ORG })
  scope!: AnnouncementScope;

  @Column('int', { nullable: true })
  organization_id?: number; // NULL if Global

  @Column('boolean', { default: true })
  is_active!: boolean;

  @Column('timestamp', { nullable: true })
  expires_at?: Date;

  @Column('int')
  created_by_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization?: Relation<Organization>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  creator!: Relation<User>;
}