import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoomEntity, UserRoomRole } from 'src/chat/model/user-room.entity';
import { UserRoomI } from 'src/chat/model/user-room.interface';
import { RoomI } from 'src/chat/model/room.interface';
import { UserDto } from 'src/entities/users.dto';
import { createQueryBuilder, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserRoomService {

    constructor(
        private readonly userService: UsersService,

        @InjectRepository(UserRoomEntity)
        private readonly userRoomRepository: Repository<UserRoomEntity>
    ) { }
    
    async create(userRoom: UserRoomI): Promise<UserRoomI> {
        return await this.userRoomRepository.save( userRoom );
    }
    
    async findByUser(user: UserDto): Promise<UserRoomI[]> { 
        return await this.userRoomRepository.find({ user });
    }

    async getUsersForRoom(room: RoomI): Promise<UserDto[]> { 
        var userRoomsForRoom: UserRoomEntity[] = await this.userRoomRepository.find({
            relations: ['user'],
            where: {
                room: room,
            },
        });
        var users = [];
        for (var userRoom of userRoomsForRoom)
            users.push(userRoom.user);
        return users;
    }
    
    // async getRoles(room: RoomI): Promise<UserDto[]> { 
    async getRoles(room: RoomI): Promise<UserRoomEntity[]>{ 
        var userRoomRoles: UserRoomEntity[] = await this.userRoomRepository.find({
            relations: ['user'],
            where: {
                room: room,
            },
        });
        console.log("getRoles userRooms : ", userRoomRoles);
        var roles = [];
        for (var userRoom of userRoomRoles)
            roles.push({ userRoom.user.id, userRoom.role });
        return roles;
    }

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
