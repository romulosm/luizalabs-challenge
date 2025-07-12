import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { IAuthenticatedRequest } from './interfaces/authenticate-request';

@Controller('auth')
export class AuthController {
  @Get('login')
  @UseGuards(AuthGuard('spotify'))
  login() {}

  @Get('callback')
  @UseGuards(AuthGuard('spotify'))
  callback(@Req() req: IAuthenticatedRequest, @Res() res: Response) {
    return res.send(`<h1>Login successful! Check logs.</h1>`);
  }
}
