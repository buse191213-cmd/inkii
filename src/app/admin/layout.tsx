export const metadata = {
  title: "INKII — Admin",
};

/** Setzt den .adm-Stilbereich für alle Admin-Seiten. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="adm">{children}</div>;
}
