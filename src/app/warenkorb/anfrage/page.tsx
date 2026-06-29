import SiteShell from "@/components/SiteShell";
import AnfrageClient from "./AnfrageClient";

export const metadata = {
  title: "Angebot anfragen | INKII Works",
};

export default function AnfragePage() {
  return (
    <SiteShell>
      <AnfrageClient />
    </SiteShell>
  );
}
