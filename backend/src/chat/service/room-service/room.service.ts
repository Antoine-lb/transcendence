import { Injectable, Inject, forwardRef, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from 'src/chat/model/room.entity';
import { RoomI } from 'src/chat/model/room.interface';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { UserDto } from 'src/entities/users.dto';
import { UsersService } from 'src/users/users.service';
import { encodePassword } from 'src/utils/bcrypt';
import { UserRoomService } from '../user-room/user-room.service';
import { UserRoomRole, UserRoomEntity } from 'src/chat/model/user-room.entity';


@Injectable()
export class RoomService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
        
        @Inject(forwardRef(() => UserRoomService))
        private readonly userRoomService: UserRoomService,

        @InjectRepository(RoomEntity)
        private readonly roomRepository: Repository<RoomEntity>
    ){}

    async createRoom(room: RoomI, creator: UserDto): Promise<RoomI> {
        // add creator to users
        const user = await this.usersService.findById(creator.id);
        if (!user)
            throw new NotFoundException('User not found')
        room.users.push(creator);
        // if (Public room)
        if (room.status == true) {
            // hash and store the password
            if (room.protected == true && room.password)
                room.password = encodePassword(room.password);
            // add all users to the Room
            // room.users = await this.usersService.findAll();
        }
        return await this.roomRepository.save(room);
    }

    //////////////////////////////////////// PASSWORD FUNCTIONS ////////////////////////////////////////////////////////////
        
    async isOwner(user: UserDto, room: RoomI) : Promise<boolean> {
        var role = await this.userRoomService.getRole(room, user);
        if (role == UserRoomRole.OWNER)
            return true;
        return false;
    }

    async deletePassword(room: RoomI, modifier: UserDto): Promise<RoomI> {
        if (await this.isOwner(modifier, room) == false)
            throw new UnauthorizedException();
        if (room.status == false || room.protected == false || room.password == null)
            throw new UnauthorizedException();
        room.password = null;
        room.protected = false;
        return await this.roomRepository.save(room);
}
 
    async modifyPassword(room: RoomI, modifier: UserDto, password: string): Promise<RoomI> {
        if (await this.isOwner(modifier, room) == false)
            throw new UnauthorizedException();
        if (room.status == false || room.protected == false || room.password == null)
            throw new UnauthorizedException();
        room.password = encodePassword(password);
        return await this.roomRepository.save(room);
    }

    async addPassword(room: RoomI, modifier: UserDto, password: string): Promise<RoomI> {
        if (await this.isOwner(modifier, room) == false)
            throw new UnauthorizedException();
        if (room.status == false)
            throw new UnauthorizedException();
        room.password = encodePassword(password);
        room.protected = true;
        return await this.roomRepository.save(room);
    }

    //////////////////////////////////////// ROOM RENAMING ////////////////////////////////////////////////////////////
 
    async renameRoom(room: RoomI, modifier: UserDto, newName: string): Promise<RoomI> {        
        if (await this.isOwner(modifier, room) == false)
            throw new UnauthorizedException();
        room.name = newName;
        if (!newName || !newName.length)
            room.name = "No name"
        return await this.roomRepository.save(room);
    }

    ////////////////////////////////////////// GETTER FUNCTIONS //////////////////////////////////////////////////////////////

    async getRoom(roomID: number): Promise<RoomI> {
        return await this.roomRepository.findOne(roomID, {
            relations: ['users', 'admins']
        })
    }

    async findAllPublic(): Promise<RoomI[]> {
        var allRooms = await this.roomRepository.createQueryBuilder().getMany();
        var publicRooms = [];
        for (var room of allRooms)
        {
            if (room.status == true)
                publicRooms.push(room);
        }
        return publicRooms;
    }

    // async getUsersForRoom(roomId: number) {
    //     var ret = await this.roomRepository.findOne(roomId, {
    //         relations: ['users', 'admins']
    //     });
    //     return ret.users;
    // }

    // async getUsersIdsForRoom(roomId: number) {
    //     var ret = await this.roomRepository.findOne(roomId, {
    //         relations: ['users', 'admins']
    //     });
    //     var usersIds = [];
    //     for (const user of ret.users) {
    //         usersIds.push(user.id);
    //     }
    //     return usersIds;
    // }

    // async updateUsers(roomId: number, newUsers: UserDto[])
    // {
    //     return await this.roomRepository.update({ id: roomId }, { users: newUsers } );        
    // }

    // async findAll(): Promise<RoomI[]> {
    //     return await this.roomRepository.createQueryBuilder().getMany();
    // }

    // async getRoomForUser(userID: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {

    //     const query = this.roomRepository
    //     .createQueryBuilder('room')
    //     .leftJoin('room.users', 'users')
    //     .where('users.id = :userID', { userID })
        
    //     return paginate(query, options);
    // }

    async muteUsers(room: RoomI, UsersToMute: UserDto[]) {

    }
}
