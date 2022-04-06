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
import { UserRoomService } from '../user-room/user-room.service';
import { UserRoomRole, UserRoomEntity } from 'src/chat/model/user-room.entity';


@Injectable()
export class RoomService {
    constructor(
        private readonly usersService: UsersService,
        private readonly userRoomService: UserRoomService,

        @InjectRepository(RoomEntity)
        private readonly roomRepository: Repository<RoomEntity>
    ){}
    
    async addAllUsers(room: RoomI, creator: UserDto)
    {
        console.log(">>>>>> addAllUsers");
        const allUsers = await this.usersService.findAll();
        console.log("allUsers : ", allUsers);
        for (var user of allUsers)
        {
            if (user && (user != creator))
            {
                var newUserRoom = await this.userRoomService.create({ user: user, room: room, role: UserRoomRole.LAMBDA });
                console.log("newUserRoom : ", newUserRoom);
            }
        }
    }

    async createRoom(room: RoomI, creator: UserDto): Promise<RoomI> {
        // create UserRoomEntity
        const newUserRoom = await this.userRoomService.create({ user: creator, room: room, role: UserRoomRole.OWNER });
        console.log("newUserRoom : ", newUserRoom);
        // create RoomEntity
        const newRoom = await this.addCreatorToRoom(room, creator);
        // if (Public room)
        if (newRoom.status == true) {
            // hash and store the password
            if (newRoom.protected == true && room.password)
                newRoom.password = encodePassword(room.password);
            // add all users to the Room
            newRoom.users = await this.usersService.findAll();
            // NEW ROLES
            // this.addAllUsers(room, creator);
        }
        return await this.roomRepository.save(newRoom);
    }

    //////////////////////////////////////// PASSWORD FUNCTIONS ////////////////////////////////////////////////////////////
    
    async deletePassword(room: RoomI, modifier: UserDto): Promise<RoomI> {
        if (await this.isOwner(modifier.id, room.id) == false)
            throw new UnauthorizedException();
        if (room.status == false || room.protected == false || room.password == null)
            throw new UnauthorizedException();
        room.password = null;
        room.protected = false;
        return await this.roomRepository.save(room);
    }
 
  async modifyPassword(room: RoomI, modifier: UserDto, password: string): Promise<RoomI> {
        if (await this.isOwner(modifier.id, room.id) == false)
            throw new UnauthorizedException();
        if (room.status == false || room.protected == false || room.password == null)
            throw new UnauthorizedException();
        room.password = encodePassword(password);
        return await this.roomRepository.save(room);
    }

    async addPassword(room: RoomI, modifier: UserDto, password: string): Promise<RoomI> {
        if (await this.isOwner(modifier.id, room.id) == false)
            throw new UnauthorizedException();
        if (room.status == false)
            throw new UnauthorizedException();
        room.password = encodePassword(password);
        room.protected = true;
        return await this.roomRepository.save(room);
    }

    ////////////////////////////////////////// ROLES FUNCTIONS //////////////////////////////////////////////////////////////

    ////////////////////////////////////////// ROLES FUNCTIONS - ADD/CHANGE ROLE //////////////////////////////////////////////

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
                room.admins.push(admin);
            }
        }
        return await this.roomRepository.save(room);
    }

    arrayRemove(array, value) { 
        return array.filter(function(element) { 
            return element != value; 
        });
    }

    async banUsers(room: RoomI, bans: UserDto[], modifier: UserDto) {
        console.log(">>>>>> banUsers");
        // Check if the modifier User is an Admin
        if (await this.isAdmin(modifier.id, room.id) == false)
            throw new UnauthorizedException();
        if (!room.bans)
            room.bans = [];
        for (const ban of bans) {
            // TODO: CHANGE OWNER IF NEEDED + REMOVE FROM ADMINS
            // remove from admins if admin
            if (this.isAdmin(ban.id, room.id))
            {
                // console.log("room.admins BEFORE : ", room.admins);
                if (room.admins)
                    room.admins = this.arrayRemove(room.admins, ban);
                // console.log("room.admins AFTER : ", room.admins);
            }
            // Save Users as Ban
            room.bans.push(ban);
        }
        console.log("room.admins : ", room.admins);
        console.log("room.bans : ", room.bans);
        return await this.roomRepository.save(room);    
    }


    async unbanUsers(room: RoomI, bans: UserDto[], modifier: UserDto) {
        console.log(">>>>>> unbanUsers");
        // Check if the modifier User is an Admin
        if (await this.isAdmin(modifier.id, room.id) == false)
            throw new UnauthorizedException();
        if (!room.bans)
            room.bans = [];
        for (const ban of bans) {
            // CHANGE OWNER IF NEEDED + REMOVE FROM ADMINS
            // Save Users as Ban
            // console.log("room.bans BEFORE : ", room.bans);
            this.arrayRemove(room.bans, ban);
            // console.log("room.bans AFTER  : ", room.bans);
        }

        return await this.roomRepository.save(room);    
    }

    async muteUsers(room: RoomI, UsersToMute: UserDto[]) {
    }
    ////////////////////////////////////////// ROLES FUNCTIONS - GETTERS ////////////////////////////////////////////////////

    async getAdminRoomsForUser(userId: number): Promise<RoomI[]> {
        
        return this.roomRepository.createQueryBuilder('rooms') // query builder name ('adminRooms') is completely customisable
        .leftJoinAndSelect('rooms.admins', 'admins') // load "admins" relation (user entity) and select results as "admins"
        .where('admins.id = :id', { id: userId }) // search where users have the "user.id" as "adminId"
        .getMany(); // get many results
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

    async findAdminForRoom(room: RoomI, id: number): Promise<UserDto | undefined> { // not used at the moment
        // console.log(">>>>>> findAdminForRoom");
        for (const admin of room.admins) {
            if (admin.id == id)
                return admin;
        }
        return;
    }
    
    ////////////////////////////////////////// ROLES FUNCTIONS - CHECK ROLE ////////////////////////////////////////////////

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
    
}
