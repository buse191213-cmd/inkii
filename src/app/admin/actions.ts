"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { parsePriceToCents, slugify } from "@/lib/format";
import { HOME_SLOT_IDS } from "@/lib/home-slots";
import { NAV_KEYS, type NavKey, getAllNavItems } from "@/lib/nav";

export type ActionResult = { ok: boolean; error?: string };

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 12 * 1024 * 1024; // 12 MB pro Bild (Handy-Fotos sind oft groß)
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
};

function refreshAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/werbemittel");
}

function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/bereiche");
  revalidatePath("/nachhaltigkeit");
  revalidatePath("/ueber-uns");
  revalidatePath("/admin/homepage");
}

/** Lädt Bilddateien zu Vercel Blob hoch und liefert ihre öffentlichen URLs. */
async function saveUploadedImages(files: File[]): Promise<string[]> {
  // Ohne Blob-Token schlägt put() fehl — klare Meldung statt kryptischer Fehler.
  if (files.length > 0 && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Bild-Upload nicht konfiguriert (BLOB_READ_WRITE_TOKEN fehlt). Bitte in den Vercel-Einstellungen hinterlegen."
    );
  }
  const urls: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue;
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(`„${file.name}" ist zu groß (max. 12 MB pro Bild).`);
    }
    const ext = EXT[file.type] ?? "jpg";
    const name = `products/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}.${ext}`;
    try {
      const blob = await put(name, file, { access: "public" });
      urls.push(blob.url);
    } catch (e) {
      throw new Error(
        `Upload von „${file.name}" fehlgeschlagen: ${e instanceof Error ? e.message : "unbekannter Fehler"}`
      );
    }
  }
  return urls;
}

