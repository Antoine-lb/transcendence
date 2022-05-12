import { Injectable, Inject, forwardRef, NotFoundException, UnauthorizedException, ForbiddenException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/users.entity'
import { UserInterface } from '../entities/users.interface'
import { UserDto } from '../entities/users.dto'
import { join } from 'path';
// import { UserRoomService } from 'src/chat/service/user-room/user-room.service';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { UserRoomService } from 'src/chat/service/user-room/user-room.service';
import { UserRoomRole } from 'src/chat/model/user-room.entity';

@Injectable()
export class UsersService {
    constructor(
      // private readonly userRoomService: UserRoomService,
      @Inject(forwardRef(() => RoomService))
      private readonly roomService: RoomService,

      @Inject(forwardRef(() => UserRoomService))
      private readonly userRoomService: UserRoomService,

      @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>
    ){}
    
    // ############################################ create user ############################################ 

    async addUserToPublicRooms(user: UserDto) {
      // find all public rooms
      var publicRooms = await this.roomService.findAllPublic();
      // add user to userroom as LAMBDA
      for (var room of publicRooms)
        await this.userRoomService.create({ user: user, room: room, role: UserRoomRole.AVAILABLE });
    }

    async addUser(user: UserDto) : Promise<UserEntity> {
      // chech if default avatar exists
      var defaultfile = await join('/public/avatar_default.png')
      var defaultpath = await join(process.cwd(), 'public/avatar_default.png')
      const fs = require("fs");
      if (!fs.existsSync(defaultpath)) {
        throw new NotFoundException('Cannot create user - Default avatar does not exists')
      }
      // create user and save to bdd
      const new_user= this.usersRepository.create({
            id: user.id,
            username: user.username,
            avatar: defaultfile
      })
      var savedUser = await this.usersRepository.save(new_user);
      // ajoute l'utilisateur aux public room existantes
      await this.addUserToPublicRooms(user);
      return savedUser;

    }

    // ############################################ find functions ############################################ 

    async findByName(username: string): Promise<UserEntity> {
      const user: UserEntity = await this.usersRepository.findOne({ username })
		  return user;
	  }

    async findById(id: number): Promise<UserEntity> {
      return await this.usersRepository.findOne({ id });
    }

    async findManyIds(ids: number[]): Promise<UserEntity[]> {
      return await this.usersRepository.findByIds(ids)
    }

    async findAll(): Promise<UserEntity[]> {
      return await this.usersRepository.createQueryBuilder().getMany();
    }

    // ############################################ update functions ############################################
  
    getValueXP(lvl: number): number {
      if (lvl < 2)
        return 30;
      if (lvl < 4)
        return 20;
      if (lvl < 6)
        return 15;
      if (lvl < 8)
        return 10;
      else
        return 5;
    }
  
  async updateUserStatus(playerId: number, status: number) {
       await this.usersRepository.update(playerId, {
        isOnline: status
      });
     return (this.findById(playerId))
    
  }
  
  async updateUserScore(players: UserEntity[], winnerId: number) {
      
      for (const player of players) {
        
        const valueXP = this.getValueXP(player.lvl);
        if (player.id == winnerId) {

          if ((player.xp + valueXP) > 100 && player.lvl != 10) {
            
            await this.usersRepository.update(player.id, {
              lvl: player.lvl + 1,
              xp: 0,
              victory: player.victory + 1,
              played: player.played + 1,
            });
          }
          else if (player.lvl != 10)
            await this.usersRepository.update(player.id, {
              xp: Math.floor(player.xp + valueXP),
              victory: player.victory + 1,
              played: player.played + 1,
            });

        }
        else {
          if ((player.xp + valueXP / 2) > 100 && player.lvl != 10) 
          await this.usersRepository.update(player.id, {
            lvl: player.lvl + 1,
            xp: 0,
            defeats: player.defeats + 1,
            played: player.played + 1,
          });
        else if (player.lvl != 10)
          await this.usersRepository.update(player.id, {
            xp: Math.floor(player.xp + valueXP / 2),
            defeats: player.defeats + 1,
            played: player.played + 1,
          });
        }
      }
    }
  
    async updateParams(id: number, user: UserInterface): Promise<any> {
      // delete user.username;
      // delete user.role;
      await this.usersRepository.update(id, user);
      return (this.findById(id))
    }

    async setTwoFASecret(secret: string, id: number) {
        return await this.usersRepository.update(id, {
          secret: secret
        });
    }

    async turnOnTwoFA(id: number) {
      return await this.usersRepository.update(id, {
        isTwoFA: true
      });
    }

    async turnOffTwoFA(id: number) {
      return await this.usersRepository.update(id, {
        secret: null,
        isTwoFA: false
      });
    }

    // ############################################ file functions ############################################ 

    async fileExists(filepath: string) { 
      const fs = require("fs");
      if (await !fs.existsSync(filepath)) {
        return false;
      }
      return true;
    }

    async deleteFile(filepath: string) {
      if (filepath == '/app/public/avatar_default.png') {
        return true
      }
      const fs = await require("fs");
      await fs.unlink(filepath, (err) => {
        if (err) {
          return false;
        }
      })
      return true
      ;
    }

    async getFileName(filepath: string) {
      const path = await require('path');
      const filename = filepath;
      return await path.parse(filename).name;
    }

    async deleteSimilarFiles(filebase: string) {
      var filename = await this.getFileName(filebase);
      var prefix = await join(process.cwd(), 'public/uploads/')
      var files: string[] = [
        prefix + filename + '.jpg',
        prefix + filename + '.jpeg',
        prefix + filename + '.png',
      ]
      for (const file of files) {
        if ( await this.fileExists(file) == true && (file != (prefix + filebase)))
          var ret = await this.deleteFile(file)
      }
    }

    // ############################################ username functions ############################################ 

    async checkUsernameChars(str) {
      var allowed = /^[a-zA-Z0-9-_]*$/; // letters, numbers, hyphen and underscore
      if (await str.match(allowed))
        return true
      return false
    }

    async usernameExists(username: string) {
      const is_user = await this.findByName(username)
      if (!is_user)
        return false
      return true;
    }

    async usernameAddSuffix(username: string) {
      if (!username)
        throw new NotFoundException('Cannot update username - please try again later')
      var to_check = username
      var suffix : string = to_check.split('_').pop();
      var index = 1;
      var name = username.split('_').slice(0, -1).join('_')
      if (isNaN(Number(suffix)) == false)
        index = parseInt(suffix);
      else
        name = username;
      for (; ; index++) {
        if (await this.usernameExists(to_check) == false) {
          return to_check;
        }
        to_check = name + "_" + index.toString()
      }
    }

  }

