import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import Chance from 'chance';

const chance = new Chance();

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: JwtService, useValue: jwtService }],
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
});
