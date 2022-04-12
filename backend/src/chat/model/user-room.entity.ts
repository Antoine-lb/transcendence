import { UserEntity } from "src/entities/users.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { RoomEntity } from "./room.entity";

export enum UserRoomRole {
    OWNER = "owner",
    ADMIN = "admin",
    BANNED = "banned",
    LAMBDA = "lambda",
    AVAILABLE = "available",
    FORBIDDEN = "forbidden",
    MUTED = "muted",
  }  

@Entity()
export class UserRoomEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, user => user.roleRooms)
    @JoinColumn()
    user: UserEntity;

    // dans chaque UserRoom il n'y a qu'une room, mais dans chaque room, il y a un array de UserRoomEntity
    @ManyToOne(() => RoomEntity, room => room.roleUsers)
    @JoinColumn()
    room: RoomEntity;

    @Column({
      type: "enum",
      enum: UserRoomRole,
      default: UserRoomRole.AVAILABLE,
    })
    role: UserRoomRole;
}