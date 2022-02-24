import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { Controller, Get, Req, UseGuards, Post, Param, Delete, Res, UseInterceptors,
  ClassSerializerInterceptor, UploadedFile, Request, HttpCode } from '@nestjs/common';
import { ParseIntPipe, NotFoundException} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Jwt2FAGuard } from 'src/auth/jwt2FA.guard';
import { Observable, of } from 'rxjs';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
// import * as fs from 'fs'
import { unlink } from 'fs/promises';

type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';
export const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

// for front : enctype="multipart/form-data"
export const storage = {
  limits: {
    fields: 50,	  // Max number of non-file fields	(default Infinity)
    fileSize: 50000,	// = 49 Ko = 0.49 Mo For multipart forms, the max file size (in bytes) 	(default Infinity)
    files: 1,	    // For multipart forms, the max number of file fields	(default Infinity)
    parts: 50,	    // For multipart forms, the max number of parts (fields + files)	(default Infinity)
  },
  storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
          const filename: string = req.user.id;
          const extension: string = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`)
      }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: validMimeType[] = validMimeTypes;
    if (allowedMimeTypes.includes(file.mimetype) == true)
      cb(null, true)
    else
      cb(null, false)
  }
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, Jwt2FAGuard)
export class UserController {
  constructor( private readonly userService: UsersService
    ) {}

    
    @Get('/me')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Return user\'s profile'})
    getUserProfile(@Req() req) {
        return req.user;
    }
  
    // @Get(':id/friends')
    // async getFriendsId(@Param('id', new ParseIntPipe()) id: number){
    //   const user = await this.userService.findById(id)
    //   if (!user)
    //     throw new NotFoundException('User not found')
    //   return await this.friendService.getFriends(user)
    // }

    @Get(':id')
    async getUserProfileId(@Param('id', new ParseIntPipe()) id: number) {
      const user = await this.userService.findById(id);
      if (!user)
        throw new NotFoundException('User not found')
      return user;
  }

    @Get()
    async findAll(): Promise<UserEntity[]> {
      return await this.userService.findAll(); //TODO: voir si je peux return que les infos public
    }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Post('upload') // 'file' = valeur de la variable a envoyer dans le POST
    @UseInterceptors(FileInterceptor('file', storage))
    async uploadImage(@UploadedFile() file, @Request() req): Promise<any> {
      const user: UserEntity = req.user;
      if (!user)
        throw new NotFoundException('User not found')
      if (!file?.filename)
        throw new NotFoundException('Upload: file not valid')
      console.log("(upload) user : ", user);
      console.log('(upload) file : ', file)
      var filepath = await join(process.cwd(), 'uploads/avatars/' + file.filename)
      return await this.userService.updateOne(user.id, {avatar: filepath})
    }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Get('/me/avatar')
    async findProfileImage(@Res() res, @Request() req): Promise<any> {
      const user = this.userService.findById(req.user.id);
      if (!user)
        throw new NotFoundException('User not found')
      var filepath = req.user.avatar
      console.log('filepath : ', filepath)
      return res.sendFile(filepath);
    }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Get('/me/avatar/delete')
    async deleteAvatar(@Res() res, @Request() req): Promise<any> {
      const user = this.userService.findById(req.user.id);
      if (!user)
        throw new NotFoundException('User not found')
      var filepath = req.user.avatar
      console.log(filepath)
      // verifie que l'avatar a supprimer existe
      const fs = require("fs");
      if (!fs.existsSync(filepath)) {
        throw new NotFoundException('Not found - File does not exists')
      }
      // supprime l'avatar
      await fs.unlink(filepath, (err) => {
        if (err) {
         console.error('failed to delete local image:', err);
         throw new NotFoundException('failed to delete')
        }
       });
      // prepare un nouvel avatar par defaut
      const userEnt: UserEntity = req.user;
      if (!userEnt)
        throw new NotFoundException('User not found')
      var defaultpath = await join(process.cwd(), 'images/avatar_default.png')
      // verifier que l'avatar par default existe
      if (!fs.existsSync(defaultpath)) {
        throw new NotFoundException('Not found - Default avatar does not exists')
      }
      // update le user avec l'avatar
      await this.userService.updateOne(userEnt.id, {avatar: defaultpath})
      // redirige pour eviter une pending request
      res.redirect('/api/users/me');
    }

    // route qui valide les parametres et l'enregistre dans la base de donnees
    // @Get('/me/params')
    // async setUserParams(@Res() res, @Request() req) {
    //   const user = await this.userService.findById(id);
    //   if (!user)
    //     throw new NotFoundException('params : User not found')
    //   // username

    //   // avatar
              // update
              // delete && set to default
    //   // 2fa
    //   // turnOffTwoFA
    //   // return user;
    // }

  }