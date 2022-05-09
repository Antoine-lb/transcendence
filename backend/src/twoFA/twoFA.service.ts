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
    return authenticator.verify({
      token: twoFACode,
      secret: user.secret
    })
  }

  // SETUP : n'est fait qu'une seule fois
  public async generateTwoFASecret(user: UserEntity) {
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
    return toFileStream(stream, otpauthUrl);
  }

}
