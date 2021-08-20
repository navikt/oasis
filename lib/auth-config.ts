import { ClientOpts } from "redis";
import { JSONWebKey } from "jose";

export interface IdPortenStrategyConfig {
  wellKnownUrl: string;
  clientJwk: JSONWebKey[];
  clientId: string;
  redirectUri: string;
}

export interface TokenXConfig {
  privateJwk: JSONWebKey[];
  wellKnownUrl: string;
  clientId: string;
}

export interface SessionConfig {
  cookieMaxAgeMilliSeconds: number;
  secret: string;
  name: string;
  redis: boolean;
}

export interface AuthModuleConfig {
  loginServiceUrl: string;
  selfUrl: string;
  nextPublicBasePath: string;
  redisConfig: ClientOpts;
  idPortenConfig: IdPortenStrategyConfig;
  tokenXConfig: TokenXConfig;
  sessionConfig: SessionConfig;
}
