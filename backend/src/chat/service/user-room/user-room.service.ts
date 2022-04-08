import { Injectable, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
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
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService,

        @InjectRepository(UserRoomEntity)
        private readonly userRoomRepository: Repository<UserRoomEntity>
    ) { }
    
    ////////////////////////////////////////// SAVE/UPDATE FUNCTIONS //////////////////////////////////////////////////////////////

    async create(userRoom: UserRoomI): Promise<UserRoomI> {
        // s'il existe deja, ne pas creer
        var exists = await this.getRole(userRoom.room, userRoom.user);
        if (exists)
            return;
        return await this.userRoomRepository.save( userRoom );
    }
    
    async updateRole(room: RoomI, user: UserDto, modifier: UserDto, newRole: UserRoomRole) {
        var roles = await this.getRoles(room);
        // check that modifier is an admin
        if (roles[modifier.id] != UserRoomRole.OWNER && roles[modifier.id] != UserRoomRole.ADMIN)
            throw new UnauthorizedException();
        // check that user != modifier
        if (user.id == modifier.id)
            throw new UnauthorizedException();
        // si on modifie l'owner, le modifier devient owner
        if (roles[user.id] == UserRoomRole.OWNER)
            await this.userRoomRepository.update({ user: modifier, room: room }, { role: UserRoomRole.OWNER } );
        return await this.userRoomRepository.update({ user: user, room: room }, { role: newRole } );
    }

    ////////////////////////////////////////// FIND FUNCTIONS //////////////////////////////////////////////////////////////

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

    async getRoomsForUser(user: UserDto): Promise<RoomI[]> { 
        var userRoomsForUser: UserRoomEntity[] = await this.userRoomRepository.find({
            relations: ['room'],
            where: {
                user: user,
            },
        });
        var rooms = [];
        for (var userRoom of userRoomsForUser)
            rooms.push(userRoom.room);
        return rooms;
    }
    
    async getRole(room: RoomI, user: UserDto) { 
        var userRoomRoles: UserRoomEntity[] = await this.userRoomRepository.find({
            relations: ['user'],
            where: {
                room: room,
                user: user,
            },
        });
        var roles = {};
        for (var userRoom of userRoomRoles)
            roles[userRoom.user.id] = userRoom.role;
        return roles[user.id];       
    }

    async getRoles(room: RoomI) { 
        var userRoomRoles: UserRoomEntity[] = await this.userRoomRepository.find({
            relations: ['user'],
            where: {
                room: room,
            },
        });
        var roles = {};
        for (var userRoom of userRoomRoles)
            roles[userRoom.user.id] = userRoom.role;
        return roles;
    }
}
