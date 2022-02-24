import { Entity, Column, PrimaryColumn, ManyToMany, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { FriendRequestEntity } from './friends.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column({unique: true, update: false, nullable: false })
  username: string;

  @Column({default: null})
  avatar?: string;

  @Exclude()
  @Column({ default: false })
  public isTwoFA: boolean;
  
  @Exclude()
  @Column({ default: null })
  public secret: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: 0, nullable: false})
  played: number;

  @Column({ default: 0, nullable: false})
  victory: number;

  @Column({ default: 0, nullable: false})
  defeats: number;

  @OneToMany(
    () => FriendRequestEntity,
    (friendRequestEntity) => friendRequestEntity.creator,
  )
  sentFriendRequests: FriendRequestEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (friendRequestEntity) => friendRequestEntity.receiver,
  )
  receivedFriendRequests: FriendRequestEntity[];

}