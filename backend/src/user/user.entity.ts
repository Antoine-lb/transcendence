import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {UserRoleEnum} from "../enums/user-role.enum";

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

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column({
    enum: UserRoleEnum,
  })
  role: string;
}