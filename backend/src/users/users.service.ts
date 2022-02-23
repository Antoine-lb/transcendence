import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/users.entity'
import { BasicUser } from './users.dto'
import { FriendRequestEntity } from '../entities/friends.entity';
import { FriendStatus } from '../entities/friend-request-interface';

import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
                @InjectRepository(FriendRequestEntity) private readonly friendRepository: Repository<FriendRequestEntity>) {}

    async addUser(user: BasicUser) : Promise<UserEntity> {
        const new_user= this.usersRepository.create({
            id: user.id,
            username: user.username,
            avatar: user.avatar
        })
        console.log('add new user : ' + new_user.username)
        return await this.usersRepository.save(new_user);
    }

    async findByName(username: string): Promise<UserEntity> {
        console.log("---> find by Name : " + username)
        const user: UserEntity = await this.usersRepository.findOne({ username })
		return user;
	}

    async findById(id: number): Promise<UserEntity> {
		return await this.usersRepository.findOne({ id });
	}

    async findAll(): Promise<UserEntity[]> {
		return await this.usersRepository.createQueryBuilder().getMany();
	}


    async getPendingSentRequests(currentUser: UserEntity): Promise<UserEntity[]>{
        const query = await this.usersRepository.createQueryBuilder('u')
        .select('FriendRequestEntity.receiver')
        .leftJoin('u.sentFriendRequests', 'FriendRequestEntity')
        .where('u.id = :uid', {uid: currentUser.id})
        .andWhere('FriendRequestEntity.status = :status', {status: FriendStatus.STATUS_PENDING})
        .getRawMany()
        const ids = []
        query.forEach(element => {
            ids.push(element.receiverId)
        });
        return await this.usersRepository.findByIds(ids)
    }

    async getPendingReceivedRequests(currentUser: UserEntity): Promise<UserEntity[]>{
        const query = await this.usersRepository.createQueryBuilder('u')
        .select('FriendRequestEntity.creator')
        .leftJoin('u.receivedFriendRequests', 'FriendRequestEntity')
        .where('u.id = :uid', {uid: currentUser.id})
        .andWhere('FriendRequestEntity.status = :status', {status: FriendStatus.STATUS_PENDING})
        .getRawMany()
        const ids = []
        query.forEach(element => {
            ids.push(element.creatorId)
        });
        return await this.usersRepository.findByIds(ids)
    }

    async getPendingFriends(currentUser: UserEntity): Promise<UserEntity[]> {

        const list: UserEntity[] = []
        var res = await this.getPendingSentRequests(currentUser)
        res.forEach(element => {
            list.push(element)
        });
        res = await this.getPendingReceivedRequests(currentUser)
        res.forEach(element => {
            list.push(element)
        });
        return list
    }

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

        return await this.usersRepository.findByIds(ids)
    }

    async sendFriendRequest(currentUser: UserEntity, receiver_id: number) {
        if (currentUser.id == receiver_id)
            throw new ForbiddenException('Impossible to add yourself !')
        
        const receiver: UserEntity = await  this.findById(receiver_id)
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

        const receiver: UserEntity = await this.findById(friend_id)
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
        const receiver: UserEntity = await this.findById(friend_id)
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