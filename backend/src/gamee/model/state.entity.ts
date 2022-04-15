import { UserEntity } from "src/entities/users.entity";
import { StateI } from "src/gamee/model/state.interface";
import {
    Entity,
    Column,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
} from "typeorm";


@Entity()
export class StateEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    score?: { p1?: number, p2?: number };

    @Column()
    ball?: {
        x?: number;
        y?: number;
        dx?: number;
        dy?: number;
    };
    
    @Column()
    players?: [{
        x?: number;
        y?: number;
        vel: number;
    }, {
        x?: number;
        y?: number;
        vel?: number;
    }];
}
