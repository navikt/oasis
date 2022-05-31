import { GetServerSideProps } from "next";
import { idporten } from "../lib/providers";
import { getSession } from "../lib/server/get-session";

export const getServerSideProps: GetServerSideProps<ClosedPageProps> = async (
  context
) => {
  const session = await getSession(idporten, context);

  return {
    props: { sub: session.user.sub as string },
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
