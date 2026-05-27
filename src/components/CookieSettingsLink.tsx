"use client";

export default function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="footer-cookie-btn"
      onClick={() => {
        window.dispatchEvent(new Event("inkii-open-cookie-settings"));
      }}
    >
      {label}
    </button>
  );
}
