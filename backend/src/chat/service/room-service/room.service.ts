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


@Injectable()
export class RoomService {

    constructor(
        @InjectRepository(RoomEntity)
        private usersService: UsersService,
        private readonly roomRepository: Repository<RoomEntity>
    ){}
    
    async createRoom(room: RoomI, creator: UserEntity): Promise<RoomI> {

        const newRoom = await this.addCreatorToRoom(room, creator);

        // if (Public room)
        if (newRoom.status == true) {

            // hash and store the password
            if (newRoom.protected == true) {
                
            }
            // add all users to the Room
            newRoom.users = await this.usersService.findAll();
        }
        
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

    async addCreatorToRoom(room: RoomI, creator: UserDto): Promise<RoomI> {

        // Save creator as Creator
        room.users.push(creator);


        // Save creator as Admin
        room.admins.push(creator);

        return await room;
    }

    async addAdminsToRoom(room: RoomI, admins: UserDto[], modifier: UserDto): Promise<RoomI> {

        // Check if the modifier User is an Admin
        const user = await this.findAdminForRoom(room, modifier.id);
        if (!user) throw new UnauthorizedException();
        
        // Save User's'  as  Admin's'
        for (const admin of admins) {
            room.admins.push(admin);
        }
        return await room;
    }

    async deleteUserByName(room: RoomI, blockedUser: UserDto) {
        // delete room.users.delete({});
    }

    async findAdminForRoom(room: RoomI, id: number): Promise<UserDto | undefined> {

        
        for (const admin of room.admins) {
            if (admin.id == id) 
                return await admin;
        }
        return;
    }
}
