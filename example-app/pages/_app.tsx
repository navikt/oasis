import { AppProps } from "next/app";

if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  //require("../../oasis/src/mocks");
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;