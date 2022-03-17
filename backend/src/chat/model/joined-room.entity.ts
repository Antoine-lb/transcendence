import { UserEntity } from "src/entities/users.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { RoomEntity } from "./room.entity";

@Entity()
export class JoinedRoomEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    socketID: string;

    @ManyToOne(() => UserEntity, user => user.joinedRooms)
    @JoinColumn()
    user: UserEntity;

    @ManyToOne(() => RoomEntity, room => room.joinedUsers)
    @JoinColumn()
    room: RoomEntity;
}