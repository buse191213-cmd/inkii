import { db } from "@/lib/db";
import TeamManager, { type AdminTeamMember } from "./TeamManager";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const rows = await db.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  const members: AdminTeamMember[] = (rows as AdminTeamMember[]).map((r) => ({
    id: r.id,
    department: r.department,
    name: r.name ?? "",
    role: r.role ?? "",
    email: r.email ?? "",
    photoUrl: r.photoUrl ?? "",
    sortOrder: r.sortOrder ?? 0,
  }));
  return <TeamManager members={members} />;
}
