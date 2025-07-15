import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../repository/user.repository';
import Chance from 'chance';

const chance = new Chance();

describe('UserService', () => {
  let service: UserService;
  let repository: {
    findBySpotifyId: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findBySpotifyId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreateFromSpotify', () => {
    const profileMock: any = {
      id: chance.guid(),
      displayName: chance.name(),
      emails: [{ value: chance.email() }],
      photos: [chance.url()],
      _json: { raw: 'data' },
    };
    const accessToken = chance.guid();
    const refreshToken = chance.guid();

    it('should create a new user if not found', async () => {
      repository.findBySpotifyId.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        id: chance.guid(),
        spotifyId: profileMock.id,
      });

      const result = await service.findOrCreateFromSpotify(
        profileMock,
        accessToken,
        refreshToken,
      );

      expect(repository.findBySpotifyId).toHaveBeenCalledWith(profileMock.id);
      expect(repository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('spotifyId', profileMock.id);
    });

    it('should update existing user if found', async () => {
      const existingUser = { _id: chance.guid(), spotifyId: profileMock.id };
      repository.findBySpotifyId.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue({
        ...existingUser,
        displayName: profileMock.displayName,
      });

      const result = await service.findOrCreateFromSpotify(
        profileMock,
        accessToken,
        refreshToken,
      );

      expect(repository.findBySpotifyId).toHaveBeenCalledWith(profileMock.id);
      expect(repository.update).toHaveBeenCalledWith(
        existingUser._id.toString(),
        expect.any(Object),
      );
      expect(result).toHaveProperty('spotifyId', profileMock.id);
    });

    it('should create a new user without email and photos', async () => {
      const profileMockNoEmailPhotos: any = {
        id: chance.guid(),
        displayName: chance.name(),
        _json: { raw: 'data' },
      };
      const accessToken = chance.guid();
      const refreshToken = chance.guid();

      repository.findBySpotifyId.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        id: chance.guid(),
        spotifyId: profileMockNoEmailPhotos.id,
        email: '',
        photos: [],
      });

      const result = await service.findOrCreateFromSpotify(
        profileMockNoEmailPhotos,
        accessToken,
        refreshToken,
      );

      expect(repository.findBySpotifyId).toHaveBeenCalledWith(
        profileMockNoEmailPhotos.id,
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: '',
          photos: [],
        }),
      );
      expect(result).toHaveProperty('spotifyId', profileMockNoEmailPhotos.id);
    });

    it('should update existing user without email and photos', async () => {
      const existingUser = { _id: chance.guid(), spotifyId: chance.guid() };
      const profileMockNoEmailPhotos: any = {
        id: existingUser.spotifyId,
        displayName: chance.name(),
        _json: { raw: 'data' },
      };
      const accessToken = chance.guid();
      const refreshToken = chance.guid();

      repository.findBySpotifyId.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue({
        ...existingUser,
        displayName: profileMockNoEmailPhotos.displayName,
        email: '',
        photos: [],
      });

      const result = await service.findOrCreateFromSpotify(
        profileMockNoEmailPhotos,
        accessToken,
        refreshToken,
      );

      expect(repository.findBySpotifyId).toHaveBeenCalledWith(
        existingUser.spotifyId,
      );
      expect(repository.update).toHaveBeenCalledWith(
        existingUser._id.toString(),
        expect.objectContaining({
          email: '',
          photos: [],
        }),
      );
      expect(result).toHaveProperty('spotifyId', existingUser.spotifyId);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const userId = chance.guid();
      const userMock = { _id: userId };
      repository.findById.mockResolvedValue(userMock);

      const result = await service.findById(userId);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userMock);
    });
  });

  describe('updateUserTokens', () => {
    it('should update user tokens', async () => {
      const userId = chance.guid();
      const tokens = {
        accessToken: chance.guid(),
        refreshToken: chance.guid(),
      };
      const updatedUser = { _id: userId, ...tokens };
      repository.update.mockResolvedValue(updatedUser);

      const result = await service.updateUserTokens(userId, tokens);

      expect(repository.update).toHaveBeenCalledWith(userId, tokens);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return deleted user', async () => {
      const userId = chance.guid();
      const deletedUser = { _id: userId };

      repository.delete = jest.fn().mockResolvedValue(deletedUser);

      const result = await service.deleteUser(userId);

      expect(repository.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(deletedUser);
    });
  });
});
