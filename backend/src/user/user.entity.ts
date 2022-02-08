import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true, update: false, nullable: false })
  login: string;

  @Column({ type: 'varchar', length: 64, nullable: false })
  name: string;
  
  @Column({ default: false })
  isOnline: boolean;
}