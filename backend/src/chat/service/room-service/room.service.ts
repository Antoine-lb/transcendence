import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from 'src/chat/model/room.entity';
import { RoomI } from 'src/chat/model/room.interface';
import { UserEntity } from 'src/entities/users.entity';
import { createQueryBuilder, Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { createQuery } from 'mysql2/typings/mysql/lib/Connection';
import { UserDto } from 'src/entities/users.dto';
import { UsersService } from 'src/users/users.service';
import { encodePassword } from 'src/utils/bcrypt';


@Injectable()
export class RoomService {
    constructor(
        private readonly usersService: UsersService,

        @InjectRepository(RoomEntity)
        private readonly roomRepository: Repository<RoomEntity>
    ){}
    
    async createRoom(room: RoomI, creator: UserDto): Promise<RoomI> {
        const newRoom = await this.addCreatorToRoom(room, creator);
        // if (Public room)
        if (newRoom.status == true) {
            // hash and store the password
            if (newRoom.protected == true && room.password)
                newRoom.password = encodePassword(room.password);
            // add all users to the Room
            newRoom.users = await this.usersService.findAll();
        }
        return await this.roomRepository.save(newRoom);
    }
    
    async deletePassword(room: RoomI, modifier: UserDto): Promise<RoomI> {
        if (await this.isOwner(modifier.id, room.id) == false)
            throw new UnauthorizedException();
        if (room.status == false || room.protected == false || room.password == null)
            throw new UnauthorizedException();
        room.password = null;
        room.protected = false;
        return await this.roomRepository.save(room);
    }
    
    async updatePassword(room: RoomI, modifier: UserDto, password: string): Promise<RoomI> {
        if (await this.isOwner(modifier.id, room.id) == false)
            throw new UnauthorizedException();
        if (room.status == false || room.protected == false || room.password == null)
            throw new UnauthorizedException();
        room.password = encodePassword(password);;
        return await this.roomRepository.save(room);
    }
    async getAdminRoomsForUser(userId: number): Promise<RoomI[]> {
        
        return this.roomRepository.createQueryBuilder('rooms') // query builder name ('adminRooms') is completely customisable
        .leftJoinAndSelect('rooms.admins', 'admins') // load "admins" relation (user entity) and select results as "admins"
        .where('admins.id = :id', { id: userId }) // search where users have the "user.id" as "adminId"
        .getMany(); // get many results
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async isAdmin(userId: number, roomId: number) : Promise<boolean> {
        var admins = await this.getAdminsForRoom(roomId);
        for (var admin of admins)
        {
            if (admin.id == userId)
                return true;
        }
        return false;
     }
    
    async isOwner(userId: number, roomId: number) : Promise<boolean> {
        var room = await this.roomRepository.findOne(roomId);
        if (userId == room.ownerId)
            return true;
        return false;
     }
    
    async getAdminsForRoom(roomId: number) {
        var ret = await this.roomRepository.findOne(roomId, {
            relations: ['users', 'admins']
        });
        return ret.admins;
    }

    async getAdminsIdsForRoom(roomId: number) {

        var ret = await this.roomRepository.findOne(roomId, {
            relations: ['users', 'admins']
        });
        var adminsIds = [];
        for (const admin of ret.admins) {
            adminsIds.push(admin.id);
        }
        return adminsIds;
    }

    async getUsersForRoom(roomId: number) {

        var ret = await this.roomRepository.findOne(roomId, {
            relations: ['users', 'admins']
        });
        return ret.users;
    }

    async getUsersIdsForRoom(roomId: number) {
        var ret = await this.roomRepository.findOne(roomId, {
            relations: ['users', 'admins']
        });
        var usersIds = [];
        for (const user of ret.users) {
            usersIds.push(user.id);
        }
        return usersIds;
    }

    async getRoom(roomID: number): Promise<RoomI> {
        return await this.roomRepository.findOne(roomID, {
            relations: ['users', 'admins']
        })
    }

    async getRoomForUser(userID: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {

        const query = this.roomRepository
        .createQueryBuilder('room')
        .leftJoin('room.users', 'users')
        .where('users.id = :userID', { userID })
        
        return paginate(query, options);
    }

    async addCreatorToRoom(room: RoomI, creator: UserDto): Promise<RoomI> {
        // initialize empty array for the admins
        const admins: UserDto[] = [];
        // Save creator as Creator
        room.users.push(creator);
        // Save creator as Admin
        admins.push(creator);
        room.admins = admins;
        room.ownerId = creator.id;
        return room;
    }

    async addAdminsToRoom(room: RoomI, admins: UserDto[], modifier: UserDto): Promise<RoomI> {
        // Check if the modifier User is an Admin
        if (await this.isAdmin(modifier.id, room.id) == false)
            throw new UnauthorizedException();
        if (!room.admins)
        {
            room.admins = [];
            room.admins.push(modifier);
        }
        for (const admin of admins) {
            // Save User's'  as  Admin's' if (not already admin to the room)
            if (await this.isAdmin(admin.id, room.id) == false)
            {
                if (!room.admins)
                    room.admins = [];
                room.admins.push(admin);
            }
        }
        return await this.roomRepository.save(room);
    }

    async banUsers(room: RoomI, UsersToBan: UserDto[]) {
    }

    async muteUsers(room: RoomI, UsersToMute: UserDto[]) {
    }

    async findAdminForRoom(room: RoomI, id: number): Promise<UserDto | undefined> { // not userd at the moment
        // console.log(">>>>>> findAdminForRoom");
        for (const admin of room.admins) {
            if (admin.id == id)
                return admin;
        }
        return;
    }
}
