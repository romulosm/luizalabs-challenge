import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  generateJwt(user: User) {
    const payload = {
      sub: user.uuid,
      spotifyId: user.spotifyId,
    };
    return this.jwtService.sign(payload);
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (user) {
      await this.userService.deleteUser(user.id);
    }
  }
}
