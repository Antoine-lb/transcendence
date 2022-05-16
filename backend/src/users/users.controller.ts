import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Req, UseGuards, Post, Param, Delete, Res, UseInterceptors,
  ClassSerializerInterceptor, UploadedFile, Request, HttpCode } from '@nestjs/common';
import { ParseIntPipe, NotFoundException, BadRequestException, UnsupportedMediaTypeException, PayloadTooLargeException} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Jwt2FAGuard } from 'src/auth/jwt2FA.guard';
import { diskStorage } from 'multer';
import path = require('path');
import { Response } from 'express';
import { join } from 'path';

type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';
export const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes: validMimeType[] = validMimeTypes;
  const fileSize = parseInt(req.headers['content-length']);
  if (allowedMimeTypes.includes(file.mimetype) == true)
  {
    if (fileSize > 500000)
      return cb(new PayloadTooLargeException(''));
    cb(null, true)
  }
  else
    cb(null, false)
};

// for front : enctype="multipart/form-data"
export const uploadOptions = {
  storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
          const filename: string = req.user.id;
          const extension: string = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`)
      }
  }),
  fileFilter: imageFileFilter
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UsersService,
    ) {}
    
    @Get('/me')
    @ApiOperation({summary: 'Return user\'s profile'})
    async getUserProfile(@Req() req, @Res() res) {
      const cookies: string = req.cookies['access_token'];
      await res.send({ user: req.user, access_token: cookies});
      return res
    }

    @Get(':id')
    async getUserProfileId(@Param('id', new ParseIntPipe()) id: number) {
      const user = await this.userService.findById(id);
      if (!user)
        throw new NotFoundException('Please try again later')
      return user;
  }

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(): Promise<UserEntity[]> {
      return await this.userService.findAll(); //TODO: voir si je peux return que les infos public
    }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Post('/me/upload-avatar') // 'file' = valeur de la variable a envoyer dans le POST
    @UseInterceptors(FileInterceptor('file', uploadOptions))
    async uploadImage(@UploadedFile() file, @Request() req): Promise<any> {
      const user: UserEntity = req.user;
      if (!user)
        throw new NotFoundException('Please try again later')
      if (!file)
        throw new UnsupportedMediaTypeException('Upload: file not valid')
      await this.userService.deleteSimilarFiles(file.filename)
      var filepath = await join('/public/uploads/' + file.filename)
      return await this.userService.updateParams(user.id, { avatar: filepath })
    }
 
    // @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    // @Get('/me/avatar')
    // async findProfileImage(@Res() res, @Request() req): Promise<any> {
    //   const user= this.userService.findById(req.user.id);
    //   if (!user)
    //     throw new NotFoundException('Please try again later')
    //   if (await this.userService.fileExists(req.user.avatar) == false)
    //     throw new NotFoundException('Cannot display avatar - File does not exists')
    //   return res.sendFile(req.user.avatar);
    // }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Post('/me/update-username')
    async updateUsername(@Res() res: Response, @Request() req): Promise<any> {
      const username = req.body.username 
      if (!username)
        throw new NotFoundException('Please try again later')
      if (username.length > 24)
        throw new PayloadTooLargeException('Username too long')
      var check = await this.userService.checkUsernameChars(username)
      if (check == false)
        throw new BadRequestException('Allowed characters : alphanumerical, hyphen and underscore')
      const userEnt: UserEntity = req.user;
      if (!userEnt)
        throw new NotFoundException('Please try again later')
      const userEntfind = this.userService.findById(req.user.id);
      if (!userEntfind)
        throw new NotFoundException('Please try again later')
      if (username != userEnt.username)
      {
        const new_username = await this.userService.usernameAddSuffix(username);
        await this.userService.updateParams(req.user.id, { username: new_username })
      }
      await res.send({ user: await this.userService.findById(req.user.id), access_token: req.cookies['access_token']});
      return res
    }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Get('/me/delete-avatar')
    async deleteAvatar(@Res() res, @Request() req): Promise<any> {
      const user = this.userService.findById(req.user.id);
      if (!user)
        throw new NotFoundException('Please try again later')
      // delete l'avatar
      const avatar_path: string = join(process.cwd(), req.user.avatar)
      if (await this.userService.fileExists(avatar_path) == false)
      {
        if (await this.userService.deleteFile(avatar_path) == false)
          throw new NotFoundException('Please try again later')
      }
      // prepare un nouvel avatar par defaut
      const userEnt: UserEntity = req.user;
      if (!userEnt)
        throw new NotFoundException('Please try again later')
      var defaultfile = await join('/public/avatar_default.png')
      var defaultpath = await join(process.cwd(), 'public/avatar_default.png')
      if (await this.userService.fileExists(defaultpath) == false)
        throw new NotFoundException('Cannot set default avatar - File does not exists')
      // update le user avec l'avatar
      await this.userService.updateParams(userEnt.id, {avatar: defaultfile})
      await res.send({ user: req.user });
      return res
    }

  }