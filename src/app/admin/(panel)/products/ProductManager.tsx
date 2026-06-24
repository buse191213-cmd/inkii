"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductIcon } from "@/lib/icons";
import { formatPrice, centsToInput, formatNumber } from "@/lib/format";
import { PRODUCT_COLORS, PRODUCT_MATERIALS, colorLabel, colorHex } from "@/lib/catalog-options";
import { saveProduct, deleteProduct } from "@/app/admin/actions";
import { parsePriceTiers, stringifyPriceTiers, type PriceTier } from "@/lib/price-tiers";
import { parseSizesField, stringifySizesFromDrafts } from "@/lib/sizes";
import RichEditor from "@/components/admin/RichEditor";

export type AdminProduct = {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  priceCents: number | null;
  priceTiers: string;
  sizes: string;
  stock: number;
  status: string;
  isNew: boolean;
  isEco: boolean;
  colors: string;
  material: string;
  images: string;
  colorImages?: string; // JSON: { "weiß": ["url1","url2"], ... }
  visiblePages: string[]; // ["kleidung","werbeartikel"] vs.
  categoryId: string;
  categoryName: string;
  createdAt?: string;
};

export type AdminCategory = { id: string; name: string };

/** Ein Bild im Editor: entweder bereits gespeichert (url) oder neu (file). */
type ImgItem = { key: string; url?: string; file?: File; preview: string };

const MAX_IMAGES = 15;

const EMPTY: AdminProduct = {
  id: "", code: "INKI-", name: "", subtitle: "", description: "", icon: "box",
  priceCents: null, priceTiers: "[]", sizes: "[]", stock: 0, status: "active",
  isNew: false, isEco: false,
  colors: "", material: "", images: "", colorImages: "{}", visiblePages: [], categoryId: "", categoryName: "",
};

const SORTS = [
  { key: "newest", label: "Neueste zuerst" },
  { key: "oldest", label: "Älteste zuerst" },
  { key: "name-asc", label: "Name A–Z" },
  { key: "name-desc", label: "Name Z–A" },
  { key: "stock-desc", label: "Lagerbestand: hoch → niedrig" },
  { key: "stock-asc", label: "Lagerbestand: niedrig → hoch" },
  { key: "price-desc", label: "Preis: hoch → niedrig" },
  { key: "price-asc", label: "Preis: niedrig → hoch" },
];

