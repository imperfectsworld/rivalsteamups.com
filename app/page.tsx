import Home from "./HomeClient";
import { getVoteRows, groupVoteRows } from "./vote-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Page() {
  const initialVotes = groupVoteRows(await getVoteRows());
  return <Home initialVotes={initialVotes} />;
}
