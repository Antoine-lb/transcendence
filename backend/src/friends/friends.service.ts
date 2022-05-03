import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequestEntity } from '../entities/friends.entity';
import { FriendStatus } from '../entities/friend-request-interface';
import { UserEntity } from 'src/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/entities/users.dto';

@Injectable()
export class FriendsService {
    constructor(@InjectRepository(FriendRequestEntity) private readonly friendRepository: Repository<FriendRequestEntity>, private readonly usersService: UsersService) {}

    async checkFriendId(currentUser: UserDto, friend_id: number): Promise<UserEntity>{
        if (currentUser.id == friend_id)
            throw new NotAcceptableException('This is yourself !')
        const receiver: UserEntity = await this.usersService.findById(friend_id)
        if (!receiver)
            throw new NotFoundException('User Not Found')
        return receiver;
    }

    async getFriends(currentUser: UserDto): Promise<UserDto[]> {
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

    async getBlockedFriends(currentUser: UserDto): Promise<UserDto[]> {
        const query = await this.friendRepository.createQueryBuilder('f')
        .where('(f.creator = :uid OR f.receiver = :uid)', { uid: currentUser.id })
        .andWhere('f.status = :status', { status: FriendStatus.STATUS_BLOCKED })
        .getRawMany()
        const ids = []
        query.forEach(element => {
            if (element.f_receiverId == currentUser.id) {
                if (element.f_blockedByReceiver)
                    ids.push(element.f_creatorId)
            }
            else {
                if (element.f_blockedByCreator)
                    ids.push(element.f_receiverId)
            }
        });

        return await this.usersService.findManyIds(ids)
    }


    async getFriendsRequests(currentUser: UserDto): Promise<UserDto[]> {
        const list: UserDto[] = []

        var query = await this.friendRepository.createQueryBuilder('f')
        .leftJoinAndSelect('f.creator', 'users')
        .where('f.receiver = :uid', {uid: currentUser.id})
        .andWhere('f.status = :status', {status: FriendStatus.STATUS_WAITING})
        .getRawMany()

        query.forEach(element => {
            list.push(element)
        });

        query = await this.friendRepository.createQueryBuilder('f')
        .leftJoinAndSelect('f.receiver', 'users')
        .where('f.creator = :uid', {uid: currentUser.id})
        .andWhere('f.status = :status', {status: FriendStatus.STATUS_WAITING})
        .getRawMany()

        query.forEach(element => {
            list.push(element)
        });
        return list
    }

    async sendFriendRequest(currentUser: UserEntity, receiver_id: number) {
        const receiver: UserEntity = await this.checkFriendId(currentUser, receiver_id)
        const is_existing: FriendRequestEntity = await this.findRelationBetween(currentUser, receiver)
        
        if (is_existing && is_existing.status == FriendStatus.STATUS_ACCEPTED)
            throw new ForbiddenException('Already Friends');
        if (is_existing)
            throw new NotAcceptableException()
        
        const friend_request: FriendRequestEntity = new FriendRequestEntity();
        friend_request.creator = currentUser
        friend_request.receiver = receiver
        friend_request.status = FriendStatus.STATUS_WAITING
        this.friendRepository.save(friend_request)
        
        return 'add new friend ' + receiver_id +  ' to user ' + currentUser.username
    }

    async respondToRequest(currentUser: UserDto, friend_id: number, status: FriendStatus) {
        if (currentUser.id == friend_id)
            throw new NotAcceptableException('This is yourself !')

        const receiver: UserDto = await this.usersService.findById(friend_id)
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

    async removeFriend(currentUser: UserDto, friend_id: number): Promise<any> {
        const receiver: UserDto = await this.checkFriendId(currentUser, friend_id)
        const friendship: FriendRequestEntity = await this.findRelationBetween(currentUser, receiver)
        if (!friendship || friendship.status == FriendStatus.STATUS_BLOCKED)
            throw new NotAcceptableException('No relation with this user')
        return await this.friendRepository.delete(friendship.id)
    }

    async blockUser(currentUser: UserDto, friend_id: number){
        const receiver: UserDto = await this.checkFriendId(currentUser, friend_id)
        const friendship: FriendRequestEntity = await this.findRelationBetween(currentUser, receiver)
        if (!friendship || friendship.status == FriendStatus.STATUS_BLOCKED)
            throw new NotAcceptableException('No relation with this user - please refresh')
        if (currentUser.id == friendship.creator.id) {
            friendship.blockedByCreator = true
            friendship.status = FriendStatus.STATUS_BLOCKED
            this.friendRepository.save(friendship)
        }
        else if (currentUser.id == friendship.receiver.id) {
            friendship.blockedByReceiver = true
            friendship.status = FriendStatus.STATUS_BLOCKED
            this.friendRepository.save(friendship)
        }
        return currentUser.id + ' blocked ' + friend_id
    }

    async unblockUser(currentUser: UserDto, friend_id: number){
        const receiver: UserDto = await this.checkFriendId(currentUser, friend_id)
        const friendship: FriendRequestEntity = await this.findRelationBetween(currentUser, receiver)
        if (friendship) {
            if (currentUser.id == friendship.creator.id) {
                friendship.blockedByCreator = false
            }
            else if (currentUser.id == friendship.receiver.id) {
                friendship.blockedByReceiver = false
            }
            friendship.status = FriendStatus.STATUS_ACCEPTED
            this.friendRepository.save(friendship)
        }
        else
            throw new NotAcceptableException('No relation with this user - please refresh')
    }

    async findRelationBetween(creator: UserDto, receiver: UserDto): Promise<FriendRequestEntity> {
        return this.friendRepository.findOne({
            where: [
              { creator, receiver },
              { creator: receiver, receiver: creator }],
            relations: ['creator', 'receiver'],
            })}
}
