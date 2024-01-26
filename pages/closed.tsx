import { GetServerSideProps } from "next";
import { decodeJwt } from "../lib";
import { getSession } from "../lib/provider";

export const getServerSideProps: GetServerSideProps<ClosedPageProps> = async (
  context,
) => {
  const session = await getSession()(context.req);

  if (!session)
    return {
      redirect: {
        destination: "/oauth2/login",
        permanent: false,
      },
    };

  const payload = decodeJwt(session.token);
  return {
    props: { sub: payload.sub as string },
  };
};

interface ClosedPageProps {
  sub: string;
}

export default function ClosedPage({ sub }: ClosedPageProps) {
  return (
    <>
      <h1>This page is closed</h1>
      <p>Session is authenticated with sub: {sub}</p>
    </>
  );
}