function splitImages(s: string): string[] {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

function splitCsv(s: string): string[] {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

/** Kürzt einen Text auf max. n Zeichen und ergänzt … */
function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

export default function ProductManager({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [modal, setModal] = useState<AdminProduct | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<ImgItem[]>([]);
  // Renk bazında ayrı görsel listesi: { "weiß": [ImgItem,...], "schwarz": [...] }
  const [colorImages, setColorImagesState] = useState<Record<string, ImgItem[]>>({});
  const [selColors, setSelColors] = useState<string[]>([]);
  const [selMaterials, setSelMaterials] = useState<string[]>([]);
  const [matInput, setMatInput] = useState("");
  type TierDraft = { qtyText: string; priceText: string };
  const [tiers, setTiers] = useState<TierDraft[]>([]);
  const [sizes, setSizes] = useState<Array<{ nameText: string; extraText: string }>>([]);
  const [customColor, setCustomColor] = useState("#3f9c5c");
  const [customColorName, setCustomColorName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = products.filter(
      (p) =>
        (filter === "all" || p.status === filter) &&
        (!q || (p.name + p.code).toLowerCase().includes(q))
    );
    const sorted = [...filtered];
    const byName = (a: AdminProduct, b: AdminProduct) =>
      a.name.localeCompare(b.name, "de");
    const byStock = (a: AdminProduct, b: AdminProduct) => a.stock - b.stock;
    const byPrice = (a: AdminProduct, b: AdminProduct) =>
      (a.priceCents ?? -1) - (b.priceCents ?? -1);
    switch (sort) {
      case "oldest":
        sorted.reverse();
        break;
      case "name-asc":
        sorted.sort(byName);
        break;
      case "name-desc":
        sorted.sort((a, b) => byName(b, a));
        break;
      case "stock-asc":
        sorted.sort(byStock);
        break;
      case "stock-desc":
        sorted.sort((a, b) => byStock(b, a));
        break;
      case "price-asc":
        sorted.sort(byPrice);
        break;
      case "price-desc":
        sorted.sort((a, b) => byPrice(b, a));
        break;
      // "newest" – Standard, bereits per createdAt desc geladen
    }
    return sorted;
  }, [products, filter, search, sort]);

  function revokeAll(items: ImgItem[]) {
    items.forEach((it) => it.file && URL.revokeObjectURL(it.preview));
  }

  // Esnek key matching helper
  function findExistingColorKey(targetKey: string): string {
    const norm = (s: string) => s.toLowerCase().trim();
    const tk = norm(targetKey);
    return Object.keys(colorImages).find((k) => norm(k) === tk) || targetKey;
  }

  // Bir renge yeni görseller ekle
  function addColorImages(colorKey: string, files: File[]) {
    const useKey = findExistingColorKey(colorKey);
    const newItems: ImgItem[] = files.map((file, i) => ({
      key: `nc-${useKey}-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setColorImagesState((prev) => ({
      ...prev,
      [useKey]: [...(prev[useKey] || []), ...newItems],
    }));
  }

  // Renkten bir görseli sil
  function removeColorImage(colorKey: string, idx: number) {
    const useKey = findExistingColorKey(colorKey);
    setColorImagesState((prev) => {
      const cur = prev[useKey] || [];
      if (cur[idx]?.file) URL.revokeObjectURL(cur[idx].preview);
      return { ...prev, [useKey]: cur.filter((_, i) => i !== idx) };
    });
  }

  // === TASLAK (Draft) Sistemi - localStorage ===
  const DRAFT_KEY = "inkii_product_draft_v1";

  // Modal değiştiğinde her seferinde taslağı kaydet (sadece yeni ürün için)
  useEffect(() => {
    if (!modal || modal.id) return; // Sadece yeni ürün için draft
    if (typeof window === "undefined") return;
    try {
      const draft = {
        modal,
        selColors,
        selMaterials,
        tiers,
        sizes,
        // Sadece URL'li görseller (file'lar localStorage'a sığmaz)
        imageUrls: images.filter((i) => i.url).map((i) => i.url),
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch { /* localStorage dolu veya disabled */ }
  }, [modal, selColors, selMaterials, tiers, sizes, images]);

  function hasDraft(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return !!(raw && JSON.parse(raw).modal);
    } catch { return false; }
  }

  function loadDraft(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      if (!draft.modal) return false;
      setModal(draft.modal);
      setSelColors(draft.selColors || []);
      setSelMaterials(draft.selMaterials || []);
      setTiers(draft.tiers || []);
      setSizes(draft.sizes || []);
      // Görseller: URL'leri restore et (file'lar yeniden seçilmeli)
      if (Array.isArray(draft.imageUrls)) {
        setImages(draft.imageUrls.map((url: string, i: number) => ({
          key: `restored-${i}-${url}`, url, preview: url,
        })));
      }
      return true;
    } catch { return false; }
  }

  function clearDraft() {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ok */ }
  }

  function openNew() {
    setError("");
    revokeAll(images);
    Object.values(colorImages).forEach(revokeAll);
    // Taslak varsa kullanıcıya sor
    if (hasDraft() && confirm("Es gibt einen gespeicherten Entwurf. Möchten Sie ihn fortsetzen?\n\n(OK = Entwurf laden, Abbrechen = Neues Produkt)")) {
      if (loadDraft()) return;
    } else {
      clearDraft();
    }
    setImages([]);
    setColorImagesState({});
    setSelColors([]);
    setSelMaterials([]);
    setTiers([]);
    setSizes([]);
    setModal({ ...EMPTY, categoryId: categories[0]?.id ?? "" });
  }
  function openEdit(p: AdminProduct) {
    setError("");
    revokeAll(images);
    Object.values(colorImages).forEach(revokeAll);
    setImages(
      splitImages(p.images).map((url, i) => ({ key: `e${i}-${url}`, url, preview: url }))
    );
    // colorImages JSON parse
    try {
      const obj = JSON.parse(p.colorImages || "{}");
      const state: Record<string, ImgItem[]> = {};
      if (obj && typeof obj === "object") {
        for (const [k, v] of Object.entries(obj)) {
          if (Array.isArray(v)) {
            // Sadece GEÇERLİ URL'leri yükle - eski dosya-adı-only kayıtlarını otomatik filtrele
            const validUrls = (v as string[])
              .filter((u) => typeof u === "string" && u.length > 0)
              .filter((u) => u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/"));
            if (validUrls.length > 0) {
              state[k] = validUrls.map((url, i) => ({ key: `ec-${k}-${i}-${url}`, url, preview: url }));
            }
          }
        }
      }
      setColorImagesState(state);
    } catch { setColorImagesState({}); }
    setSelColors(splitCsv(p.colors));
    setSelMaterials(splitCsv(p.material));
    setTiers(
      parsePriceTiers(p.priceTiers).map((t) => ({
        qtyText: String(t.qty),
        priceText: (t.cents / 100).toFixed(2).replace(".", ","),
      }))
    );
    setSizes(parseSizesField(p.sizes ?? "[]"));
    setModal({ ...p });
  }

  function toggleColor(k: string) {
    setSelColors((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  }
  function toggleMaterial(k: string) {
    setSelMaterials((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  }
  function closeModal() {
    revokeAll(images);
    setImages([]);
    setModal(null);
  }

  function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((cur) => {
      const free = MAX_IMAGES - cur.length;
      const add = picked.slice(0, free).map((file, i) => ({
        key: `n${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...cur, ...add];
    });
    if (fileInput.current) fileInput.current.value = "";
  }
  function removeImage(i: number) {
    setImages((cur) => {
      const copy = [...cur];
      const [gone] = copy.splice(i, 1);
      if (gone?.file) URL.revokeObjectURL(gone.preview);
      return copy;
    });
  }
  function makeMain(i: number) {
    setImages((cur) => {
      if (i <= 0 || i >= cur.length) return cur;
      const copy = [...cur];
      const [picked] = copy.splice(i, 1);
      copy.unshift(picked);
      return copy;
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    // Reihenfolge der Bilder als Tokens übergeben
    const order: string[] = [];
    images.forEach((img) => {
      if (img.url) {
        order.push("e:" + img.url);
      } else if (img.file) {
        order.push("n");
        fd.append("newImages", img.file);
      }
    });
    fd.set("imageOrder", JSON.stringify(order));
    fd.set("colors", selColors.join(","));
    fd.set("material", selMaterials.join(","));

    // Renk bazında görseller - her renk için ayrı upload + sıralama
    const colorImagesOrder: Record<string, string[]> = {};
    for (const [colorKey, items] of Object.entries(colorImages)) {
      if (!items || items.length === 0) continue;
      const ord: string[] = [];
      items.forEach((img) => {
        if (img.url) {
          ord.push("e:" + img.url);
        } else if (img.file) {
          ord.push("n");
          // Her renk için ayrı field key — server bunu parse edecek
          fd.append(`colorNewImages__${colorKey}`, img.file);
        }
      });
      if (ord.length > 0) colorImagesOrder[colorKey] = ord;
    }
    fd.set("colorImagesOrder", JSON.stringify(colorImagesOrder));

    // Mengenstaffel: aus den Roh-Texten in [{qty,cents}] umwandeln
    const parsedTiers: PriceTier[] = tiers
      .map((d) => {
        const qty = parseInt(d.qtyText, 10) || 0;
        const euro = parseFloat(d.priceText.replace(",", ".")) || 0;
        return { qty, cents: Math.round(euro * 100) };
      })
      .filter((t) => t.qty > 0 && t.cents > 0);
    fd.set("priceTiers", stringifyPriceTiers(parsedTiers));

    // Größen
    fd.set("sizes", stringifySizesFromDrafts(sizes));

    // visiblePages: alle gleichnamigen Felder einsammeln und als JSON serialisieren
    const checkedPages = fd.getAll("visiblePages").filter((v): v is string => typeof v === "string");
    fd.delete("visiblePages");
    fd.set("visiblePages", JSON.stringify(checkedPages));

    const res = await saveProduct(fd);
    setBusy(false);
    if (res.ok) {
      clearDraft(); // Başarılı kayıt → taslak temizle
      closeModal();
      router.refresh();
    } else {
      setError(res.error ?? "Fehler beim Speichern.");
    }
  }

  async function handleDelete(p: AdminProduct) {
    if (!confirm(`„${p.name}" wirklich löschen?`)) return;
    const res = await deleteProduct(p.id);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Löschen fehlgeschlagen.");
  }

  return (
    <>
      <p className="crumb">
        Admin <b>/ Produkte</b>
      </p>

      <div className="toolbar">
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div className="filter-tabs">
            {[
              ["all", "Alle"],
              ["active", "Aktiv"],
              ["draft", "Entwurf"],
            ].map(([k, label]) => (
              <button
                key={k}
                className={filter === k ? "active" : ""}
                onClick={() => setFilter(k)}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            className="status-select"
            style={{ minWidth: 200 }}
            type="text"
            placeholder="Produkt suchen …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="status-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            title="Sortierung"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Neues Produkt
        </button>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategorie</th>
                <th>Bilder</th>
                <th>Preis</th>
                <th>Lagerbestand</th>
                <th>Status</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">Keine Produkte gefunden.</div>
                  </td>
                </tr>
              )}
              {list.map((p) => {
                const imgs = splitImages(p.images);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="cell-prod">
                        <div className="t-thumb">
                          {imgs.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgs[0]} alt={p.name} />
                          ) : (
                            <ProductIcon name={p.icon} />
                          )}
                        </div>
                        <div>
                          <div className="t-name">{p.name}</div>
                          <div className="t-code">
                            {p.code}
                            {p.subtitle ? " · " + truncate(p.subtitle, 80) : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.categoryName}</td>
                    <td>
                      {imgs.length > 0 ? (
                        <span className="tag blue">
                          {imgs.length} Bild{imgs.length > 1 ? "er" : ""}
                        </span>
                      ) : (
                        <span className="tag gray">—</span>
                      )}
                    </td>
                    <td>{formatPrice(p.priceCents)}</td>
                    <td>{formatNumber(p.stock)} Stk</td>
                    <td>
                      <span className={`tag ${p.status === "active" ? "green" : "gray"}`}>
                        {p.status === "active" ? "Aktiv" : "Entwurf"}
                      </span>
                    </td>
                    <td>
                      <div className="row-act">
                        <a
                          className="icon-act"
                          title="Im Shop ansehen"
                          href={`/werbemittel/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </a>
                        <button
                          className="icon-act"
                          title="Bearbeiten"
                          onClick={() => openEdit(p)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                          </svg>
                        </button>
                        <button
                          className="icon-act del"
                          title="Löschen"
                          onClick={() => handleDelete(p)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-bg">
          {/* Overlay click ile kapanmaz - sadece X butonu ve Abbrechen ile */}
          <div className="modal">
            <form onSubmit={handleSave}>
              <div className="modal-head">
                <h3>{modal.id ? "Produkt bearbeiten" : "Neues Produkt"}</h3>
                <button type="button" className="x" onClick={closeModal}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {error && <div className="form-err">{error}</div>}
                <input type="hidden" name="id" defaultValue={modal.id} />
                <input type="hidden" name="icon" defaultValue={modal.icon} />

                <div className="field-row">
                  <div className="field">
                    <label>Artikelnummer</label>
                    <input name="code" defaultValue={modal.code} required />
                  </div>
                  <div className="field">
                    <label>Status</label>
                    <select name="status" defaultValue={modal.status}>
                      <option value="active">Aktiv</option>
                      <option value="draft">Entwurf</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Produktname</label>
                  <input name="name" defaultValue={modal.name} required />
                </div>
                <div className="field">
                  <label>Kurzbeschreibung</label>
                  <input name="subtitle" defaultValue={modal.subtitle} />
                </div>

                {/* --- Produktbilder --- */}
                <div className="field">
                  <label>Produktbilder (max. {MAX_IMAGES})</label>
                  <div className="img-manager">
                    {images.map((img, i) => (
                      <div className={`img-thumb${i === 0 ? " is-main" : ""}`} key={img.key}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.preview} alt="" />
                        {img.file && <span className="img-new">neu</span>}
                        {i === 0 ? (
                          <span className="img-main">★ Vitrine</span>
                        ) : (
                          <button
                            type="button"
                            className="img-star"
                            title="Als Hauptbild (Vitrine) setzen"
                            onClick={() => makeMain(i)}
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          className="img-del"
                          title="Bild entfernen"
                          onClick={() => removeImage(i)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {images.length < MAX_IMAGES && (
                      <label className="img-add">
                        <span>+</span>
                        <small>Bild wählen</small>
                        <input
                          ref={fileInput}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          multiple
                          onChange={pickFiles}
                        />
                      </label>
                    )}
                  </div>
                  <p className="form-note">
                    JPG, PNG, WebP oder GIF · max. 4 MB pro Bild · {images.length}/
                    {MAX_IMAGES} belegt. Mit dem <b>★</b> wählst du das Vitrinen-Bild
                    (erscheint zuerst im Katalog).
                  </p>
                </div>

                <div className="field">
                  <label>Kategorie</label>
                  <select name="categoryId" defaultValue={modal.categoryId} required>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Auf welchen Seiten soll das Produkt erscheinen?</label>
                  <div className="pages-grid">
                    {(["kleidung", "taschen", "werbeartikel"] as const).map((slug) => {
                      const checked = modal.visiblePages.includes(slug);
                      return (
                        <label key={slug} className={`page-chip ${checked ? "active" : ""}`}>
                          <input
                            type="checkbox"
                            name="visiblePages"
                            value={slug}
                            checked={checked}
                            onChange={(e) => {
                              setModal((m) => {
                                if (!m) return m;
                                return {
                                  ...m,
                                  visiblePages: e.target.checked
                                    ? [...m.visiblePages, slug]
                                    : m.visiblePages.filter((s) => s !== slug),
                                };
                              });
                            }}
                          />
                          <span className="page-chip-label">
                            {slug === "kleidung" && "Textilveredelung"}
                            {slug === "taschen" && "Taschen"}
                            {slug === "werbeartikel" && "Werbeartikel"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="hint">
                    Werbemittel-Katalog zeigt immer alle Produkte. Hier wählst du, in welchen
                    Navigations-Sub-Seiten das Produkt zusätzlich erscheint. Du kannst mehrere auswählen.
                  </p>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Preis (€) — leer = auf Anfrage</label>
                    <input
                      name="price"
                      defaultValue={centsToInput(modal.priceCents)}
                      placeholder="6,90"
                    />
                  </div>
                  <div className="field">
                    <label>Lagerbestand (Stk)</label>
                    <input name="stock" type="number" defaultValue={modal.stock} />
                  </div>
                </div>

                <div className="field">
                  <label>Mengenstaffel-Preise (optional)</label>
                  <div className="tier-help">
                    Beispiel: 15 Stk = 14,91 € / 50 Stk = 13,49 € / 100 Stk = 13,15 €
                  </div>
                  <div className="tier-list">
                    {tiers.map((t, i) => (
                      <div key={i} className="tier-edit-row">
                        <div className="tier-edit-field">
                          <label>Ab Stück</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={t.qtyText}
                            placeholder="z. B. 25"
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, "");
                              setTiers((cur) =>
                                cur.map((x, j) => (j === i ? { ...x, qtyText: v } : x))
                              );
                            }}
                          />
                        </div>
                        <div className="tier-edit-field">
                          <label>Stückpreis (€)</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={t.priceText}
                            placeholder="z. B. 13,49"
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9,.]/g, "");
                              setTiers((cur) =>
                                cur.map((x, j) => (j === i ? { ...x, priceText: v } : x))
                              );
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="tier-remove"
                          onClick={() => setTiers((cur) => cur.filter((_, j) => j !== i))}
                          aria-label="Entfernen"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost tier-add"
                    onClick={() =>
                      setTiers((cur) => [...cur, { qtyText: "", priceText: "" }])
                    }
                  >
                    + Staffel hinzufügen
                  </button>
                </div>

                {/* Größen mit individuellem Stückpreis */}
                <div className="field">
                  <label>Größen & Stückpreise (optional)</label>
                  <div className="tier-help">
                    Stückpreis pro Größe. Leer oder 0 = wie Basispreis. Beispiel mit Basispreis €1,00:
                    S, M, L leer (= €1,00) / XL „1,50" (= €1,50) / XXL „0,80" (= günstiger).
                  </div>
                  <div className="tier-list">
                    {sizes.map((s, i) => (
                      <div key={i} className="tier-edit-row">
                        <div className="tier-edit-field">
                          <label>Größe</label>
                          <input
                            type="text"
                            value={s.nameText}
                            placeholder="z. B. S, M, L, XL, 3XL"
                            onChange={(e) => {
                              const v = e.target.value;
                              setSizes((cur) =>
                                cur.map((x, j) => (j === i ? { ...x, nameText: v } : x))
                              );
                            }}
                          />
                        </div>
                        <div className="tier-edit-field">
                          <label>Stückpreis (€) — leer = wie Basispreis</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={s.extraText}
                            placeholder="z. B. 1,50"
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9,.]/g, "");
                              setSizes((cur) =>
                                cur.map((x, j) => (j === i ? { ...x, extraText: v } : x))
                              );
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="tier-remove"
                          onClick={() => setSizes((cur) => cur.filter((_, j) => j !== i))}
                          aria-label="Entfernen"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost tier-add"
                    onClick={() =>
                      setSizes((cur) => [...cur, { nameText: "", extraText: "" }])
                    }
                  >
                    + Größe hinzufügen
                  </button>
                </div>
                <div className="field">
                  <label>Farben</label>
                  <div className="opt-palette">
                    {PRODUCT_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c.key}
                        className={`opt-swatch${selColors.includes(c.key) ? " on" : ""}`}
                        onClick={() => toggleColor(c.key)}
                        title={c.label}
                      >
                        <span className="opt-dot" style={{ background: c.hex }} />
                        {c.label}
                      </button>
                    ))}
                    {/* Benutzerdefinierte Hex-Farben, die schon ausgewählt sind */}
                    {selColors
                      .filter((k) => k.startsWith("#"))
                      .map((k) => {
                        const hex = colorHex(k);
                        const label = colorLabel(k);
                        return (
                          <button
                            type="button"
                            key={k}
                            className="opt-swatch on opt-swatch-custom"
                            onClick={() => toggleColor(k)}
                            title="Eigene Farbe — klicken zum Entfernen"
                          >
                            <span className="opt-dot" style={{ background: hex }} />
                            {label}
                          </button>
                        );
                      })}
                  </div>
                  <div className="custom-color-row">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      title="Farbe aus Palette wählen"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        if (/^#?[0-9a-fA-F]{0,8}$/.test(v)) {
                          setCustomColor(v.startsWith("#") ? v : "#" + v);
                        }
                      }}
                      placeholder="#3f9c5c"
                      className="custom-color-input"
                      style={{ width: 110 }}
                    />
                    <input
                      type="text"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      placeholder="z. B. Bordeaux, Mint, Pfirsich …"
                      className="custom-color-input"
                      style={{ flex: 1, minWidth: 140 }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        const hex = customColor.toLowerCase();
                        if (!/^#[0-9a-f]{6}$/.test(hex)) return;
                        const name = customColorName.trim();
                        const key = name ? `${hex}:${name}` : hex;
                        if (!selColors.some((c) => c.split(":")[0] === hex)) {
                          // EN BAŞA ekle - kullanıcı eklediğini hemen görsün
                          setSelColors((cur) => [key, ...cur]);
                          // Input'ları reset et — yeni renk eklemeye hazır
                          setCustomColor("#3f9c5c");
                          setCustomColorName("");
                        }
                      }}
                    >
                      + Eigene Farbe
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label>Material</label>
                  <div className="opt-chips">
                    {PRODUCT_MATERIALS.map((m) => (
                      <button
                        type="button"
                        key={m.key}
                        className={`opt-chip${selMaterials.includes(m.key) ? " on" : ""}`}
                        onClick={() => toggleMaterial(m.key)}
                      >
                        {m.label}
                      </button>
                    ))}
                    {selMaterials
                      .filter((k) => !PRODUCT_MATERIALS.some((m) => m.key === k))
                      .map((k) => (
                        <button
                          type="button"
                          key={k}
                          className="opt-chip on opt-chip-custom"
                          onClick={() => toggleMaterial(k)}
                          title="Klicken zum Entfernen"
                        >
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                          <span className="opt-x">×</span>
                        </button>
                      ))}
                  </div>
                  <div className="opt-add-row">
                    <input
                      type="text"
                      placeholder="Eigenes Material hinzufügen (z. B. Bambus, Leinen) …"
                      value={matInput}
                      onChange={(e) => setMatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const v = matInput.trim().toLowerCase();
                          if (v && !selMaterials.includes(v)) {
                            setSelMaterials((cur) => [...cur, v]);
                          }
                          setMatInput("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => {
                        const v = matInput.trim().toLowerCase();
                        if (v && !selMaterials.includes(v)) {
                          setSelMaterials((cur) => [...cur, v]);
                        }
                        setMatInput("");
                      }}
                    >
                      + Hinzufügen
                    </button>
                  </div>
                </div>
                {selColors.length > 0 && (
                  <div className="field">
                    <label>Bilder pro Farbe</label>
                    <p className="form-note" style={{ marginBottom: 12, marginTop: 0 }}>
                      Laden Sie für jede Farbe eigene Produktbilder hoch. Klickt der Kunde auf
                      eine Farbe, wechselt die Galerie automatisch zu diesen Bildern.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {selColors.map((colorKey) => {
                        // Esnek key matching - tam veya normalize edilmiş match
                        const norm = (s: string) => s.toLowerCase().trim();
                        const tk = norm(colorKey);
                        const matchedKey = Object.keys(colorImages).find((k) => norm(k) === tk) || colorKey;
                        const list = colorImages[matchedKey] || [];
                        const label = colorLabel(colorKey);
                        const hex = colorHex(colorKey) || colorKey;
                        return (
                          <div key={colorKey} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, background: "#fafafa" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{
                                display: "inline-block", width: 18, height: 18, borderRadius: "50%",
                                background: hex, border: "1px solid rgba(0,0,0,.15)"
                              }} />
                              <strong style={{ fontSize: 13 }}>{label}</strong>
                              <span style={{ fontSize: 11, color: "#6b7280" }}>
                                ({list.length} {list.length === 1 ? "Bild" : "Bilder"})
                              </span>
                            </div>
                            <div className="img-manager">
                              {list.map((img, i) => (
                                <div className="img-thumb" key={img.key}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img.preview} alt="" />
                                  {img.file && <span className="img-new">neu</span>}
                                  <button
                                    type="button"
                                    className="img-del"
                                    title="Bild entfernen"
                                    onClick={() => removeColorImage(colorKey, i)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <label className="img-add">
                                <span>+</span>
                                <small>Bilder hinzufügen</small>
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/gif"
                                  multiple
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 0) addColorImages(colorKey, files);
                                    e.target.value = ""; // reset
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="field">
                  <label>Beschreibung</label>
                  <RichEditor
                    key={modal.id || "new"}
                    name="description"
                    initial={modal.description}
                    minHeight={320}
                  />
                  <p className="form-note" style={{ marginTop: 6 }}>
                    Hier kommt die ausführliche Produktbeschreibung. Über die
                    Buttons formatieren: Überschriften, Listen, Fettdruck usw.
                    Untertitel oben drüber bleibt als kurze Zeile (max. 1–2
                    Sätze).
                  </p>
                </div>
                <div className="checkrow">
                  <label>
                    <input type="checkbox" name="isNew" defaultChecked={modal.isNew} /> Als „Neu"
                    markieren
                  </label>
                  <label>
                    <input type="checkbox" name="isEco" defaultChecked={modal.isEco} /> Öko-Artikel
                  </label>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-ghost" onClick={closeModal}>
                  Abbrechen
                </button>
                {!modal.id && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      if (confirm("Den Entwurf wirklich löschen? Alle Eingaben gehen verloren.")) {
                        clearDraft();
                        closeModal();
                      }
                    }}
                    title="Entwurf löschen"
                    style={{ color: "#dc2626" }}
                  >
                    Entwurf löschen
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={busy}>
                  {busy ? "Speichern …" : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
