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
} from "typeorm";


@Entity()
export class LeaderBoardEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    winner: UserEntity;

    @Column()
    loser: UserEntity;

    @Column()
    score: number;

    @CreateDateColumn()
    created_at: Date;
}
