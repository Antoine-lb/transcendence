import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/users.entity'
import { UserInterface } from '../entities/users.interface'
import { UserDto } from '../entities/users.dto'
import { switchMap, map } from 'rxjs/operators'
import { Observable, from } from 'rxjs';
import { FriendRequestEntity } from '../entities/friends.entity';
import { FriendStatus } from '../entities/friend-request-interface';
import { join } from 'path';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>){}
    
    // ############################################ create user ############################################ 

    async addUser(user: UserDto) : Promise<UserEntity> {
      // chech if default avatar exists
      var filepath = await join(process.cwd(), 'images/avatar_default.png')
      const fs = require("fs");
      if (!fs.existsSync(filepath)) {
        throw new NotFoundException('Cannot create user - Default avatar does not exists')
      }
      // create user and save to bdd
      const new_user= this.usersRepository.create({
            id: user.id,
            username: user.username,
            avatar: filepath
      })
      console.log('...saving new user : ' + new_user.username)
      return await this.usersRepository.save(new_user);
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
  
    async updateOneParam(id: number, user: UserInterface): Promise<any> {
      // delete user.username;
      // delete user.role;
      await this.usersRepository.update(id, user);
      return (this.findById(id))
    }
    
    // async updateRoleOfUser(id: number, user: UserInterface): Observable<any> {
    //     return await from(this.usersRepository.update(id, user));
    // }

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
        isTwoFA: false,
        secret: null
      });
    }

    // ############################################ file functions ############################################ 

    async fileExists(filepath: string) { 
      console.log('check if file exists : ', filepath)
      const fs = require("fs");
      if (await !fs.existsSync(filepath)) {
        return false;
      }
      return true;
    }

    async deleteFile(filepath: string) {
      if (filepath == '/app/images/avatar_default.png') {
        return true
      }
      const fs = await require("fs");
      await fs.unlink(filepath, (err) => {
        if (err) {
        console.error('failed to delete file:', err);
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
      var prefix = await join(process.cwd(), 'uploads/avatars/')
      var files: string[] = [
        prefix + filename + '.jpg',
        prefix + filename + '.jpeg',
        prefix + filename + '.png',
      ]
      for (const file of files) {
        console.log(file, " vs. ", (prefix + filebase))
        if ( await this.fileExists(file) == true && (file != (prefix + filebase)))
          var ret = await this.deleteFile(file)
      }
    }

    // ############################################ username functions ############################################ 

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
      for (let index = 1; ; index++) {
        if (await this.usernameExists(to_check) == false) {
          console.log("return : ", to_check)
          return to_check;
        }
        to_check = username + "_" + index.toString()
      }
    }

  }

