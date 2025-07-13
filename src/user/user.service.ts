import { Injectable } from '@nestjs/common';
import { ISpotifyProfile } from '../auth/interfaces/spotify-profile.interface';
import { UserRepository } from './repository/user.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOrCreateFromSpotify(
    profile: ISpotifyProfile,
    accessToken: string,
    refreshToken: string,
  ) {
    let user = await this.userRepository.findBySpotifyId(profile.id);

    if (!user) {
      user = await this.userRepository.create({
        spotifyId: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value || '',
        photos: profile.photos || [],
        accessToken,
        refreshToken,
        profileJson: profile._json,
      });
    } else {
      user = await this.userRepository.update(user._id.toString(), {
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value || '',
        photos: profile.photos || [],
        accessToken,
        refreshToken,
        profileJson: profile._json,
      });
    }

    return user;
  }

  async findById(userId: string) {
    return this.userRepository.findById(userId);
  }

  async updateUserTokens(userId: string, tokens: Partial<User>) {
    return await this.userRepository.update(userId, tokens);
  }
}
