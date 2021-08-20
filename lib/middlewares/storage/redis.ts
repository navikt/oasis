import { createClient, ClientOpts } from "redis";

const client = (redisOptions?: ClientOpts) => {
  const client = createClient(redisOptions);
  client.unref();
  client.on("error", console.error);

  return client;
};

export default client;
