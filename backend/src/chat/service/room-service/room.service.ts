import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from 'src/chat/model/room.entity';
import { RoomI } from 'src/chat/model/room.interface';
import { UserEntity } from 'src/entities/users.entity';
import { createQueryBuilder, Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { createQuery } from 'mysql2/typings/mysql/lib/Connection';

@Injectable()
export class RoomService {

    constructor(
        @InjectRepository(RoomEntity)
        private readonly roomRepository: Repository<RoomEntity>
    ){}
    
    async createRoom(room: RoomI, creator: UserEntity): Promise<RoomI>{
        const newRoom = await this.addCreatorToRoom(room, creator);


        return this.roomRepository.save(newRoom);
    }

    async getRoom(roomID: number): Promise<RoomI> {
        return this.roomRepository.findOne(roomID, {
            relations: ['users']
        })
    }

    async getRoomForUser(userID: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {

        const query = this.roomRepository
        .createQueryBuilder('room')
        .leftJoin('room.users', 'users')
        .where('users.id = :userID', { userID })
        
        return paginate(query, options);
    }

    async addCreatorToRoom(room: RoomI, creator: UserEntity): Promise<RoomI> {

        room.users.push(creator);
        return await room;
    }
}
