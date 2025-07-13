import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '../../config.service';

describe('ConfigService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    process.env.HTTP_PORT = '3000';
    process.env.NODE_ENV = 'test';
    process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
    process.env.SPOTIFY_CLIENT_SECRET = 'test-secret';
    process.env.SPOTIFY_REDIRECT_URI = 'http://localhost/callback';
    process.env.SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
    process.env.SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com/api/token';
    process.env.JWT_SECRET = 'jwt-secret';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    const { ConfigService } = await import('../../config.service');

    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    const service = module.get(ConfigService);
    expect(service).toBeDefined();
  });

  it('should initialize envConfig correctly', async () => {
    const { ConfigService } = await import('../../config.service');

    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    const service = module.get(ConfigService);

    expect(service.envConfig.httpPort).toBe(3000);
    expect(service.envConfig.nodeEnv).toBe('test');
    expect(service.envConfig.spotifyClientId).toBe('test-client-id');
    expect(service.envConfig.mongoUri).toBe('mongodb://localhost:27017/testdb');
  });

  it('should throw error if env vars are missing', async () => {
    delete process.env.SPOTIFY_CLIENT_ID;

    const { ConfigService } = await import('../../config.service');

    await expect(
      Test.createTestingModule({
        providers: [ConfigService],
      }).compile(),
    ).rejects.toThrow('Validation failed');
  });

  it('should call dotenv.config when NODE_ENV is not test', async () => {
    process.env.NODE_ENV = 'development';

    jest.resetModules();
    jest.mock('dotenv', () => ({
      config: jest.fn(() => ({})),
    }));

    const { ConfigService } = await import('../../config.service');

    await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    const dotenv = await import('dotenv');
    expect(dotenv.config).toHaveBeenCalled();
  });

  it('should call onModuleInit and log message', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    const moduleRef = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    const service = moduleRef.get<ConfigService>(ConfigService);

    service.onModuleInit();

    const lastCallArg = logSpy.mock.calls[logSpy.mock.calls.length - 1][0];
    expect(lastCallArg).toBe('Env config initialized successfully');

    logSpy.mockRestore();
  });
});
