import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  // We track by composite of Email + IP. 
  // An attacker might switch IPs, but we lock the account.
  // A legitimate user might fail on a different device, we lock the IP.
  // For simplicity here, we will track by EMAIL (locks the account).
  @Column('varchar', { unique: true })
  email!: string; 

  @Column('int', { default: 0 })
  count!: number;

  @Column('timestamp', { nullable: true })
  lockout_until?: Date;

  @UpdateDateColumn()
  last_attempt_at!: Date;
}