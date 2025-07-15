import { ConfigService } from 'src/config/config.service';
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { IAuthenticatedRequest } from './interfaces/authenticate-request';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserProfileDto } from './dto/user-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: IAuthenticatedRequest): UserProfileDto {
    const user = req.user;
    return {
      uuid: user.uuid,
      spotifyId: user.spotifyId,
      displayName: user.displayName,
      email: user.email,
      photos: user.photos,
    };
  }

  @Get('login')
  @UseGuards(AuthGuard('spotify'))
  login() {}

  @Post('logout')
  async logout(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Authorization token not provided in header');
    }
    const payload = token.split('.')[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8'),
    );
    if (!decoded || !decoded.sub) {
      throw new Error('Invalid token or payload missing "sub" field');
    }
    return await this.authService.logout(decoded.sub);
  }

  @Get('callback')
  @UseGuards(AuthGuard('spotify'))
  callback(@Req() req: IAuthenticatedRequest, @Res() res: Response) {
    const user = req.user;
    const token = this.authService.generateJwt(user);
    const frontendUrl = `${this.configService.envConfig.frontendUrl}/auth-success?token=${token}`;
    return res.redirect(frontendUrl);
  }
}
