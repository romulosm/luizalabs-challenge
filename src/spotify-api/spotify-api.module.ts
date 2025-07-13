import { Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';
import { SpotifyApiController } from './spotify-api.controller';
import { ConfigModule } from 'src/config/config.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ConfigModule, UserModule],
  providers: [SpotifyApiService],
  controllers: [SpotifyApiController],
})
export class SpotifyApiModule {}
