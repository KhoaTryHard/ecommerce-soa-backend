import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ unique: true }) username: string;
  @Column() passwordHash: string;
  @Column({ type: 'json' }) roles: string[];
  @Column({ default: 'ACTIVE' }) status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  @Column({ nullable: true }) displayName?: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
