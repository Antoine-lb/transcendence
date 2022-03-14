import { UserEntity } from "src/entities/users.entity";
import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable } from "typeorm";


@Entity()
export class RoomEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    description: string;

    @Column({nullable: true})
    password: string; // hashed password

    @ManyToMany(() => UserEntity)
    @JoinTable()
    users: UserEntity[]

    @CreateDateColumn()
    created_date: Date;

    @CreateDateColumn()
    updated_date: Date;
}
