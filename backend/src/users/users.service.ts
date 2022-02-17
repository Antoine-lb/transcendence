import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity'
import { BasicUser } from './users.dto'

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,) {}

    async addUser(user: BasicUser) : Promise<UserEntity> {
        const new_user= this.usersRepository.create({
            id: user.id,
            username: user.username,
            avatar: user.avatar
        })
        console.log('add new user : ' + new_user.username)
        return await this.usersRepository.save(new_user);
    }

    async findByName(username: string): Promise<UserEntity> {
        console.log("---> find by Name : " + username)
        const user: UserEntity = await this.usersRepository.findOne({ username })
		return user;
	}

    async findById(id: number): Promise<UserEntity> {
		return await this.usersRepository.findOne({ id });
	}

    async findAll(): Promise<UserEntity[]> {
		return await this.usersRepository.createQueryBuilder('user_entity').getMany();
	}

    async setTwoFASecret(secret: string, id: number) {
        return this.usersRepository.update(id, {
          secret: secret
        });
    }

    async turnOnTwoFA(id: number) {
        return this.usersRepository.update(id, {
          isTwoFA: true
        });
      }
}