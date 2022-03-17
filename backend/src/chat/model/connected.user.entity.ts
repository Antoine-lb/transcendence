import { UserEntity } from "src/entities/users.entity";
import { Column, Entity, JoinColumn, OneToOne, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConnectedUserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    socketID: string;

    @ManyToOne(() => UserEntity, user => user.connections)
    @JoinColumn()
    user: UserEntity;

}