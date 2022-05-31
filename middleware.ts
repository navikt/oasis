import createAuthMiddleware, { azureAd, idporten } from "./lib";

export const provider = process.env.PROVIDER == "azure" ? azureAd : idporten;

const middleware = createAuthMiddleware({
  enforceAuth: true,
  notEnforcedPaths: ["/", "/open", "/oauth2/login"],
  provider,
});

export default middleware;
