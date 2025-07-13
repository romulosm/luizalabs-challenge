import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { validateSync } from 'class-validator';
import { ConfigEnv, NodeEnv } from './config-env.model';

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly logger = new Logger(ConfigService.name);

  readonly envConfig: ConfigEnv;

  constructor() {
    if (process.env.NODE_ENV !== NodeEnv.Test) {
      dotenv.config();
    }
    try {
      this.envConfig = this.validateInput(process.env);
    } catch (err) {
      this.logger.error(err.toString());
      throw err;
    }
  }

  onModuleInit() {
    this.logger.log('Env config initialized successfully');
  }

  protected initEnvConfig(config: NodeJS.ProcessEnv): ConfigEnv {
    const envConfig = new ConfigEnv();
    envConfig.httpPort = parseInt(config.HTTP_PORT as string, 10);
    envConfig.nodeEnv = config.NODE_ENV as NodeEnv;
    envConfig.spotifyClientId = config.SPOTIFY_CLIENT_ID as string;
    envConfig.spotifyClientSecret = config.SPOTIFY_CLIENT_SECRET as string;
    envConfig.spotifyRedirectUri = config.SPOTIFY_REDIRECT_URI as string;
    envConfig.spotifyApiBaseUrl = config.SPOTIFY_API_BASE_URL as string;
    envConfig.spotifyAccountsUrl = config.SPOTIFY_ACCOUNTS_URL as string;
    envConfig.jwtSecret = config.JWT_SECRET as string;
    envConfig.mongoUri = config.MONGODB_URI as string;

    return envConfig;
  }
  private validateInput(config: NodeJS.ProcessEnv): ConfigEnv {
    const envConfig = this.initEnvConfig(config);
    const errors = validateSync(envConfig);
    if (errors.length) {
      const message = JSON.stringify(errors);
      throw new Error(`Validation failed: ${message}`);
    }
    return envConfig;
  }
}
