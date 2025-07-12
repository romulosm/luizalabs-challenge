import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SpotifyStrategy } from './strategies/spotify.strategy';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [SpotifyStrategy],
})
export class AuthModule {}
