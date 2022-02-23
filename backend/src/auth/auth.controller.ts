import { Controller, Get, Post, Query, Header, Res, Req, UseGuards, UnauthorizedException, HttpCode} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Guard42 } from './auth.guard';
import { Request, response, Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt.guard'
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController{
        constructor (
            private userService: UsersService,
            private jwtService: JwtService,
            private readonly authService: AuthService
        ) {}
    
        @UseGuards(Guard42)
        @Get('/login')
        async login() {}
        
        @UseGuards(Guard42)
        @Get('/callback')
        async initUser(@Res({passthrough: true}) res: Response, @Req() req: Request) {
            console.log('[auth] >>> /callback')
            const user = await this.userService.findByName(req.user['username']);
            if (!user) throw new UnauthorizedException();
            let auth: boolean = user.isTwoFA == false ? true: false;
            // let auth: boolean = user.secret == null ? true: false;
            const accessToken: string = this.jwtService.sign({ id: user.id, auth });
            console.log('[access_token] >>> ', accessToken)
            await res.cookie('access_token', accessToken, {httpOnly: true});

            if (auth === false) {
                console.log('[auth] >>> /callback')
                if (user.secret == null)
                    throw new UnauthorizedException('2FA enabled but secret not set');
                return
                // res.redirect('/api/2fa/authenticate');
            } 
            else {
                res.status(302).redirect('http://127.0.0.1:3000/api/users/me');
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
    }