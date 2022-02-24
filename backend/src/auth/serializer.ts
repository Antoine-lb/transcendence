import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/entities/users.entity';

/*
	https://stackoverflow.com/questions/19948816/passport-js-error-failed-to-serialize-user-into-session

	Why .id: https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize

	https://www.passportjs.org/docs/configure/ - view session part
*/

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly usersService: UsersService) {
		super();
	}

	serializeUser(user: UserEntity, done: Function) {
		done(null, user.id)
	}

	async deserializeUser(id: number, done: Function) {
		const user: UserEntity = await this.usersService.findById(id);
		if (!user) {
			return done(null, null);
		}
		return done(null, user);
	}
}