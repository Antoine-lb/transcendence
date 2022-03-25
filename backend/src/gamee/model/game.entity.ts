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
export class GameEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    // @Column()
    // name: string;

    // // true = public
    // @Column({ default: true })
    // status: boolean;

    // // false = not protected
    // @Column({ default: false })
    // protected: boolean;

    // @ManyToMany(() => UserEntity)
    // @JoinTable()
    // spectators: UserEntity[];

    // @Column({nullable: true})
    // password: string; // hashed password

    // @OneToMany(() => UserEntity, user => user.game)
    // players: UserEntity[];

    // @Column()
    // state: StateI;

    // @CreateDateColumn()
    // created_date: Date;

    // @CreateDateColumn()
    // updated_date: Date;
}
