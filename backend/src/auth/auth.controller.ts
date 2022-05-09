import { Controller, Get, Post, Query, Header, Res, Req, UseGuards, UnauthorizedException, HttpCode} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Guard42 } from './auth.guard';
import { Request, response, Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt.guard'
import { AuthService } from './auth.service';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    },
);

@ApiTags('auth')
@Controller('auth')
export class AuthController{
        constructor (
            private userService: UsersService,
            private jwtService: JwtService,
            private readonly authService: AuthService
        ) {}
    
        @Get('/login')
        async login(@Res() res: Response, @Req() req: Request) {
            if (req.cookies && req.cookies['access_token']) {
                try {
                    if (this.authService.verifyToken(req.cookies['access_token']))
                        res.status(302).redirect('http://127.0.0.1:8080')
                    else
                        res.status(302).redirect('/api/auth/callback')
                }
                catch {
                    // console.log("catch token 1")
                    res.clearCookie('access_token');
                    res.clearCookie('access_token_2fa'); 
                    return res.status(302).redirect('http://127.0.0.1:8080')
                }

            }
            else res.status(302).redirect('/api/auth/callback')
        }


        @Get('/islog')
        // apres "authorise 42 : token 1 mais pas token 2"
        // apres "validation code : les 2 tokens"
        async islog(@Res() res: Response, @Req() req: Request) {
            var is_logged = false;
            var is_2fa_logged = false;
            if (req.cookies)
            {
                try
                {
                    if (req.cookies['access_token'])
                        if (await this.authService.verifyToken(req.cookies['access_token']))
                            is_logged = true;
                    if (req.cookies['access_token_2fa']) // TO DO : properly verify token
                    {
                        if (await this.authService.verifyToken(req.cookies['access_token_2fa']))
                            is_2fa_logged = true;
                    }
                }
                catch {
                    // console.log("catch token 2")
                    res.clearCookie('access_token');
                    res.clearCookie('access_token_2fa'); 
                    return res.status(302).redirect('http://127.0.0.1:8080')
                }
            }
            return await res.status(200).send({logged : is_logged, logged_2fa: is_2fa_logged });
        }

        // is_logged & is_logged_2fa
        // false   -   false   : not logged
        // false   -   true    : should not happen
        // true    -   false   : logged if 2fa not enabled
        // true    -   true    : logged

        @UseGuards(Guard42)
        @Get('/callback')
        async initUser(@Res({passthrough: true}) res: Response, @Req() req: Request) {
            if (!req.user || !req.user['username'])
                return res.redirect('http://127.0.0.1:8080/');
            const user = await this.userService.findByName(req.user['username']);
            if (!user)
                throw new UnauthorizedException('User does not exists');
            let auth: boolean = user.isTwoFA == true ? true: false;
            const accessToken: string = this.jwtService.sign({ id: user.id, auth });
            
            await res.cookie('access_token', accessToken, {httpOnly: true});
            await this.userService.updateParams(user.id, {
                isOnline: 1
            });
            if (auth === true) {

                if (user.secret == null)
                    throw new UnauthorizedException('2FA enabled but secret not set');
                res.redirect('http://127.0.0.1:8080/log2fa');
            } 
            else {
                if (req.user['isNew'] == false)
                    res.status(302).redirect('http://127.0.0.1:8080');
                else
                    res.status(302).redirect('http://127.0.0.1:8080/setup');
            }
        }

        @UseGuards(JwtAuthGuard)
        @Get('/status')
        @Header('Content-Type', 'application/json')
        async status(@Req() req: any, @Res() resp: Response) {
            let isAuthenticated: boolean, isTwoFaAuthenticated: boolean = false;
            try {
                if (req.cookies.access_token) {
                    let payload: any = await this.authService.verifyToken(req.cookies.access_token);
    
                    isTwoFaAuthenticated = req.user.two_factor_auth ? payload.is_2fa_valid : true;
                    isAuthenticated = true;
                }
            } catch (e) {
                // console.log("catch token 3")
                resp.clearCookie('access_token');
                resp.clearCookie('access_token_2fa'); 
                return resp.status(302).redirect('http://127.0.0.1:8080')
            }
            resp.send({ isTwoFaAuthenticated, isAuthenticated, user: req.user });
        }

        @UseGuards(JwtAuthGuard)
        @Get('/logout')
        async logout(@Req() req: Request, @Res({ passthrough: true }) resp: Response, @User() logged_user) {
            const user = await this.userService.findByName(logged_user['username']);
            if (!user)
                throw new UnauthorizedException('User does not exists');
            await this.userService.updateParams(logged_user.id, {
                isOnline: 0
            });
            resp.clearCookie('access_token');
            resp.clearCookie('access_token_2fa');
            resp.status(302).redirect('http://127.0.0.1:8080')
        }
    }