import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "./users.entity";
import { FriendStatus } from "./friend-request-interface";

@Entity('request')
export class FriendRequestEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (userEntity) => userEntity.sentFriendRequests)
    creator: UserEntity;

    @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.receivedFriendRequests,
    )
    receiver: UserEntity;

    @Column({ type: 'enum', enum: FriendStatus, 
    default: FriendStatus.STATUS_PENDING, nullable: false })
    status: FriendStatus;
}