import { UserEntity } from "src/entities/users.entity";
import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from "typeorm";
import { JoinedRoomEntity } from "./joined-room.entity";
import { MessageEntity } from "./message.entity";


@Entity()
export class RoomEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    ownerId: number;

    // true = public
    @Column({ default: true })
    status: boolean;

    // false = not protected
    @Column({ default: false })
    protected: boolean;


    @ManyToMany(() => UserEntity)
    @JoinTable()
    admins: UserEntity[];

    @Column({nullable: true})
    password: string; // hashed password

    @ManyToMany(() => UserEntity)
    @JoinTable()
    users: UserEntity[];

    @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
    joinedUsers: JoinedRoomEntity[];

    @OneToMany(() => MessageEntity, message => message.room)
    messages: MessageEntity[];

    @CreateDateColumn()
    created_date: Date;

    @CreateDateColumn()
    updated_date: Date;
}
