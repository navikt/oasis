import auth from "../../../auth";
import { AuthModuleConfig } from "../../../auth-config";

const config: AuthModuleConfig = {
  idPortenConfig: {
    wellKnownUrl: "http://localhost:8080/default/",
    clientJwk: [
      {
        p: "-ZAT1y0Ln6atNIH2SEeIi6C0FGfmmehRR4071FCeixu-i1LgDg7kRGyjs8zBkb6jF8L6wpFYMNLfmy79siFUCEwUp_rUohcWWp155ug9rLd9RKgzcDvlJqvtKr0J4aRBF0EJ0baFtol7B8S0KcAlo5qZcG-WsMnIKnvrEwK2svc",
        kty: "RSA",
        q: "o05rB3GrtyzAlgpfhUA5Z2rckp17ssCGLg6GB7J_RYoWASwiECW4QA7kwHWLpFQjqHzyujE1tlSl5x2Y18hgz6qx1BuFDHTHWetq2dNo39c66tggCGVDS-9hjSeEKopXJb6ec83Yjj5UiRm4wufRHzp9WvtWg9NX1dfpNq9k8qs",
        d: "QAo70WJElgr7_oHvNPfRSuomPkMA009-vwdRQocOhqiKbXJh9r5hJFzBbapPIqYU4q9qAW3cjE_TmFl1FbMgTlOH3q0r2nkeMC0Ov8Ue56O-DFFbSDbQEW6duwN6f74Q0isl5raCRl9vEie40MoA5p-6t90N-ZOIUtshEIM7Vl1ib5TG5NfAsz6YTiN4ZtynSZZ6ER6AxlVVZ1BIxgMzC8huDvb-BG1NoIQ7xGH1m7ToEMHmMSd1UyzlYUxIiPQnSQTJ5MTXlJgoesiYp7atHkJO9uGgUmmIitHDlpSLeMfSgTodMxnF5Vsd70wapxQEgg2yVcDd4bIbaGUN7tATNQ",
        e: "AQAB",
        use: "sig",
        kid: "hF27-5gzubkJUzM5CBLLtpFMwcveloOP5gg1uDMpDqs",
        qi: "SHH3E4MOhW2oqFujQTxFA8xNEU7qPiwo3YB1d29EtS1F--RARhlIc8Wv2_WHDXv_zvAYxhRjxcoPJLstZ5sdx7ZmGTQ9BvHSq55KZWGpp7cohqFNLlOgNDYcQir5pfayN6htGhnkQSOAYjGtsPaY5xgK4RlVfu1vOAhrQW4zCoI",
        dp: "EJN6TeOHDx6iCIfNVPWzYxrUezp_fZ-Jrof5_lswfKrmGBj0GtrwXH8ezHWAMe8IpC5mO4At7GhFQ-h2H1vJWhe7k4C8mNuRt4kYLLcmSY-SeXn2mLDRwqTOxvTxcBRZ4nKGdXB7Jymwi06MbO1_UoOVR3uR9cIhUnkSnxuiCPc",
        alg: "RS256",
        dq: "sp0ScxHgvng0K-cskpGsN3Cpz7JvmRL5r2YzMjgI_AYMCzw6BW88FtQzXk0ybomYdrAyy3MHTGVJD39PrLN9L6WC2ns_CmCvqanTNGwGSM0fo7y_TG91K5inGbwe0mh86MuUgxShxvJlg46eho8GKyHN-bTs60I8z6dXbHhp8Q",
        n: "nzMu3odJmXi2awKIHLvdB5Qbdyut1QYqsVrJeT1aGgji0dCMYxcPv4BXur3Zf0TaavSJ3AzWUG05Q9aviieKofOShmKWQg-QEap6a2rLNgG-r-400kYX_M1Z6BqzCT2AqGGSlHCdDEzr-4V7OPXjZhLy243SSemCY0GYHNzbIAJ5npAtsIWd1t6JT1dBRh_VLYLNQeLsvKICg-U071D7C0MLQIzhylUMVPEbmQE02LjI8ndPIWdiv0BgA1QCij-XNyq55orl_3zD5XSejgYW_aq_jz9Lat1f78hlVjfvRtrEqmeJBu-5MTMpERh9jyP1tPB2BHtf47sDI4ESRrMI_Q",
      },
    ],
    clientId: "foo",
    redirectUri: "http://localhost:3000/api/auth/callback",
  },
  loginServiceUrl: "http://localhost:3000/api/fake-loginservice",
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
        p: "71RY3oDmH7XvHBxVy7OdF701m7xypvWBfpq_-Mz0kCnSdifH3fOiZOxcO6U2PElt7z3BlK-cKTTzL09Xxjq_jRdkAA8a-p5djc7NRwt2G5AhZW921vE2LowANLGEqsQxlj3dIOnvYfonIDyvg-knDf4vsbAD3xyuN44sFNSqWHs",
        kty: "RSA",
        q: "xdTbp4piccvHIE5ZTht23KiHsqPsKX9Rpqv3xrbls0fWyfHj8SA2I1z06dSlkJRlYvT83BmA01h2lptgocEWFytyfF8QtujGVMO3X3v_BQIC57Y8zjnYU_JLvpouchHrainM6GPve8xREuxlli54zCUbzPHO_MQ3aZXieKmqqrs",
        d: "ZEDfgobfNz505yT-xGJeIMTb5Y0Ln-yjsyk4u7EJyfHAjuYyR4k7eySu2G3ehQK8Imm9KedNCcNjh0QJtI5WUsWAL2akGQIApmZnll5hrIuOF_DVluqDJYMZs-_3UHd-WL30OJ9tWTWv5FKvJAa24t3ltVJGNsgeBf6gSRpmw5jilEyMBGPqqP6Q8BvpN5uZMFnAgnWyTaS4xbsFS5cnUASO8xIlcbkLhsHudZkPLPAWA9HkTrL-cCJ-7_YzvDAphQPU0YC-fhGS0JdM8hYZqHMWjgp5wV6Nb1qLK-1jCIv5VLEn6MRhXJtKFho9HzKMNEiR7LVO_4AlranZa8NiNQ",
        e: "AQAB",
        use: "sig",
        kid: "t5haDpvbFwfv8uwgJYNWV9zlwN4BrKfD0tuIqmJqidY",
        qi: "A6zT-Z8cFcc4BriEnScGd6-kVX1nX3Z_CXCTVM96P0EVEAPp_0QaHqOaEZHqY50a6DoFj1kT-Z5aUBhW5ztP6uUQXAQS2GVAwCNBYrB_rZwAcQSRKsD551m2ToigEk7r9Rvsw3wHde2FYk0MNv5Bbz0Y43elFL_w1V-a5ffvY20",
        dp: "ID_OZdUarUU3viL3UKaYUX2WfrDLBkJou6WgnqcHgXGRQYikvvy4cj8DQqpFf6QpYyaAMkfjlA3lgwd-_WAnNZzkRbnDWegDFTu7n4ok1Rv71A5MBjSkp2sIEBGnndcoE2WsqWW8cwhhQ0_KGs1NDO6mgJwGOYdE1oma2Qe7GIc",
        alg: "RS256",
        dq: "Rqp8M-KYu7Fg1cdm2yGwWa3Rmxw21bPnBLRU86SNdHbq4IQJOi6ZaBRiX8xXv8diV_DPCggKHnRxF-c0o1MHgws___EtVUjc35ZxwCfYtn87bm2IVtoOzh20tMb6ZEDGaMu5qCFagExBgZLzzquW9sUioxiVKXElog-qMBPbJNU",
        n: "uPLnlprfpvjq2NG2x9X92KlK7P1ZcWuQavmxnhwDkSL5q6KlIpuae1tWojdv1tjmdlqFabJS83FTofEPtOIJKOw2I7DmtgAVgZUH-5qfo2UV-4KQzKgXlC7G5f2PFQMKJ7yze0nItErAJWAemkTl1M_NSqYZcgpW6FFjhdTGu36vmV7XNPw4GUu2rLaXJIrE1-ghrY6wxe5AR_aDpKiN74YIkup_0M9lju6eIDtRFBjh0vzCuWnBTdND3ODUq5t07MUEXPk6fMkM1nzg_uo4BD4qFw8Y9qBrWKxJWv7HApjgCh3uQGd_JLlZTGjW6X7FeCOUv_u3RQkI5sWga95P2Q",
      },
    ],
    wellKnownUrl: "http://localhost:8080/default/.well-known",
    clientId: "tokenx",
  },
};
export default auth(config);
