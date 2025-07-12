import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-spotify';
import { ConfigService } from 'src/config/config.service';
import { ISpotifyProfile } from '../interfaces/spotify-profile.interface';

@Injectable()
export class SpotifyStrategy extends PassportStrategy(Strategy, 'spotify') {
  constructor(configService: ConfigService) {
    const clientID = configService.envConfig.spotifyClientId;
    const clientSecret = configService.envConfig.spotifyClientSecret;
    const callbackURL = configService.envConfig.spotifyRedirectUri;
    const oauthUrl = configService.envConfig.spotifyOauthUrl;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Spotify configuration values are missing in .env');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: [
        'user-read-email',
        'user-read-private',
        'playlist-read-private',
        'playlist-modify-private',
        'user-top-read',
      ],
    });

    (this as any)._oauth2.useAuthorizationHeaderforGET(true);

    (this as any).userProfile = (
      accessToken: string,
      done: (err?: Error | null, profile?: any) => void,
    ) => {
      const oauth2: any = (this as any)._oauth2;

      oauth2.get(oauthUrl, accessToken, function (err: any, body: any) {
        if (err) {
          return done(new Error('Failed to fetch user profile'));
        }
        try {
          const json = JSON.parse(body);
          const profile: any = { provider: 'spotify' };
          profile.id = json.id;
          profile.username = json.id;
          profile.displayName = json.display_name;
          profile.profileUrl = json.external_urls?.spotify;
          profile.photos = json.images?.length
            ? json.images.map((img: any) => img.url)
            : [];
          profile.emails = json.email ? [{ value: json.email }] : [];
          profile._raw = body;
          profile._json = json;

          done(null, profile);
        } catch (e) {
          done(e as Error);
        }
      });
    };
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: ISpotifyProfile,
  ) {
    return {
      accessToken,
      refreshToken,
      profile,
    };
  }
}
