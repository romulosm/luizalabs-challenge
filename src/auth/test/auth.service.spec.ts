import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import Chance from 'chance';

const chance = new Chance();

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock };
  let userService: { findById: jest.Mock; deleteUser: jest.Mock };

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn(),
    };

    userService = {
      findById: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateJwt', () => {
    it('should generate jwt with correct payload', () => {
      const userMock = {
        uuid: chance.guid(),
        spotifyId: chance.guid(),
      };

      const fakeToken = chance.string({ length: 20 });
      jwtService.sign.mockReturnValue(fakeToken);

      const result = service.generateJwt(userMock as any);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userMock.uuid,
        spotifyId: userMock.spotifyId,
      });

      expect(result).toBe(fakeToken);
    });
  });

  describe('logout', () => {
    it('should call findById and deleteUser if user exists', async () => {
      const userId = chance.guid();
      const userMock = { id: chance.guid() };

      userService.findById.mockResolvedValue(userMock);
      userService.deleteUser.mockResolvedValue(undefined);

      await service.logout(userId);

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(userService.deleteUser).toHaveBeenCalledWith(userMock.id);
    });

    it('should not call deleteUser if user does not exist', async () => {
      const userId = chance.guid();

      userService.findById.mockResolvedValue(null);

      await service.logout(userId);

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(userService.deleteUser).not.toHaveBeenCalled();
    });
  });
});
