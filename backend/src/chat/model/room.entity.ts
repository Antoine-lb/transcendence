import { UserEntity } from "src/entities/users.entity";
import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { JoinedRoomEntity } from "./joined-room.entity";
import { MessageEntity } from "./message.entity";


@Entity()
export class RoomEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    // @Column({nullable: true})
    // password: string; // hashed password

    @ManyToMany(() => UserEntity)
    @JoinTable()
    users: UserEntity[];

    @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.user)
    joinedUsers: JoinedRoomEntity[];

    @OneToMany(() => MessageEntity, message => message.room)
    messages: MessageEntity[];

    @CreateDateColumn()
    created_date: Date;

    @CreateDateColumn()
    updated_date: Date;
}