/** Löscht Bilder aus Vercel Blob (Fehler werden ignoriert). */
async function removeImageFiles(urls: string[]) {
  for (const url of urls) {
    if (!/^https?:\/\//.test(url)) continue;
    try {
      await del(url);
    } catch {
      /* evtl. bereits entfernt – ignorieren */
    }
  }
}

/**
 * Produkt anlegen oder aktualisieren.
 * Bilder werden in der Reihenfolge gespeichert, die das Formular vorgibt –
 * das erste Bild ist das Hauptbild ("Vitrine").
 */
export async function saveProduct(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!code || !name || !categoryId) {
    return { ok: false, error: "Artikelnummer, Name und Kategorie sind Pflichtfelder." };
  }

  // Reihenfolge der Bilder: Tokens "e:<url>" (vorhanden) oder "n" (neue Datei)
  let order: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("imageOrder") ?? "[]"));
    if (Array.isArray(parsed)) order = parsed.map(String);
  } catch {
    order = [];
  }

  // Neue Bilddateien hochladen (in Reihenfolge ihres Auftretens)
  const newFiles = formData
    .getAll("newImages")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .filter((f) => f.type.startsWith("image/"));

  let uploaded: string[] = [];
  try {
    uploaded = await saveUploadedImages(newFiles.slice(0, MAX_IMAGES));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Bild-Upload fehlgeschlagen." };
  }

  // Endgültige, geordnete Bildliste zusammensetzen
  const finalImages: string[] = [];
  let nextNew = 0;
  for (const token of order) {
    if (finalImages.length >= MAX_IMAGES) break;
    if (token.startsWith("e:")) {
      finalImages.push(token.slice(2));
    } else if (token === "n") {
      if (uploaded[nextNew]) finalImages.push(uploaded[nextNew]);
      nextNew++;
    }
  }
  const images = finalImages.join(",");

  // === Renk bazında görseller — her renk için ayrı upload ===
  let colorImagesOrder: Record<string, string[]> = {};
  try {
    const parsed = JSON.parse(String(formData.get("colorImagesOrder") ?? "{}"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed)) {
        if (Array.isArray(v)) {
          colorImagesOrder[k] = (v as unknown[]).map(String);
        }
      }
    }
  } catch { colorImagesOrder = {}; }

  const colorImagesPayload: Record<string, string[]> = {};
  for (const [colorKey, orderArr] of Object.entries(colorImagesOrder)) {
    const colorNewFiles = formData
      .getAll(`colorNewImages__${colorKey}`)
      .filter((f): f is File => f instanceof File && f.size > 0)
      .filter((f) => f.type.startsWith("image/"));

    let colorUploaded: string[] = [];
    try {
      colorUploaded = await saveUploadedImages(colorNewFiles.slice(0, MAX_IMAGES));
    } catch (e) {
      return { ok: false, error: `Farbbilder-Upload fehlgeschlagen für ${colorKey}: ${e instanceof Error ? e.message : "Fehler"}` };
    }

    const finalColorImgs: string[] = [];
    let nextColorNew = 0;
    for (const token of orderArr) {
      if (finalColorImgs.length >= MAX_IMAGES) break;
      if (token.startsWith("e:")) {
        finalColorImgs.push(token.slice(2));
      } else if (token === "n") {
        if (colorUploaded[nextColorNew]) finalColorImgs.push(colorUploaded[nextColorNew]);
        nextColorNew++;
      }
    }
    if (finalColorImgs.length > 0) {
      // Key'i selColors-uyumlu formatta sakla:
      // "hex:name" → hex küçük + name original (case preserved)
      // predefined → tüm lowercase
      let cleanKey: string;
      const trimmed = colorKey.trim();
      if (trimmed.startsWith("#") && trimmed.includes(":")) {
        const [hex, ...nameParts] = trimmed.split(":");
        cleanKey = `${hex.toLowerCase()}:${nameParts.join(":").trim()}`;
      } else {
        cleanKey = trimmed.toLowerCase();
      }
      colorImagesPayload[cleanKey] = finalColorImgs;
    }
  }
  const colorImagesJson = JSON.stringify(colorImagesPayload);

  const data = {
    code,
    name,
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    icon: String(formData.get("icon") ?? "box"),
    priceCents: parsePriceToCents(String(formData.get("price") ?? "")),
    priceTiers: String(formData.get("priceTiers") ?? "[]"),
    sizes: String(formData.get("sizes") ?? "[]"),
    stock: parseInt(String(formData.get("stock") ?? "0"), 10) || 0,
    minOrderQty: Math.max(1, parseInt(String(formData.get("minOrderQty") ?? "1"), 10) || 1),
    recommendedIds: String(formData.get("recommendedIds") ?? ""),
    recommendedLogos: String(formData.get("recommendedLogos") ?? "{}"),
    printAreaType: String(formData.get("printAreaType") ?? "tshirt"),
    customPrintArea: String(formData.get("customPrintArea") ?? ""),
    status: String(formData.get("status") ?? "active"),
    isNew: formData.get("isNew") === "on",
    isEco: formData.get("isEco") === "on",
    isBestseller: formData.get("isBestseller") === "on",
    deliveryDays: Number(formData.get("deliveryDays") ?? 0) || 0,
    colors: String(formData.get("colors") ?? "")
      .split(",")
      .map((c) => {
        const trimmed = c.trim();
        if (!trimmed) return "";
        // "hex:name" formatı için: hex küçük, name korunur
        if (trimmed.includes(":") && trimmed.startsWith("#")) {
          const [hex, ...nameParts] = trimmed.split(":");
          const name = nameParts.join(":").trim();
          return name ? `${hex.toLowerCase()}:${name}` : hex.toLowerCase();
        }
        return trimmed.toLowerCase();
      })
      .filter(Boolean)
      .join(","),
    material: String(formData.get("material") ?? "")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean)
      .join(","),
    images,
    colorImages: colorImagesJson,
    careSymbols: String(formData.get("careSymbols") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .join(","),
    displayOrder: Number(formData.get("displayOrder") ?? 0) || 0,
    cardFit: (() => {
      const v = String(formData.get("cardFit") ?? "cover");
      return ["cover", "contain", "cover-top"].includes(v) ? v : "cover";
    })(),
    cardCrop: (() => {
      const raw = String(formData.get("cardCrop") ?? "").trim();
      if (!raw) return "";
      try {
        const o = JSON.parse(raw);
        if (typeof o === "object" && o) {
          return JSON.stringify({
            zoom: Math.min(3, Math.max(1, Number(o.zoom) || 1)),
            x: Math.min(50, Math.max(-50, Number(o.x) || 0)),
            y: Math.min(50, Math.max(-50, Number(o.y) || 0)),
          });
        }
      } catch {}
      return "";
    })(),
    visiblePages: (() => {
      const raw = String(formData.get("visiblePages") ?? "[]");
      try {
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return "[]";
        const allowed = ["kleidung", "taschen", "werbeartikel"];
        const filtered = arr.filter(
          (x: unknown) => typeof x === "string" && allowed.includes(x)
        );
        return JSON.stringify(filtered);
      } catch {
        return "[]";
      }
    })(),
    categoryId,
  };

  try {
    if (id) {
      // Nicht mehr verwendete Bilder aus dem Speicher entfernen
      const before = await db.product.findUnique({ where: { id } });
      if (before) {
        const old: string[] = before.images
          ? before.images.split(",").filter(Boolean)
          : [];
        const removed = old.filter((u: string) => !finalImages.includes(u));
        await removeImageFiles(removed);
      }
      await db.product.update({ where: { id }, data });
    } else {
      await db.product.create({ data });
    }
    refreshAll();
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("Unique")
        ? "Diese Artikelnummer existiert bereits."
        : "Speichern fehlgeschlagen.";
    return { ok: false, error: msg };
  }
  } catch (outerErr) {
    // Beklenmedik hata (network/Prisma/etc.) — detayı kullanıcıya göster
    console.error("[saveProduct] outer error:", outerErr);
    const detail = outerErr instanceof Error ? outerErr.message : String(outerErr);
    return { ok: false, error: `Beklenmedik Fehler: ${detail.slice(0, 200)}` };
  }
}

