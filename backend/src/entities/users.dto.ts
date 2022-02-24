import { IsNumber, IsString } from "class-validator";

export class UserDto {
    @IsNumber()
    id: number;

    @IsString()
    username: string;

    @IsString()
    avatar?: string;
}