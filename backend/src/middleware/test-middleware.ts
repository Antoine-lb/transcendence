import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class testMiddleware implements NestMiddleware {

    constructor() {}

    async use(req: Request, res: Response, next: NextFunction)
    {
        res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Request-With, Set-Cookie, Cookie, Bearer, Authorization');
        next();
    }
}