import { useSession } from "../auth/react/session.hook";

export default function Index() {
  const { session } = useSession();

  if (!session) return <p>Du er ikke innlogget</p>;

  return <p>Tada! Nå er du innlogget</p>;
}
