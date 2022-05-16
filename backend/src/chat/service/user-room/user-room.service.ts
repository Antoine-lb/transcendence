import { Injectable, Inject, forwardRef, UnauthorizedException, NotFoundException, ImATeapotException, BadRequestException } from '@nestjs/common';
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

    // FAIT
    async create(userRoom: UserRoomI): Promise<UserRoomI> {
        try {
            // s'il existe deja, ne pas creer
            var exists = await this.getRole(userRoom.room, userRoom.user);
            if (exists)
                return;
            return await this.userRoomRepository.save( userRoom );
        }
        catch {
            throw new BadRequestException("Please try again later")
        }
    }

    async delete(room: RoomI, user: UserDto) { 
        return await this.userRoomRepository.delete({ room: room, user: user });
    }

    checkAuthorisationForMyself(currentRole: UserRoomRole, newRole: UserRoomRole)
    {
        if (
            // ne peut pas changer son role en owner OU s'il est owner (on rentre dans une autre fonction avant)
            currentRole == UserRoomRole.OWNER || 
            newRole == UserRoomRole.OWNER || 
            currentRole == UserRoomRole.FORBIDDEN || 
            currentRole == UserRoomRole.BANNED ||
            currentRole == UserRoomRole.MUTED || // ne peut pas partir non plus s'il est MUTED
            (currentRole == UserRoomRole.LAMBDA && newRole != UserRoomRole.AVAILABLE) ||
            (currentRole == UserRoomRole.AVAILABLE && newRole != UserRoomRole.LAMBDA) ||
            (currentRole == UserRoomRole.ADMIN && (newRole != UserRoomRole.LAMBDA && newRole != UserRoomRole.AVAILABLE)) 
        )
            return false;
        return true;
    }

    checkAuthorisationForOthers(modifierRole: UserRoomRole, currentRole: UserRoomRole, newRole: UserRoomRole)
    {
        if (modifierRole == UserRoomRole.ADMIN)
        {
            if (
                (currentRole == UserRoomRole.LAMBDA && newRole == UserRoomRole.BANNED) ||
                (currentRole == UserRoomRole.BANNED && newRole == UserRoomRole.LAMBDA) ||
                (currentRole == UserRoomRole.LAMBDA && newRole == UserRoomRole.MUTED) ||
                (currentRole == UserRoomRole.MUTED && newRole == UserRoomRole.LAMBDA)
            )
                return true;
        }
        else if (modifierRole == UserRoomRole.OWNER)
        {
            if (
                currentRole != UserRoomRole.AVAILABLE && 
                newRole != UserRoomRole.AVAILABLE && 
                currentRole != UserRoomRole.FORBIDDEN &&
                newRole != UserRoomRole.FORBIDDEN
            )
                return true;
        }
        return false;
    }

    async findNewOwner(room: RoomI, currentOwner: UserDto)
    {
       var users = await this.getUsersForRoom(room);
       var roles = await this.getAllRolesForRoom(room);
       for (var user of users)
       {
           // give priority to other admins
            if (currentOwner.id != user.id && (roles[user.id] == UserRoomRole.ADMIN))
                return user;
       }
       for (var user of users)
       {
            if (currentOwner.id != user.id && (roles[user.id] == UserRoomRole.LAMBDA))
                return user;
       }
       return null;
    }

    async updateRole(room: RoomI, user: UserDto, modifier: UserDto, newRole: UserRoomRole) {
        const checkModifier = await this.userService.findById(modifier.id);
        if (!checkModifier)
        throw new NotFoundException("Please try again later")
        const checkUser = await this.userService.findById(modifier.id);
        if (!checkUser)
            throw new NotFoundException("Please try again later")
        var roles = await this.getAllRolesForRoom(room);
        // si un owner quitdocerk-te la room
        if (user.id == modifier.id && roles[user.id] == UserRoomRole.OWNER && newRole == UserRoomRole.AVAILABLE)
        {
            var newOwner: UserDto = await this.findNewOwner(room, modifier);
            if (newOwner === null)
                throw new ImATeapotException("Can't leave room if you are the last person in it");
            await this.userRoomRepository.update({ user: newOwner, room: room }, { role: UserRoomRole.OWNER } );
            return await this.userRoomRepository.update({ user: modifier, room: room }, { role: newRole } );
        }
        // authorisations pour changer mon propre role
        else if (user.id == modifier.id)
        {
            if (this.checkAuthorisationForMyself(roles[user.id], newRole) == false)
                throw new UnauthorizedException("Can't change you own role from " + roles[user.id] + " to " + newRole);
        }
        // authorisations pour changer le role d'un autre
        else
        {
            if (this.checkAuthorisationForOthers(roles[modifier.id], roles[user.id], newRole) == false)
                throw new UnauthorizedException("Can't change other role from " + roles[user.id] + " to " + newRole + " when you are " + roles[modifier.id]);
        }
        return await this.userRoomRepository.update({ user: user, room: room }, { role: newRole } );
    }

    ////////////////////////////////////////// FIND FUNCTIONS //////////////////////////////////////////////////////////////

    ///////////////////////////////////////////// UTILS /////////////////////////////////////////////////////////////////

    async   isInRoom(user: UserDto, room: RoomI)
    {
        var role = await this.getRole(room, user)
        if (role == UserRoomRole.OWNER || role == UserRoomRole.ADMIN || role == UserRoomRole.LAMBDA || role == UserRoomRole.BANNED)
            return true;
        return false;
    }

    ////////////////////////////////////////// USERS GETTERS //////////////////////////////////////////////////////////////

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

    ////////////////////////////////////////// ROOMS GETTERS //////////////////////////////////////////////////////////////

    async getAllRoomsForUser(user: UserDto): Promise<RoomI[]> {
        var userRoomsForUser: UserRoomEntity[] = await this.userRoomRepository.find({
            relations: ['room'],
            where: {
                user: user,
            },
        });
        var rooms = [];
        for (var userRoom of userRoomsForUser)
        {
            rooms.push(userRoom.room);
        }
        return rooms;
    }

    ////////////////////////////////////////// ROLES GETTERS //////////////////////////////////////////////////////////////

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

    async getAllRolesForRoom(room: RoomI) { 
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

    async getAllRolesForUser(user: UserDto) { 
        var userRoomRoles: UserRoomEntity[] = await this.userRoomRepository.find({
            relations: ['room'],
            where: {
                user: user,
            },
        });
        var roles = {};
        for (var userRoom of userRoomRoles)
            roles[userRoom.room.id] = userRoom.role;
        return roles;
    }
    
}
