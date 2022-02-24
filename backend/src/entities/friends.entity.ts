import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "./users.entity";
import { FriendStatus } from "./friend-request-interface";

@Entity('friendship')
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

    @Column({default: false})
    blockedByCreator: boolean;

    @Column({default: false})
    blockedByReceiver: boolean;

    @Column({ type: 'enum', enum: FriendStatus, 
    default: FriendStatus.STATUS_WAITING, nullable: false })
    status: FriendStatus;
}