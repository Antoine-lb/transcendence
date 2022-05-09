import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  OneToMany,
  ManyToOne,
  JoinTable
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { FriendRequestEntity } from './friends.entity';
import { RoomEntity } from 'src/chat/model/room.entity';
import { GamePlayedEntity } from 'src/gamee/model/gamePlayed.entity';
import { userInfo } from 'os';
import { ConnectedUserEntity } from 'src/chat/model/connected.user.entity';
import { JoinedRoomEntity } from 'src/chat/model/joined-room.entity';
import { MessageEntity } from 'src/chat/model/message.entity';
import { UserRoomEntity } from 'src/chat/model/user-room.entity';

export enum userStatus {
  online,
  offline,
  playing,
}

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column({unique: true, nullable: false })
  username: string;

  @Column({default: null})
  avatar?: string;

  // @Exclude()
  @Column({ default: false })
  public isTwoFA: boolean;
  
  @Exclude()
  @Column({ default: null })
  public secret: string;

  @Column({ default: 0 })
  isOnline: number;

  @Column({ default: 0, nullable: false})
  played: number;

  @Column({ default: 0, nullable: false})
  victory: number;

  @Column({ default: 0, nullable: false})
  defeats: number;

  @Column({ default: 0 })
  lvl: number;
  
  @Column({ default: 0 })
  xp: number;

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

  @ManyToMany(() => RoomEntity, room => room.users)
  rooms: RoomEntity[];

  @OneToMany(() => ConnectedUserEntity, connection => connection.user)
  connections: ConnectedUserEntity[];

  @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  joinedRooms: JoinedRoomEntity[];

  @OneToMany(() => MessageEntity, message => message.user)
  messages: MessageEntity[];

  @ManyToMany(() => RoomEntity, room => room.admins)
  adminOF: RoomEntity[];

  @ManyToMany(() => GamePlayedEntity, GamePlayedEntity => GamePlayedEntity.players)
  gamePlayed: GamePlayedEntity[];
  
  @OneToMany(() => UserRoomEntity, userRoom => userRoom.user)
  roleRooms: UserRoomEntity[];

}