import { ClientOpts } from "redis";

export interface IdPortenStrategyConfig {
    wellKnownUrl: string;
    clientJwk: string;
    clientId: string;
    redirectUri: string;
}

export interface TokenXConfig {
    privateJwk: string;
    wellKnownUrl: string;
    clientId: string;
};

export interface SessionConfig {
    cookieMaxAgeMilliSeconds: number;
    secret: string;
    name: string;
    redis: string;
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