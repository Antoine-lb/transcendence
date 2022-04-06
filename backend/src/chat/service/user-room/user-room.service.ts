import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoomEntity, UserRoomRole } from 'src/chat/model/user-room.entity';
import { UserRoomI } from 'src/chat/model/user-room.interface';
import { RoomI } from 'src/chat/model/room.interface';
import { UserDto } from 'src/entities/users.dto';
import { createQueryBuilder, Repository } from 'typeorm';

@Injectable()
export class UserRoomService {

    constructor(
        @InjectRepository(UserRoomEntity)
        private readonly userRoomRepository: Repository<UserRoomEntity>
    ) { }
    
    async create(userRoom: UserRoomI): Promise<UserRoomI> {
        console.log(">>>>>> UserRoomService create : ", userRoom);
        // console.log("find : ", await this.userRoomRepository.find());
        // return await this.userRoomRepository.update(userRoom);
        await this.userRoomRepository.save( userRoom );
        return
    }
    
    async findByUser(user: UserDto): Promise<UserRoomI[]> { 
        return await this.userRoomRepository.find({ user });
    }

    // async findByRoomSocket(user: UserDto, room: RoomI, socketID: string): Promise<UserRoomI[]> { 
    //     return await this.userRoomRepository.find({
    //         where: {
    //             user: user,
    //             room: room,
    //             socketID: socketID,
    //         },
    //     });
    // }
    
    async findByRoom(room: RoomI) : Promise<UserRoomI[]> { 
        return await this.userRoomRepository.find({ room });
    }
    
    // async deleteBySocketID(socketID: string) { 
    //     return await this.userRoomRepository.delete({ socketID })
    // }
    
    async deleteAll() {
        await this.userRoomRepository
            .createQueryBuilder()
            .delete()
            .execute();
    }
}
