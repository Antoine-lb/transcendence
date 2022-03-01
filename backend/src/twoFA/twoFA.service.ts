import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserEntity } from '../entities/users.entity';
import { UsersService } from '../users/users.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFAService {
  constructor (
    private readonly usersService: UsersService
  ) {}

  public isTwoFACodeValid(twoFACode: string, user: UserEntity) {
    console.log("[2fa] >>> code checking ");
    console.log("[twoFACode] >>>", twoFACode);
    console.log("[user] >>>", user);
    return authenticator.verify({
      token: twoFACode,
      secret: user.secret
    })
  }

  // SETUP : n'est fait qu'une seule fois
  public async generateTwoFASecret(user: UserEntity) {
    console.log("[2fa] >>> generate secret ");
    console.log("[user] >>> " + user);
    // génère un secret (clé publique) pour l'utilisateur
    const secret = authenticator.generateSecret();
    // crée une URL unique que G.Auth utilisera
    const otpauthUrl = authenticator.keyuri(user.username, "transcendance", secret); // TODO = A AUTOMATISER
    // sauvegarde le secret dans la base de données
    await this.usersService.setTwoFASecret(secret, user.id);
 
    return {
      secret,
      otpauthUrl
    }
  }

// SETUP : n'est fait qu'une seule fois
// transforme l'URL en QRCode
  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    console.log("[2fa] >>> create qrcode ");
    return toFileStream(stream, otpauthUrl);
  }

}
