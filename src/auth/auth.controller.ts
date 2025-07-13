import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { IAuthenticatedRequest } from './interfaces/authenticate-request';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserProfileDto } from './dto/user-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: false, // true em produção com HTTPS
    });
    return res.send({ message: 'Logout successful' });
  }

  @Get('callback')
  @UseGuards(AuthGuard('spotify'))
  callback(@Req() req: IAuthenticatedRequest, @Res() res: Response) {
    const user = req.user;

    // Gera JWT
    const token = this.authService.generateJwt(user);

    // Configura cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // true em produção com HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    // Redireciona para o frontend
    return res.send(`<h1>Login successful! Check logs.</h1>`);
  }
}
