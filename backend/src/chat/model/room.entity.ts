import { UserEntity } from "src/entities/users.entity";
import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable } from "typeorm";


@Entity()
export class RoomEntity {
    
    @PrimaryGeneratedColumn()
    id: Number;

    @Column()
    name: String;

    @Column({nullable: true})
    description: String;

    @Column({nullable: true})
    password: string; // hashed password 

    @ManyToMany(() => UserEntity)
    @JoinTable()
    user: UserEntity[]

    @CreateDateColumn()
    created_date: Date;

    @CreateDateColumn()
    updated_date: Date;
}