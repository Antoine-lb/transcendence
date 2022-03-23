import { Controller, Get, Post, Query, Header, Res, Req, UseGuards, UnauthorizedException, HttpCode} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Guard42 } from './auth.guard';
import { Request, response, Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt.guard'
import { AuthService } from './auth.service';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

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
                if (this.authService.verifyToken(req.cookies['access_token']))
                    res.status(302).redirect('http://127.0.0.1:8080')
                else
                    res.status(302).redirect('/api/auth/callback')
            }
            else res.status(302).redirect('/api/auth/callback')
        }
    
        @Get('/islog')
        async islog(@Res() res: Response, @Req() req: Request) {
            if (req.cookies && req.cookies['access_token']) {
                if (this.authService.verifyToken(req.cookies['access_token']))
                    return await res.status(200).send({ logged: true });
                else
                    return await res.status(200).send({ logged: false });
            }
            return await res.status(200).send({ logged: false });
        }
        
        

        @UseGuards(Guard42)
        @Get('/callback')
        async initUser(@Res({passthrough: true}) res: Response, @Req() req: Request) {
            console.log('[auth/callback]')
            const user = await this.userService.findByName(req.user['username']);
            if (!user) throw new UnauthorizedException();
            let auth: boolean = user.isTwoFA == true ? true: false;
            const accessToken: string = this.jwtService.sign({ id: user.id, auth });
            
            await res.cookie('access_token', accessToken, {httpOnly: true});
            

            if (auth === true) {
                if (user.secret == null)
                    throw new UnauthorizedException('2FA enabled but secret not set');
                return
                // res.redirect('/api/2fa/authenticate');
            } 
            else {
                res.status(302).redirect('http://127.0.0.1:8080');
            }
        }

        @Get('/status')
        @UseGuards(JwtAuthGuard)
        @Header('Content-Type', 'application/json')
        async status(@Req() req: any, @Res() resp: Response) {
            let isAuthenticated: boolean, isTwoFaAuthenticated: boolean = false;
        
            try {
                if (req.cookies.access_token) {
                    let payload: any = await this.authService.verifyToken(req.cookies.access_token);
    
                    isTwoFaAuthenticated = req.user.two_factor_auth ? payload.is_2fa_valid : true;
                    isAuthenticated = true;
                }
            } catch (e) {}
            resp.send({ isTwoFaAuthenticated, isAuthenticated, user: req.user });
        }

        @Get('/logout')
        logout(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {
            resp.clearCookie('access_token');
            resp.status(302).redirect('http://127.0.0.1:8080')
        }
    }