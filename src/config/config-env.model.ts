import { IsEnum, IsNumber, IsPositive, IsString, IsUrl } from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class ConfigEnv {
  @IsString()
  @IsEnum(NodeEnv)
  nodeEnv: NodeEnv;

  @IsNumber()
  @IsPositive()
  httpPort: number;

  @IsString()
  spotifyClientId: string;

  @IsString()
  spotifyClientSecret: string;

  @IsString()
  @IsUrl({ require_tld: false })
  spotifyRedirectUri: string;

  @IsString()
  @IsUrl({ require_tld: false })
  spotifyOauthUrl: string;

  get isProduction(): boolean {
    return this.nodeEnv === NodeEnv.Production;
  }
}
