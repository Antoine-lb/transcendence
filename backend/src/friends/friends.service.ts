import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequestEntity } from '../entities/friends.entity';
import { FriendStatus } from '../entities/friend-request-interface';
import { UserEntity } from 'src/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FriendsService {
    constructor(@InjectRepository(FriendRequestEntity) private readonly friendRepository: Repository<FriendRequestEntity>, private readonly usersService: UsersService) {}

    // async getPendingReceivedRequests(currentUser: UserEntity): Promise<UserEntity[]>{
    //     const query = await this.usersRepository.createQueryBuilder('u')
    //     .select('FriendRequestEntity.creator')
    //     .leftJoin('u.receivedFriendRequests', 'FriendRequestEntity')
    //     .where('u.id = :uid', {uid: currentUser.id})
    //     .andWhere('FriendRequestEntity.status = :status', {status: FriendStatus.STATUS_PENDING})
    //     .getRawMany()
    //     const ids = []
    //     query.forEach(element => {
    //         ids.push(element.creatorId)
    //     });
    //     return await this.usersService.findManyIds(ids)
    // }

    async getFriends(currentUser: UserEntity): Promise<UserEntity[]> {
        const query = await this.friendRepository.createQueryBuilder('f')
        .where('(f.creator = :uid OR f.receiver = :uid)', { uid: currentUser.id })
        .andWhere('f.status = :status', { status: FriendStatus.STATUS_ACCEPTED })
        .getRawMany()
        const ids = []
        query.forEach(element => {
            if (element.f_receiverId == currentUser.id)
                ids.push(element.f_creatorId)
            else
                ids.push(element.f_receiverId)
        });

        return await this.usersService.findManyIds(ids)
    }

    async getFriendsRequests(currentUser: UserEntity): Promise<UserEntity[]> {
        const list: UserEntity[] = []

        var query = await this.friendRepository.createQueryBuilder('f')
        .leftJoinAndSelect('f.creator', 'users')
        .where('f.receiver = :uid', {uid: currentUser.id})
        .andWhere('f.status = :status', {status: FriendStatus.STATUS_PENDING})
        .getRawMany()

        query.forEach(element => {
            list.push(element)
        });

        query = await this.friendRepository.createQueryBuilder('f')
        .leftJoinAndSelect('f.receiver', 'users')
        .where('f.creator = :uid', {uid: currentUser.id})
        .andWhere('f.status = :status', {status: FriendStatus.STATUS_PENDING})
        .getRawMany()

        query.forEach(element => {
            list.push(element)
        });
        return list
    }

    async sendFriendRequest(currentUser: UserEntity, receiver_id: number) {
        if (currentUser.id == receiver_id)
            throw new ForbiddenException('Impossible to add yourself !')
        
        const receiver: UserEntity = await this.usersService.findById(receiver_id)
        if (!receiver)
            throw new NotFoundException('User not found')
        
        const is_existing: FriendRequestEntity = await this.findRelationBetween(currentUser, receiver)
        if (is_existing && is_existing.status == FriendStatus.STATUS_ACCEPTED)
            throw new ForbiddenException('Already Friends');
        if (is_existing)
            throw new NotAcceptableException()
        
        const friend_request: FriendRequestEntity = new FriendRequestEntity();
        friend_request.creator = currentUser
        friend_request.receiver = receiver
        friend_request.status = FriendStatus.STATUS_PENDING
        this.friendRepository.save(friend_request)
        
        return 'add new friend ' + receiver_id +  ' to user ' + currentUser.username
    }

    async respondToRequest(currentUser: UserEntity, friend_id: number, status: FriendStatus) {
        if (currentUser.id == friend_id)
            throw new NotAcceptableException('This is yourself !')

        const receiver: UserEntity = await this.usersService.findById(friend_id)
        if (!receiver)
            throw new NotFoundException('User Not Found')
        
        const friendship: FriendRequestEntity = await this.findRelationBetween(currentUser, receiver)
        
        if (!friendship)
            throw new NotAcceptableException('No relation with this user')
       
        if (friendship.status == status)
            throw new NotAcceptableException('Action Impossible')
        
        if (friendship.creator.id == currentUser.id)
            throw new NotAcceptableException('Action Impossible')
        
        friendship.status = status
        await this.friendRepository.save(friendship)
        return true
    }

    async removeFriend(currentUser: UserEntity, friend_id: number): Promise<boolean> {
        if (currentUser.id == friend_id)
            throw new NotAcceptableException('This is yourself !')
        const receiver: UserEntity = await this.usersService.findById(friend_id)
        if (!receiver)
            throw new NotFoundException('User Not Found')
        const friendship: FriendRequestEntity = await this.findRelationBetween(currentUser, receiver)
        if (!friendship)
            throw new NotAcceptableException('No relation with this user')
        await this.friendRepository.delete(friendship.id)
        return true
    }

    async updateFriendRequest(currentUser: UserEntity){}

    async findRelationsOf(currentUser: UserEntity, status: FriendStatus): Promise<FriendRequestEntity[]>{
        return this.friendRepository.createQueryBuilder('f')
        // .select('UserEntity.username')
        .leftJoin('f.creator', 'UserEntity')
        .where('(f.creatorId = :uid OR f.receiverId = :uid)', { uid: currentUser.id })
        .andWhere('f.status = :status', { status: status })
        .getMany()
        
    }

    async findRelationBetween(creator: UserEntity, receiver: UserEntity): Promise<FriendRequestEntity> {
        return this.friendRepository.findOne({
            where: [
              { creator, receiver },
              { creator: receiver, receiver: creator }],
            relations: ['creator', 'receiver'],
            })}
}
