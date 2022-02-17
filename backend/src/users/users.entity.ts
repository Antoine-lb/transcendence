import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column({unique: true, update: false, nullable: false })
  username: string;

  @Column({default: null})
  avatar?: string;

  @Column({ default: null })
  public secret: string;

  @Column({ default: false })
  isOnline: boolean;

}