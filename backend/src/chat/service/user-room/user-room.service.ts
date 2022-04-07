import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    
    async updateRole(room: RoomI, user: UserDto, modifier: UserDto, newRole: UserRoomRole) {
        var roles = await this.getRoles(room);
        var modifierRole = roles[modifier.id];
        var userRole = roles[user.id];
        // check that modifier is an admin
        if (modifierRole != UserRoomRole.OWNER && modifierRole != UserRoomRole.ADMIN)
            throw new UnauthorizedException();
        // check that user !- modifier
        if (user.id == modifier.id)
            throw new UnauthorizedException();
        // si on modifie l'owner, le modifier devient owner
        if (userRole == UserRoomRole.OWNER)
            await this.userRoomRepository.update({ user: modifier, room: room }, { role: UserRoomRole.OWNER } );
        return await this.userRoomRepository.update({ user: user, room: room }, { role: newRole } );
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

    async findByRoom(room: RoomI) : Promise<UserRoomI[]> { 
        return await this.userRoomRepository.find({ room });
    }
}
