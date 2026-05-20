import { getHeroVideoSrc } from "@/lib/hero-video";
import HeroVideoManager from "./HeroVideoManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const heroVideo = await getHeroVideoSrc();
  return (
    <>
      <p className="crumb">
        Admin <b>/ Einstellungen</b>
      </p>

      <HeroVideoManager currentVideo={heroVideo} />

      <div className="set-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Firmendaten</h3>
          </div>
          <div className="panel-body">
            <div className="field">
              <label>Firmenname</label>
              <input type="text" defaultValue="INKII" />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Telefon</label>
                <input type="text" defaultValue="0000 – 000 00 00" />
              </div>
              <div className="field">
                <label>E-Mail</label>
                <input type="email" defaultValue="info@inkii.de" />
              </div>
            </div>
            <div className="field">
              <label>Adresse</label>
              <input type="text" defaultValue="Musterstraße 12, 00000 Musterstadt" />
            </div>
            <div className="field">
              <label>Öffnungszeiten</label>
              <input type="text" defaultValue="Mo–Fr 08:30–17:00 Uhr" />
            </div>
            <button className="btn-primary" type="button">
              Speichern
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Katalog-Einstellungen</h3>
          </div>
          <div className="panel-body">
            <div className="field">
              <label>Standard-Währung</label>
              <select defaultValue="eur">
                <option value="eur">Euro (€)</option>
                <option value="chf">Schweizer Franken (CHF)</option>
              </select>
            </div>
            <div className="field">
              <label>MwSt.-Satz</label>
              <select defaultValue="19">
                <option value="19">19 % (Deutschland)</option>
                <option value="20">20 % (Österreich)</option>
                <option value="7.7">7,7 % (Schweiz)</option>
              </select>
            </div>
            <div className="field">
              <label>Artikel pro Katalogseite</label>
              <select defaultValue="12">
                <option>12</option>
                <option>24</option>
                <option>48</option>
              </select>
            </div>
            <div className="field">
              <label>Express-Veredelung anbieten</label>
              <select defaultValue="on">
                <option value="on">Aktiv (48 h)</option>
                <option value="off">Deaktiviert</option>
              </select>
            </div>
            <button className="btn-primary" type="button">
              Speichern
            </button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-body">
          <p style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.6 }}>
            <b style={{ color: "var(--ink)" }}>Hinweis:</b> Diese Einstellungen dienen
            als Vorlage. Für dauerhafte Speicherung kann ein <code>Settings</code>-Modell
            in <code>prisma/schema.prisma</code> ergänzt werden — die Struktur der
            Server Actions ist bereits vorbereitet.
          </p>
        </div>
      </div>
    </>
  );
}
