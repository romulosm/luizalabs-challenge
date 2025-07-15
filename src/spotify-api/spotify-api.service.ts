import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from 'src/config/config.service';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { ISpotifyTopArtistsResponse } from './interfaces/spotify-top-artists.interface';
import { ISpotifyArtistAlbumsResponse } from './interfaces/spotify-artists-albums.interface';
import { ISpotifyCreatePlaylistResponse } from './interfaces/spotify-create-playlist.interface';
import { ISpotifyPlaylistResponse } from './interfaces/spotify-playlists.interface';

@Injectable()
export class SpotifyApiService {
  private readonly logger = new Logger(SpotifyApiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async getTopArtists(
    user: User,
    limit = 10,
    offset = 0,
  ): Promise<ISpotifyTopArtistsResponse> {
    const apiBaseUrl = this.configService.envConfig.spotifyApiBaseUrl;
    return this._getFromSpotify(user, `${apiBaseUrl}/me/top/artists`, {
      limit,
      offset,
    });
  }

  async getArtistAlbums(
    user: User,
    artistId: string,
    limit = 10,
    offset = 0,
  ): Promise<ISpotifyArtistAlbumsResponse> {
    const apiBaseUrl = this.configService.envConfig.spotifyApiBaseUrl;
    return this._getFromSpotify(
      user,
      `${apiBaseUrl}/artists/${artistId}/albums`,
      { limit, offset },
    );
  }

  async getUserPlaylists(
    user: User,
    limit = 10,
    offset = 0,
  ): Promise<ISpotifyPlaylistResponse> {
    const apiBaseUrl = this.configService.envConfig.spotifyApiBaseUrl;
    return this._getFromSpotify(user, `${apiBaseUrl}/me/playlists`, {
      limit,
      offset,
    });
  }

  async createPlaylist(
    user: User,
    playlistName: string,
    description = 'Created via API 😎',
    isPublic = false,
  ): Promise<ISpotifyCreatePlaylistResponse> {
    const apiBaseUrl = this.configService.envConfig.spotifyApiBaseUrl;
    const endpoint = `${apiBaseUrl}/users/${user.spotifyId}/playlists`;

    const body = {
      name: playlistName,
      description,
      public: isPublic,
    };

    try {
      const response = await axios.post(endpoint, body, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(
        'Error creating playlist',
        error.response?.data || error,
      );
      throw new Error('Failed to create playlist on Spotify');
    }
  }

  private async refreshAccessToken(user: User): Promise<User> {
    const accountsUrl = this.configService.envConfig.spotifyAccountsUrl;

    const basicAuth = Buffer.from(
      `${this.configService.envConfig.spotifyClientId}:${this.configService.envConfig.spotifyClientSecret}`,
    ).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', user.refreshToken);

    try {
      const response = await axios.post(accountsUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      });

      const newAccessToken = response.data.access_token;

      const updatedUser = await this.userService.updateUserTokens(
        user._id.toString(),
        {
          accessToken: newAccessToken,
          refreshToken: response.data.refresh_token || user.refreshToken,
        },
      );

      if (!updatedUser) {
        throw new Error('User not found when updating tokens');
      }

      return updatedUser;
    } catch (error) {
      this.logger.error(
        'Error refreshing access token',
        error.response?.data || error,
      );
      throw new Error('Could not refresh access token');
    }
  }

  private async _getFromSpotify(user: User, url: string, params: any = {}) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
        params,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        this.logger.warn('Access token expired. Trying to refresh...');
        const updatedUser = await this.refreshAccessToken(user);
        const retryResponse = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${updatedUser.accessToken}`,
          },
          params,
        });
        return retryResponse.data;
      } else {
        this.logger.error(
          'Error fetching data from Spotify',
          error.response?.data || error,
        );
        throw new Error('Failed to fetch data from Spotify');
      }
    }
  }
}
