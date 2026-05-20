import { db } from "@/lib/db";
import AdminNav from "./AdminNav";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const openInquiries = await db.inquiry.count({
    where: { status: { not: "done" } },
  });

  return (
    <div className="shell">
      <AdminNav inquiryCount={openInquiries} />
      <div className="admin-body">
        <div className="topbar">
          <div className="topbar-left">
            <h1>INKII Admin</h1>
          </div>
          <div className="tb-right">
            <a className="btn-ghost btn-sm" href="/" target="_blank" rel="noreferrer">
              Website ansehen ↗
            </a>
            <form action={logout}>
              <button className="btn-ghost btn-sm" type="submit">
                Abmelden
              </button>
            </form>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
