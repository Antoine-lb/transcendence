import { UserEntity } from "src/entities/users.entity";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    JoinTable,
    ManyToMany
} from "typeorm";


@Entity()
export class GamePlayedEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => UserEntity)
    @JoinTable()
    players: UserEntity[];

    @Column({nullable: true})
    winnerId: number;

    @Column({nullable: true})
    loserId: number;

    @Column()
    score: number;

    @CreateDateColumn()
    created_at: Date;
}
