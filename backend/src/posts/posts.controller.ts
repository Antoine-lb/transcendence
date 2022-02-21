// import {
//     Body,
//     Controller,
//     Post,
//     UseGuards,
//     Req,
//     UseInterceptors,
//     ClassSerializerInterceptor,
//   } from '@nestjs/common';
//   import PostsService from './posts.service';
//   import CreatePostDto from './dto/createPost.dto';
//   import RequestWithUser from '../auth/requestWithUser.interface';
//   import JwtGuard from '../auth/jwt.guard';


//   @Controller('posts')
//   @UseInterceptors(ClassSerializerInterceptor)
//   export default class PostsController {
//     constructor(
//       private readonly postsService: PostsService
//     ) {}
    
//     @Post()
//     @UseGuards(JwtGuard)
//     async createPost(@Body() post: CreatePostDto, @Req() req: RequestWithUser) {
//       return this.postsService.createPost(post, req.user);
//     }
//   }