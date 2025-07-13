import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from './config/config.service';
import { SpotifyApiModule } from './spotify-api/spotify-api.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.envConfig.mongoUri,
      }),
    }),
    AuthModule,
    UserModule,
    SpotifyApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
