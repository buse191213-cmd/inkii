import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const categories = [
  { slug: "drinkware", name: "Trinkware" },
  { slug: "office", name: "Schreiben & Büro" },
  { slug: "tech", name: "Technik & Mobil" },
  { slug: "bags", name: "Taschen & Reise" },
  { slug: "tools", name: "Schlüssel & Tools" },
];

const products = [
  { code: "VS-86413", name: "Solar-Powerbank Sun", subtitle: "10.000 mAh mit Solarpanel", icon: "power", priceCents: null, stock: 4002, status: "active", isNew: true, isEco: true, colors: "blau,schwarz", material: "kunststoff", cat: "tech" },
  { code: "VS-86406", name: "Wireless-Charger Mag", subtitle: "Kabelloses Ladepad 15 W", icon: "charger", priceCents: 1290, stock: 7477, status: "active", isNew: false, isEco: true, colors: "weiss,schwarz", material: "kunststoff", cat: "tech" },
  { code: "VS-86420", name: "Powerbank Slim", subtitle: "5.000 mAh im Flachformat", icon: "power", priceCents: 990, stock: 16821, status: "active", isNew: false, isEco: false, colors: "schwarz,navy,rot", material: "kunststoff,aluminium", cat: "tech" },
  { code: "VS-86601", name: "USB-Stick Twist", subtitle: "Datenspeicher 16 GB", icon: "usb", priceCents: 420, stock: 9300, status: "active", isNew: false, isEco: false, colors: "silber,schwarz", material: "metall,kunststoff", cat: "tech" },
  { code: "VS-50112", name: "Trinkflasche Steel", subtitle: "Edelstahl, isoliert, 500 ml", icon: "bottle", priceCents: 690, stock: 12140, status: "active", isNew: false, isEco: true, colors: "silber,schwarz,blau", material: "edelstahl", cat: "drinkware" },
  { code: "VS-50230", name: "Keramik-Tasse Classic", subtitle: "Werbetasse 300 ml", icon: "mug", priceCents: 280, stock: 21400, status: "active", isNew: false, isEco: false, colors: "weiss,schwarz,rot", material: "keramik", cat: "drinkware" },
  { code: "VS-50244", name: "Bambus-Becher Eco", subtitle: "Coffee-to-go aus Bambus", icon: "mug", priceCents: null, stock: 5860, status: "draft", isNew: true, isEco: true, colors: "natur,gruen", material: "bambus", cat: "drinkware" },
  { code: "VS-22018", name: "Kugelschreiber Metal", subtitle: "Metallkuli mit Soft-Touch", icon: "pen", priceCents: 79, stock: 54000, status: "active", isNew: false, isEco: false, colors: "silber,blau,schwarz", material: "metall", cat: "office" },
  { code: "VS-22090", name: "Notizbuch A5 Hard", subtitle: "Hardcover mit Gummiband", icon: "note", priceCents: 350, stock: 8770, status: "active", isNew: false, isEco: false, colors: "schwarz,navy,gruen", material: "papier", cat: "office" },
  { code: "VS-44310", name: "Baumwolltasche Tote", subtitle: "Stoffbeutel aus Baumwolle", icon: "bag", priceCents: 190, stock: 33500, status: "active", isNew: false, isEco: true, colors: "natur,schwarz", material: "baumwolle", cat: "bags" },
  { code: "VS-44120", name: "Regenschirm Storm", subtitle: "Stockschirm, sturmsicher", icon: "umbrella", priceCents: 750, stock: 6210, status: "draft", isNew: false, isEco: false, colors: "schwarz,navy,rot", material: "polyester,metall", cat: "bags" },
  { code: "VS-71044", name: "Schlüsselanhänger Tag", subtitle: "Metallanhänger mit Gravur", icon: "key", priceCents: 95, stock: 47900, status: "active", isNew: true, isEco: false, colors: "silber,schwarz", material: "metall", cat: "tools" },
];

const inquiries = [
  { name: "Markus Berger", email: "m.berger@tsv-lindenau.de", company: "TSV Lindenau e.V.", phone: "0151 1234567", subject: "Trikotsatz für 22 Spieler", message: "Wir benötigen einen kompletten Trikotsatz inkl. Nummern und Sponsorenlogo.", status: "new" },
  { name: "Sandra Klein", email: "s.klein@klein-elektro.de", company: "Klein Elektro GmbH", phone: "", subject: "Arbeitskleidung mit Logo-Stick", message: "Für 14 Mitarbeiter Polos und Softshell-Jacken mit gesticktem Logo.", status: "new" },
  { name: "Tobias Walter", email: "t.walter@walterbau.de", company: "Walter Bau", phone: "0170 7654321", subject: "500 Powerbanks als Kundengeschenk", message: "Angebot über 500 Powerbanks mit Gravur erbeten.", status: "progress" },
  { name: "Eva Hoffmann", email: "hoffmann@stadtfest-musterstadt.de", company: "Stadtfest Musterstadt", phone: "", subject: "Werbeartikel für Eventstand", message: "Streuartikel-Mix für ca. 2.000 Besucher gesucht.", status: "progress" },
  { name: "Daniel Krause", email: "d.krause@krause-consulting.de", company: "Krause Consulting", phone: "", subject: "Notizbücher A5 mit Prägung", message: "100 Notizbücher mit Blindprägung des Firmenlogos.", status: "done" },
];

async function main() {
  console.log("Seeding…");
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.inquiry.deleteMany();

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await db.category.create({ data: { slug: c.slug, name: c.name } });
    catMap[c.slug] = created.id;
  }

  for (const p of products) {
    await db.product.create({
      data: {
        code: p.code,
        name: p.name,
        subtitle: p.subtitle,
        icon: p.icon,
        priceCents: p.priceCents,
        stock: p.stock,
        status: p.status,
        isNew: p.isNew,
        isEco: p.isEco,
        colors: p.colors,
        material: p.material,
        categoryId: catMap[p.cat],
      },
    });
  }

  for (const i of inquiries) {
    await db.inquiry.create({ data: i });
  }

  console.log(`Seed fertig: ${categories.length} Kategorien, ${products.length} Produkte, ${inquiries.length} Anfragen.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