/** Produkt löschen (inkl. zugehöriger Bilder). */
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const product = await db.product.findUnique({ where: { id } });
    if (product?.images) {
      await removeImageFiles(product.images.split(",").filter(Boolean));
    }
    await db.product.delete({ where: { id } });
    refreshAll();
    return { ok: true };
  } catch {
    return { ok: false, error: "Löschen fehlgeschlagen." };
  }
}

/** Kategorie anlegen. */
export async function createCategory(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Bitte einen Namen eingeben." };

  const slug = slugify(name) || `kat-${Date.now()}`;

  try {
    const existing = await db.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      return {
        ok: false,
        error: "Eine Kategorie mit diesem Namen existiert bereits.",
      };
    }
    await db.category.create({ data: { name, slug } });
    refreshAll();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Kategorie konnte nicht angelegt werden: ${e.message}`
          : "Kategorie konnte nicht angelegt werden.",
    };
  }
}

/** Kategorie löschen (nur wenn keine Produkte zugeordnet sind). */
export async function deleteCategory(id: string): Promise<ActionResult> {
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return { ok: false, error: "Kategorie enthält noch Produkte." };
  }
  try {
    await db.category.delete({ where: { id } });
    refreshAll();
    return { ok: true };
  } catch {
    return { ok: false, error: "Löschen fehlgeschlagen." };
  }
}

/** Status einer Anfrage ändern. */
export async function updateInquiryStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  try {
    await db.inquiry.update({ where: { id }, data: { status } });
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Status konnte nicht geändert werden." };
  }
}

/** Eine Anfrage komplett löschen. */
export async function deleteInquiry(id: string): Promise<ActionResult> {
  try {
    await db.inquiry.delete({ where: { id } });
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Anfrage konnte nicht gelöscht werden." };
  }
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  try {
    // OrderItem'lar cascade ile otomatik silinir
    await db.order.delete({ where: { id } });
    revalidatePath("/admin/bestellungen");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[deleteOrder]", err);
    return { ok: false, error: "Bestellung konnte nicht gelöscht werden." };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  try {
    // Kunde'ye bağlı Order'lar var — önce onları sil (OrderItem cascade ile gider)
    await db.order.deleteMany({ where: { customerId: id } });
    await db.customer.delete({ where: { id } });
    revalidatePath("/admin/kunden");
    revalidatePath("/admin/bestellungen");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[deleteCustomer]", err);
    return { ok: false, error: "Kunde konnte nicht gelöscht werden." };
  }
}

/**
 * Speichert die URL des Hero-Videos. Die Videodatei selbst wird im Browser
 * direkt zu Vercel Blob hochgeladen (siehe /api/upload), damit auch große
 * Dateien ohne Größenlimit übertragen werden können.
 */
export async function saveHeroVideoUrl(url: string): Promise<ActionResult> {
  if (!/^https?:\/\//.test(url)) {
    return { ok: false, error: "Ungültige Video-URL." };
  }
  try {
    const prev = await db.siteImage.findUnique({ where: { key: "hero-video" } });
    await db.siteImage.upsert({
      where: { key: "hero-video" },
      create: { key: "hero-video", url },
      update: { url },
    });
    if (prev?.url && prev.url !== url) {
      try {
        await del(prev.url);
      } catch {
        /* ignorieren */
      }
    }
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Video konnte nicht gespeichert werden." };
  }
}

/** Hero-Hintergrundvideo wieder entfernen. */
export async function removeHeroVideo(): Promise<ActionResult> {
  try {
    const prev = await db.siteImage.findUnique({ where: { key: "hero-video" } });
    await db.siteImage.deleteMany({ where: { key: "hero-video" } });
    if (prev?.url) {
      try {
        await del(prev.url);
      } catch {
        /* ignorieren */
      }
    }
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Entfernen fehlgeschlagen." };
  }
}

/** INKII MARKETING Hero-Video URL speichern (Vercel Blob). */
export async function saveMarketingVideoUrl(url: string): Promise<ActionResult> {
  if (!/^https?:\/\//.test(url)) {
    return { ok: false, error: "Ungültige Video-URL." };
  }
  try {
    const prev = await db.siteImage.findUnique({ where: { key: "marketing-video" } });
    await db.siteImage.upsert({
      where: { key: "marketing-video" },
      create: { key: "marketing-video", url },
      update: { url },
    });
    if (prev?.url && prev.url !== url) {
      try { await del(prev.url); } catch { /* ignorieren */ }
    }
    revalidatePath("/inkii-marketing");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Video konnte nicht gespeichert werden." };
  }
}

/** INKII MARKETING Hero-Video entfernen. */
export async function removeMarketingVideo(): Promise<ActionResult> {
  try {
    const prev = await db.siteImage.findUnique({ where: { key: "marketing-video" } });
    await db.siteImage.deleteMany({ where: { key: "marketing-video" } });
    if (prev?.url) {
      try { await del(prev.url); } catch { /* ignorieren */ }
    }
    revalidatePath("/inkii-marketing");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Entfernen fehlgeschlagen." };
  }
}

/** Bild für einen Startseiten-/Bereiche-Slot hochladen. */
export async function uploadHomeImage(formData: FormData): Promise<ActionResult> {
  const slot = String(formData.get("slot") ?? "");
  if (!HOME_SLOT_IDS.includes(slot)) {
    return { ok: false, error: "Ungültiger Bildbereich." };
  }
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Bitte ein Bild auswählen." };
  }
  const ext = EXT[file.type];
  if (!ext || ext === "gif") {
    return { ok: false, error: "Nur JPG-, PNG- oder WebP-Bilder werden unterstützt." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: "Bild ist zu groß (max. 4 MB)." };
  }
  try {
    const blob = await put(`home/${slot}-${Date.now()}.${ext}`, file, {
      access: "public",
    });
    const prev = await db.siteImage.findUnique({ where: { key: slot } });
    await db.siteImage.upsert({
      where: { key: slot },
      create: { key: slot, url: blob.url },
      update: { url: blob.url },
    });
    if (prev?.url) {
      try {
        await del(prev.url);
      } catch {
        /* ignorieren */
      }
    }
    refreshPublicPages();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? `Upload fehlgeschlagen: ${e.message}` : "Upload fehlgeschlagen.",
    };
  }
}

/** Bild eines Startseiten-/Bereiche-Slots wieder entfernen. */
export async function removeHomeImage(slot: string): Promise<ActionResult> {
  if (!HOME_SLOT_IDS.includes(slot)) {
    return { ok: false, error: "Ungültiger Bildbereich." };
  }
  try {
    const prev = await db.siteImage.findUnique({ where: { key: slot } });
    await db.siteImage.deleteMany({ where: { key: slot } });
    if (prev?.url) {
      try {
        await del(prev.url);
      } catch {
        /* ignorieren */
      }
    }
    refreshPublicPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Entfernen fehlgeschlagen." };
  }
}

/** Abmelden. */
export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// === Team-Verwaltung ===

/** Team-Mitglied anlegen oder aktualisieren. Optional mit Foto-Upload. */
export async function saveTeamMember(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const nameRaw = String(formData.get("name") ?? "").trim();
  if (!department && !nameRaw) {
    return { ok: false, error: "Bitte mindestens Abteilung oder Name angeben." };
  }
  const data: {
    department: string;
    name: string;
    role: string;
    email: string;
    sortOrder: number;
    photoUrl?: string;
  } = {
    department,
    name: nameRaw,
    role: String(formData.get("role") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };

  // Foto: optional. Wenn Datei mitgeschickt → hochladen, alten Blob löschen.
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, error: "Foto ist zu groß (max. 4 MB)." };
    }
    const ext = EXT[file.type];
    if (!ext) {
      return { ok: false, error: "Nur JPG-, PNG- oder WebP-Fotos werden unterstützt." };
    }
    try {
      const blob = await put(
        `team/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`,
        file,
        { access: "public" }
      );
      data.photoUrl = blob.url;
      // alten Blob entfernen (falls vorhanden)
      if (id) {
        const before = await db.teamMember.findUnique({ where: { id } });
        if (before?.photoUrl) {
          try {
            await del(before.photoUrl);
          } catch {
            /* ignorieren */
          }
        }
      }
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? `Foto-Upload fehlgeschlagen: ${e.message}` : "Foto-Upload fehlgeschlagen.",
      };
    }
  }

  try {
    if (id) {
      await db.teamMember.update({ where: { id }, data });
    } else {
      await db.teamMember.create({ data });
    }
    revalidatePath("/admin/team");
    revalidatePath("/ueber-uns");
    return { ok: true };
  } catch {
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }
}

/** Team-Mitglied löschen (inkl. Foto). */
export async function deleteTeamMember(id: string): Promise<ActionResult> {
  try {
    const m = await db.teamMember.findUnique({ where: { id } });
    if (m?.photoUrl) {
      try {
        await del(m.photoUrl);
      } catch {
        /* ignorieren */
      }
    }
    await db.teamMember.delete({ where: { id } });
    revalidatePath("/admin/team");
    revalidatePath("/ueber-uns");
    return { ok: true };
  } catch {
    return { ok: false, error: "Löschen fehlgeschlagen." };
  }
}

/** Nur das Foto entfernen (Eintrag bleibt). */
export async function removeTeamPhoto(id: string): Promise<ActionResult> {
  try {
    const m = await db.teamMember.findUnique({ where: { id } });
    if (m?.photoUrl) {
      try {
        await del(m.photoUrl);
      } catch {
        /* ignorieren */
      }
    }
    await db.teamMember.update({ where: { id }, data: { photoUrl: "" } });
    revalidatePath("/admin/team");
    revalidatePath("/ueber-uns");
    return { ok: true };
  } catch {
    return { ok: false, error: "Foto konnte nicht entfernt werden." };
  }
}

// === Header-Navigation verwalten ===

function isNavKey(k: string): k is NavKey {
  return (NAV_KEYS as readonly string[]).includes(k);
}

/** Einen Navigationspunkt aktivieren oder deaktivieren. */
export async function toggleNavItem(key: string, active: boolean): Promise<ActionResult> {
  if (!isNavKey(key)) {
    return { ok: false, error: "Unbekannter Navigationsschlüssel." };
  }
  try {
    const existing = await db.navSetting.findUnique({ where: { key } });
    const sortOrder = existing
      ? existing.sortOrder
      : (NAV_KEYS.indexOf(key as NavKey) + 1) * 10;
    await db.navSetting.upsert({
      where: { key },
      update: { active },
      create: { key, active, sortOrder },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }
}

/** Reihenfolge nach oben oder unten verschieben (Swap mit Nachbar). */
export async function moveNavItem(key: string, direction: "up" | "down"): Promise<ActionResult> {
  if (!isNavKey(key)) {
    return { ok: false, error: "Unbekannter Navigationsschlüssel." };
  }
  try {
    const all = await getAllNavItems();
    const idx = all.findIndex((n) => n.key === key);
    if (idx < 0) return { ok: false, error: "Eintrag nicht gefunden." };
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= all.length) {
      return { ok: true }; // schon ganz oben/unten – ignoriert
    }
    const a = all[idx];
    const b = all[swapIdx];
    // Wir schreiben beide Einträge in die DB (upsert).
    await db.navSetting.upsert({
      where: { key: a.key },
      update: { sortOrder: b.sortOrder },
      create: { key: a.key, active: a.active, sortOrder: b.sortOrder },
    });
    await db.navSetting.upsert({
      where: { key: b.key },
      update: { sortOrder: a.sortOrder },
      create: { key: b.key, active: b.active, sortOrder: a.sortOrder },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Verschieben fehlgeschlagen." };
  }
}

// ============================================================
// GALERIE — unsere eigenen Druck-/Design-Arbeiten
// ============================================================

/** Ein oder mehrere Galerie-Bilder hochladen. */
export async function saveGalleryItems(formData: FormData): Promise<ActionResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, error: "Bild-Upload nicht konfiguriert (BLOB_READ_WRITE_TOKEN fehlt)." };
  }
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { ok: false, error: "Bitte mindestens ein Bild auswählen." };
  }

  // Aktuell höchsten sortOrder ermitteln, neue Bilder hinten anhängen.
  let nextSort = 0;
  try {
    const last = await db.galleryItem.findFirst({ orderBy: { sortOrder: "desc" } });
    nextSort = (last?.sortOrder ?? 0) + 10;
  } catch {
    /* leere Tabelle */
  }

  try {
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        return { ok: false, error: `„${file.name}" ist zu groß (max. 12 MB).` };
      }
      const ext = EXT[file.type] ?? "jpg";
      const blob = await put(
        `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`,
        file,
        { access: "public" }
      );
      await db.galleryItem.create({
        data: { imageUrl: blob.url, title: "", sortOrder: nextSort },
      });
      nextSort += 10;
    }
    revalidatePath("/admin/galerie");
    revalidatePath("/galerie");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? `Upload fehlgeschlagen: ${e.message}` : "Upload fehlgeschlagen.",
    };
  }
}

/** Titel eines Galerie-Bildes aktualisieren (optional). */
export async function updateGalleryTitle(id: string, title: string): Promise<ActionResult> {
  try {
    await db.galleryItem.update({ where: { id }, data: { title: title.trim() } });
    revalidatePath("/admin/galerie");
    revalidatePath("/galerie");
    return { ok: true };
  } catch {
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }
}

/** Galerie-Bild löschen (inkl. Blob). */
export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  try {
    const item = await db.galleryItem.findUnique({ where: { id } });
    if (item?.imageUrl) {
      try {
        await del(item.imageUrl);
      } catch {
        /* ignorieren */
      }
    }
    await db.galleryItem.delete({ where: { id } });
    revalidatePath("/admin/galerie");
    revalidatePath("/galerie");
    return { ok: true };
  } catch {
    return { ok: false, error: "Löschen fehlgeschlagen." };
  }
}
