import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyApiService } from '../spotify-api.service';
import { ConfigService } from 'src/config/config.service';
import { UserService } from 'src/user/user.service';
import axios from 'axios';
import Chance from 'chance';

const chance = new Chance();

jest.mock('axios');

const mockConfigService = {
  envConfig: {
    spotifyApiBaseUrl: 'https://api.spotify.com/v1',
    spotifyAccountsUrl: 'https://accounts.spotify.com/api/token',
    spotifyClientId: 'mock-client-id',
    spotifyClientSecret: 'mock-client-secret',
  },
};

const mockUserService = {
  updateUserTokens: jest.fn(),
};

describe('SpotifyApiService', () => {
  let service: SpotifyApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<SpotifyApiService>(SpotifyApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPlaylist', () => {
    it('should create playlist successfully', async () => {
      const userMock = {
        spotifyId: chance.guid(),
        accessToken: chance.guid(),
      };

      const playlistResponse = { id: chance.guid(), name: chance.word() };
      const postSpy = jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: playlistResponse });

      const result = await service.createPlaylist(
        userMock as any,
        chance.word(),
        chance.sentence(),
        true,
      );

      expect(result).toEqual(playlistResponse);
      expect(postSpy).toHaveBeenCalled();
      postSpy.mockRestore();
    });

    it('should throw error if API call fails', async () => {
      const userMock = {
        spotifyId: chance.guid(),
        accessToken: chance.guid(),
      };

      const postSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValue(new Error('API Error'));

      await expect(
        service.createPlaylist(
          userMock as any,
          chance.word(),
          chance.sentence(),
          false,
        ),
      ).rejects.toThrow('Failed to create playlist on Spotify');

      postSpy.mockRestore();
    });

    it('should create playlist with default description and isPublic', async () => {
      const userMock = {
        spotifyId: chance.guid(),
        accessToken: chance.guid(),
      };

      const playlistResponse = { id: chance.guid(), name: chance.word() };
      const postSpy = jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: playlistResponse });

      const result = await service.createPlaylist(
        userMock as any,
        'My Playlist',
      );

      expect(result).toEqual(playlistResponse);
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userMock.spotifyId}/playlists`),
        expect.objectContaining({
          name: 'My Playlist',
          description: 'Created via API 😎',
          public: false,
        }),
        expect.any(Object),
      );
      postSpy.mockRestore();
    });
  });

  describe('getTopArtists', () => {
    it('should fetch top artists', async () => {
      const userMock = { accessToken: chance.guid() };
      const responseData = { items: [] };

      const getSpy = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: responseData });

      const result = await service.getTopArtists(userMock as any);
      expect(result).toEqual(responseData);
      expect(getSpy).toHaveBeenCalled();
      getSpy.mockRestore();
    });
  });

  describe('getArtistAlbums', () => {
    it('should fetch artist albums', async () => {
      const userMock = { accessToken: chance.guid() };
      const artistId = chance.guid();
      const responseData = { items: [] };

      const getSpy = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: responseData });

      const result = await service.getArtistAlbums(userMock as any, artistId);
      expect(result).toEqual(responseData);
      expect(getSpy).toHaveBeenCalled();
      getSpy.mockRestore();
    });
  });

  describe('getUserPlaylists', () => {
    it('should fetch user playlists', async () => {
      const userMock = { accessToken: chance.guid() };
      const responseData = { items: [] };

      const getSpy = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: responseData });

      const result = await service.getUserPlaylists(userMock as any);
      expect(result).toEqual(responseData);
      expect(getSpy).toHaveBeenCalled();
      getSpy.mockRestore();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token and update user', async () => {
      const userMock = {
        _id: chance.guid(),
        refreshToken: chance.guid(),
      };

      const newAccessToken = chance.guid();
      const newRefreshToken = chance.guid();

      const postSpy = jest.spyOn(axios, 'post').mockResolvedValue({
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      });

      const updatedUser = {
        ...userMock,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
      mockUserService.updateUserTokens.mockResolvedValue(updatedUser);

      const result = await service['refreshAccessToken'](userMock as any);
      expect(result).toEqual(updatedUser);
      expect(postSpy).toHaveBeenCalled();
      postSpy.mockRestore();
    });

    it('should throw error if user not found when updating tokens', async () => {
      const userMock = {
        _id: chance.guid(),
        refreshToken: chance.guid(),
      };

      const postSpy = jest.spyOn(axios, 'post').mockResolvedValue({
        data: {
          access_token: chance.guid(),
        },
      });

      mockUserService.updateUserTokens.mockResolvedValue(null);

      await expect(
        service['refreshAccessToken'](userMock as any),
      ).rejects.toThrow('Could not refresh access token');

      postSpy.mockRestore();
    });
  });

  describe('_getFromSpotify', () => {
    it('should fetch data successfully', async () => {
      const userMock = { accessToken: chance.guid() };
      const url = chance.url();
      const responseData = { items: [] };

      const getSpy = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: responseData });

      const result = await service['__proto__']._getFromSpotify.call(
        service,
        userMock as any,
        url,
        {},
      );
      expect(result).toEqual(responseData);
      getSpy.mockRestore();
    });

    it('should fetch data with default empty params', async () => {
      const userMock = { accessToken: chance.guid() };
      const url = chance.url();
      const responseData = { items: [] };

      const getSpy = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: responseData });

      const result = await (service as any)._getFromSpotify(userMock, url);

      expect(result).toEqual(responseData);
      expect(getSpy).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${userMock.accessToken}` },
          params: {},
        }),
      );

      getSpy.mockRestore();
    });

    it('should refresh token and retry on 401', async () => {
      const userMock = {
        accessToken: chance.guid(),
        refreshToken: chance.guid(),
        _id: chance.guid(),
      };

      const newAccessToken = chance.guid();
      const refreshedUser = { ...userMock, accessToken: newAccessToken };

      const url = chance.url();
      const responseData = { items: [] };

      const getSpy = jest
        .spyOn(axios, 'get')
        .mockRejectedValueOnce({ response: { status: 401 } })
        .mockResolvedValueOnce({ data: responseData });

      jest
        .spyOn(service as any, 'refreshAccessToken')
        .mockResolvedValue(refreshedUser);

      const result = await service['__proto__']._getFromSpotify.call(
        service,
        userMock as any,
        url,
        {},
      );
      expect(result).toEqual(responseData);
      getSpy.mockRestore();
    });

    it('should throw error if other error occurs', async () => {
      const userMock = { accessToken: chance.guid() };
      const url = chance.url();

      const getSpy = jest
        .spyOn(axios, 'get')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        service['__proto__']._getFromSpotify.call(
          service,
          userMock as any,
          url,
          {},
        ),
      ).rejects.toThrow('Failed to fetch data from Spotify');

      getSpy.mockRestore();
    });
  });
});
