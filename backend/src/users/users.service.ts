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

    async addUser(user: UserDto) : Promise<UserEntity> {
      // chech if default avatar exists
      var filepath = await join(process.cwd(), 'images/avatar_default.png')
      // console.log('first time avatar filepath : ', filepath)
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
      console.log('add new user : ' + new_user.username)
      return await this.usersRepository.save(new_user);
    }

    async findByName(username: string): Promise<UserEntity> {
        // console.log("---> find by Name : " + username)
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

    findOne(id: number): Observable<UserInterface> {
        return from(this.usersRepository.findOne({id})).pipe(
            map((user: UserInterface) => {
                const {...result} = user;
                return result;
            } )
        )
      }

    updateOne(id: number, user: UserInterface): Observable<any> {
        delete user.username;
        // delete user.role;
        return from(this.usersRepository.update(id, user)).pipe(
            switchMap(() => this.findOne(id))
        );
      }
  
      async updateOneParam(id: number, user: UserInterface): Promise<any> {
        delete user.username;
        // delete user.role;
        return await from(this.usersRepository.update(id, user));
      }
      aupdateRoleOfUser(id: number, user: UserInterface): Observable<any> {
          return from(this.usersRepository.update(id, user));
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
          isTwoFA: false
        });
      }

}
