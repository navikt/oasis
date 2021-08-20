export { useSession } from "./session.hook";

/*export const withAuthMiddleware =
  (config: AuthModuleConfig) =>
  (handler: NextApiHandler): NextConnect<NextApiRequest, NextApiResponse> => {
    return nc()
      .use((req: ConfiguredRequest, res, next) => {
        req.options = config;
        return next();
      })
      .use(middleware)
      .use(handler);
  };
*/
