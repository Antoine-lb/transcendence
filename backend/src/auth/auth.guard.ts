import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class Guard42 extends AuthGuard('OAuth2') {

	async canActivate(context: ExecutionContext): Promise<any> {
		try
		{
			const activate = (await super.canActivate(context)) as boolean;
			const request = context.switchToHttp().getRequest();
			await super.logIn(request);
			return activate;
		}
		catch
		{
			return true;
		}
	}
}