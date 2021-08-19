import auth from "../../../auth";
import { AuthModuleConfig } from "../../../auth-config";

const config: AuthModuleConfig = {
  idPortenConfig: {
    wellKnownUrl: "http://localhost:8080/default/",
    clientJwk: [
      {
        use: "sig",
        kty: "RSA",
        kid: "dd210587-274f-4d8f-a1d2-eee624af106a",
        alg: "RS256",
        n: "xmYz-kfrEOr9DgOrvRMGUShUm_-Oe8YBeWc8kGMmA5lt8Tfx9VcYrBmbXxCRzgzDrddgYGZ05FZDE5eJ6f3vN2Q49YAsTvnnvo9tT2YGG17eINqbTx_WF5gPWBVgLVs4qm1mqD9Tty8P2sOaI4eU3HuQx67WMc-TjzzXxjNY-BtyarMsoyRRGK_jA1aGhQmVeORoUa5P3mK-zGAR3ScnecqURQV_KdZy9fQWZdonNYDlYOrQ8mJap4Ky1DBNslIHMn1AWem0oIgSCyGq3Qjzeog2pSYgn9A25xPud97PV8Mua1G6ij4E9Yu-HYHTv_nKsZyXbiDpN1bMwPITsb76Sw",
        e: "AQAB",
        d: "UsA4N9Eda54H1HuVezRfMySWPcbW4CtTXBbCPRsNtPyezbje88zTHp1Dn-AiYIYUbALkUPELGl4cdiSDwpRG3Zyw4T0Hvh0gGuxp1G8iZvInxh5IHzWRL6Ad7khkKCbfOL6Ozegz-7jmbQGe3ejkHx5u4cq7zmTdECZ5fVLXbgwQp_1BW7j-ML6rmAj0FVtLvQ0o614GuyCfTKvRl-NB4kXHTGMYYIzH1ktGA44bUaIuA2YhMN45PejDaRKFkctNivEFqnHrMmpjrcm6D2kLHWUZhINy-1np3GXVyy7du3j8tiswBIaeKW6afAmt8rc8Tw5EaTY1lbYOLF7b7qZqiQ",
        p: "31v4RZIYN7c4eqcWfEaucPGlr5cFYLl0YR5Urzuvf3GsKBoVRUsb8qe6FS4BXwHd5wQ4yiIqXcQhtSULDmDi1gWzsCNfVRPLaQP396TZ0sqPUIfWJrm3jFKyvjplqj9lypwA6GtE-dfRZdA3-Pix9jCynYS5hRDcJb96uHCUSI8",
        q: "42R18VmRl7rvLVVvvH13Ea6eG3ZeZ4FkKJEMZ1NTK98G8qIGDKOYOuFJ4ENpa688KoX56xn8MufpX-PanADbTT_xhPE2ld2BzG-7WbII6ZP1bNjaPZVljaW3tmXLQEntsqLNr7TNUeE2Ls7Fd5Ph14kCcX4XNSMoZe6HgjzKOIU",
        dp: "ZpXDDZDv9ob8NbkQJrv_2nfh9SeTnL0QqppXorPzAsGepDx2kIDSsTw_xwJ-NriQxk22F4BhnPc71ArTbSMqi8nKoZddbaHNxsm_1cmtEZdfA0mgHeEmYBiLZ7tCflLn2YqVECpUX7uzvONJEdyHP99V6erPmkIIGn47SwLJ2Bk",
        dq: "DgK0mahRJi4oanynI8__NCG0MDD85Be-2hkF0J_7sepN_UkqYkD6MjaLXLwKlM35QQ18NpYlSeWsJXJel9odqQbVlMFgAZ_iTXxc6MvlbK7nIkvCNqUr2qxpQ13GRjHH6YfKcJcNR4w-0GeBFzsPYT5Z3jBMscN2y8EErGuechk",
        qi: "nKeyWaxkDYI30Bz39iKxbuKBDFfvo2eEUdo0ok-rX93UE2fAA7ZRt-Ww5lPYCKvHEzXmBn3TuTEVSJARYSD1wvyy623TRbBQLIrHBAGNk0aWJAIC4qH0zfYykSKZrWA-Y2D9Jp4BHkhXgTMN1tkwplYzKNVqW2m1huEuTzy096A",
      },
    ],
    clientId: "foo",
    redirectUri: "http://localhost:3000/api/auth/callback",
  },
  loginServiceUrl: "http://localhost:8080/default/authorize",
  nextPublicBasePath: "",
  redisConfig: undefined,
  selfUrl: "/",
  sessionConfig: {
    cookieMaxAgeMilliSeconds: 3600,
    secret: "bar",
    name: "dp-auth",
    redis: true,
  },
  tokenXConfig: {
    privateJwk: [
      {
        use: "sig",
        kty: "RSA",
        kid: "6d383944-657b-4760-8afb-552f400d08d3",
        alg: "RS256",
        n: "4s21VmGF0awMAqS_kl6xDMsXt4EkN7LDOA09JprIw0696PaQpk6uwW-D_Oq6OG5_fhiSY4tFYQnXCoFh3xXHZ24zNvH7k2WQEbavMYqKeXo1s5UEZgpeS5bvJ59FjZAe6LYfecdID9jpmyoarnhIRuByYOtZP8Ys7Fej8eecEU1uTjqew4saEj8S6rc9uTr0yjAxYeOhKPJzE_RmbrzlQKyQEeNT9YuhIfBX2_oQElBnoqDymsq3sakYmVEg9D1BHpWjy_LIL0UMsz14tLd-12CLQe81TiofLSrJO_TGt6NQ8RN6TxjwdjC2Ee4xDZwf8EzAtnC1hPeNWTMwZOZsaQ",
        e: "AQAB",
        d: "vM7_LSAWpQwTG4hHKvTFc58G6W8K1Ytt1RXAWIj2pRDCLFRG6wwJk2LggAZwbFYgsLqH83KXmUb1y_sVnP-mdsZYwF8GThh4rSZmBloNGT_RwORHOyNaiJboFRYUctsNwDENVvW9WeP75X5Ro_jiQo7K6UBDlkHGWCJFizaCyCsZ-tAgD7-uI-UUdbpwbzSWSkLzcbfPGPGnfL0BlTJ46Pw62qIFba0-2IUNL8-HU6AKUQnandaN_S64laLgtZRMri6V8Do9_QmDeJmzi_fW4kVPIqqFG1yBUe0Xty8R1yd4Y1Cm_e3AQSmTXyzh_90Y4lW9xSvSME0JsNRBwJC1-Q",
        p: "5RuBc4npAhDIipUZow0dVia1NItWkJfdkZeb1y8Va0aEHMFoMBgOj0egtl6vIOLkxgKcRaZ5p2oCPGQuz3UVAoOSldpqw08sHr21oKNh6N7-UIYOQRC76ADnGDCDVWFfSzmir2A0hNw2N9GK8cS--SYVS4HR2ZwuOuXh9nr73hM",
        q: "_Wz484TviQZ8xYbq6bqlw1svjAYWSmGS2z5Bdnj74Vc4BSVFSDjhkORX9M0RKtZO4KMRQwhpq6t4sun-rKMMV9tiO0kduD6vqT7FbxDlaKblqYlyr-lzTHlFkfY_zaHvrTBWGgq2vrwLiG4gZ7zcUno6wrxvYFyYSb4EqihxaxM",
        dp: "5NIe7XVs6eo3UOnvjAD6LuREEPGliI6U9eeU90sIOndYVZv5Yid0yzd_1QUmJlNWqElNKOdHE6T2DLkGY58NV9BvJAncnarCZwWUlJb5n-qv1168d9Gtyt6z8F3rnee9lFVBHaWZbqS95ev7uNKG5jJaDGrhW1T4e0zD7TgRvE8",
        dq: "kL0KOlr0S7hOzqnNxQv63GZZ84kOdhDgRSN7U-SpRvv_XMD6ntMN0Sj5KzFr2qFnj1jS5QwK_icC2nxWHddJl2wO4HlT5gS3Ytwc-uAVhf28MWX1AI8-cLDakRCpRBJ2xt1Sb7EqyiiwFY2AKH9u_hQdN1dT7R81QvipxV0v2c0",
        qi: "rG-R4lGJA5vJ-qvG2yTNqsj1d8c3cw4mJWaG7wNB3JkanaUfzaE2flep9bnUgeG0FHQ2GyLTYJkOePFR2M7VyMeBR9TiGEa3Hc1qyA_3l8JZdhydte1P51nzCgT9PJLO_ewcUXnomi2qKKpBHfJGJT5izIkbskplblUrTAtWAqQ",
      },
    ],
    wellKnownUrl: "http://localhost:8080/default/.well-known",
    clientId: "tokenx",
  },
};
export default auth(config);
