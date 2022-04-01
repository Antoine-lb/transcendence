import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinedRoomEntity } from 'src/chat/model/joined-room.entity';
import { JoinedRoomI } from 'src/chat/model/joined-room.interface';
import { RoomI } from 'src/chat/model/room.interface';
import { UserDto } from 'src/entities/users.dto';
import { createQueryBuilder, Repository } from 'typeorm';

@Injectable()
export class JoinedRoomService {

    constructor(
        @InjectRepository(JoinedRoomEntity)
        private readonly joinedRoomRepository: Repository<JoinedRoomEntity>
    ) { }
    
    async create(joinedRoom: JoinedRoomI): Promise<JoinedRoomI> {
        return await this.joinedRoomRepository.save( joinedRoom );
    }
    
    async findByUser(user: UserDto): Promise<JoinedRoomI[]> { 
        return await this.joinedRoomRepository.find({ user });
    }

    async findByRoomSocket(user: UserDto, room: RoomI, socketID: string): Promise<JoinedRoomI[]> { 
        return await this.joinedRoomRepository.find({
            where: {
                user: user,
                room: room,
                socketID: socketID,
            },
        });
    }
    async findByRoom(room: RoomI) : Promise<JoinedRoomI[]> { 
        return await this.joinedRoomRepository.find({ room });
    }
    
    async deleteBySocketID(socketID: string) { 
        return await this.joinedRoomRepository.delete({ socketID })
    }
    
    async deleteAll() {
        await this.joinedRoomRepository
            .createQueryBuilder()
            .delete()
            .execute();
    }
}
