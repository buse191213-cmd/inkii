"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "inkii-cookie-consent-v1";

type CookieDict = {
  title: string;
  text: string;
  acceptAll: string;
  acceptNecessary: string;
  customize: string;
  save: string;
  necessary: string;
  necessaryDesc: string;
  analytics: string;
  analyticsDesc: string;
  marketing: string;
  marketingDesc: string;
  privacy: string;
  imprint: string;
};

export default function CookieBanner({ dict }: { dict: CookieDict }) {
  const [show, setShow] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setShow(true);
      else {
        // Mevcut tercih varsa toggle değerlerini yükle
        try {
          const parsed = JSON.parse(saved);
          setAnalytics(!!parsed.analytics);
          setMarketing(!!parsed.marketing);
        } catch {}
      }
    } catch {
      setShow(true);
    }

    // Footer'dan veya başka yerden tetiklenince banner'ı tekrar aç
    const handleOpen = () => {
      setDetails(true);
      setShow(true);
    };
    window.addEventListener("inkii-open-cookie-settings", handleOpen);
    return () => window.removeEventListener("inkii-open-cookie-settings", handleOpen);
  }, []);

  const save = (a: boolean, m: boolean) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          necessary: true,
          analytics: a,
          marketing: m,
          timestamp: new Date().toISOString(),
        })
      );
      // Analytics-Komponenten sofort informieren (ohne Reload)
      window.dispatchEvent(new Event("inkii-cookie-consent-changed"));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label={dict.title}>
      <div className="cookie-inner">
        <div className="cookie-head">
          <h3 className="cookie-h">{dict.title}</h3>
          <p className="cookie-p">{dict.text}</p>
        </div>

        {details && (
          <div className="cookie-details">
            <label className="cookie-row cookie-row-disabled">
              <input type="checkbox" checked disabled />
              <div>
                <div className="cookie-row-h">{dict.necessary}</div>
                <div className="cookie-row-d">{dict.necessaryDesc}</div>
              </div>
            </label>
            <label className="cookie-row">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <div>
                <div className="cookie-row-h">{dict.analytics}</div>
                <div className="cookie-row-d">{dict.analyticsDesc}</div>
              </div>
            </label>
            <label className="cookie-row">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <div>
                <div className="cookie-row-h">{dict.marketing}</div>
                <div className="cookie-row-d">{dict.marketingDesc}</div>
              </div>
            </label>
          </div>
        )}

        <div className="cookie-actions">
          {!details && (
            <button
              type="button"
              className="cookie-btn cookie-btn-link"
              onClick={() => setDetails(true)}
            >
              {dict.customize}
            </button>
          )}
          {details && (
            <button
              type="button"
              className="cookie-btn cookie-btn-link"
              onClick={() => save(analytics, marketing)}
            >
              {dict.save}
            </button>
          )}
          <button
            type="button"
            className="cookie-btn cookie-btn-ghost"
            onClick={() => save(false, false)}
          >
            {dict.acceptNecessary}
          </button>
          <button
            type="button"
            className="cookie-btn cookie-btn-primary"
            onClick={() => save(true, true)}
          >
            {dict.acceptAll}
          </button>
        </div>

        <div className="cookie-legal">
          <Link href="/datenschutz">{dict.privacy}</Link>
          <span>·</span>
          <Link href="/impressum">{dict.imprint}</Link>
        </div>
      </div>
    </div>
  );
}
