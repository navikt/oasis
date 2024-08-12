export {
  requestOboToken,
  requestAzureOboToken,
  requestTokenxOboToken,
} from "./obo";
export {
  requestAzureClientCredentialsToken,
} from "./client-credentials"
// To keep the API stable after OboResult was renamed to TokenResult
// can be removed in a potential major version bump in the future
export { TokenResult as OboResult } from "./token-result";
export {
  validateToken,
  validateAzureToken,
  validateIdportenToken,
  validateTokenxToken,
  ValidationResult,
} from "./validate";
export {
  parseAzureUserToken,
  parseIdportenToken,
  ParseResult,
} from "./parse-token";
export { getToken } from "./get-token";
export { expiresIn } from "./expires-in";
export { TokenResult } from "./token-result";
