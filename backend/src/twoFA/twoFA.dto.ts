import { IsNumber, IsString } from "class-validator";

export class TwoFADto {
    // @IsNumber()
    // id: number;
    
    @IsString()
    twoFACode: string;
}