import { Entity, Column, PrimaryColumn, ManyToMany, OneToMany } from 'typeorm';
import { FriendRequestEntity } from './friends.entity';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column({unique: true, update: false, nullable: false })
  username: string;

  @Column({default: null})
  avatar?: string;

  @Column({ default: false })
  public isTwoFA: boolean;
  
  @Column({ default: null })
  public secret: string;

  @Column({ default: false })
  isOnline: boolean;

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