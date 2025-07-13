import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwt(user: User) {
    const payload = {
      sub: user.uuid,
      spotifyId: user.spotifyId,
    };
    return this.jwtService.sign(payload);
  }
}
