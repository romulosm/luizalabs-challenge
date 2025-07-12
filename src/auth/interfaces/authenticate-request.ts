import { ISpotifyProfile } from './spotify-profile.interface';

export interface IAuthenticatedRequest extends Request {
  user: {
    accessToken: string;
    refreshToken: string;
    profile: ISpotifyProfile;
  };
}
