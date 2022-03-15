import { UserEntity } from "src/entities/users.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConnectedUserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    socketID: string;

    @OneToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

}