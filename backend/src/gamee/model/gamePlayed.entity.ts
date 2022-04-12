import { UserEntity } from "src/entities/users.entity";
import { StateI } from "src/gamee/model/state.interface";
import {
    Entity,
    Column,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinTable,
    OneToMany,
    OneToOne,
    JoinColumn,
    ManyToMany
} from "typeorm";


@Entity()
export class GamePlayedEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => UserEntity)
    @JoinTable()
    players: UserEntity[];

    @Column()
    winnerId: number;

    @Column()
    score: number;

    @CreateDateColumn()
    created_at: Date;
}
