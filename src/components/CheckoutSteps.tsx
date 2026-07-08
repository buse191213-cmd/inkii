"use client";

/**
 * Checkout adım göstergesi (stepper).
 * Adımlar: Warenkorb → Anmelden → Versand → Überprüfung → Zahlung
 * Giriş yapmış kullanıcıda "Anmelden" tamamlanmış gösterilir.
 */

type Step = { key: string; label: string };

const ALL_STEPS: Step[] = [
  { key: "warenkorb", label: "Warenkorb" },
  { key: "anmelden", label: "Anmelden" },
  { key: "versand", label: "Versand" },
  { key: "pruefung", label: "Überprüfung" },
  { key: "zahlung", label: "Zahlung" },
];

type Props = {
  current: "warenkorb" | "anmelden" | "versand" | "pruefung" | "zahlung";
  isLoggedIn?: boolean;
};

export default function CheckoutSteps({ current, isLoggedIn }: Props) {
  const currentIdx = ALL_STEPS.findIndex((s) => s.key === current);

  return (
    <div className="checkout-steps">
      {ALL_STEPS.map((step, i) => {
        const isDone = i < currentIdx || (step.key === "anmelden" && isLoggedIn && current !== "anmelden");
        const isActive = step.key === current;
        return (
          <div
            key={step.key}
            className={`cs-step${isActive ? " active" : ""}${isDone ? " done" : ""}`}
          >
            <div className="cs-circle">
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="cs-label">{step.label}</span>
            {i < ALL_STEPS.length - 1 && <span className="cs-line" />}
          </div>
        );
      })}

      <style jsx>{`
        .checkout-steps {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          max-width: 640px;
          margin: 0 auto 32px;
          padding: 0 8px;
        }
        .cs-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
          gap: 8px;
        }
        .cs-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #d1d5db;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 700;
          z-index: 2;
          transition: all 0.2s;
        }
        .cs-step.active .cs-circle {
          border-color: #004537;
          background: #004537;
          color: #fff;
          box-shadow: 0 0 0 4px rgba(0, 69, 55, 0.12);
        }
        .cs-step.done .cs-circle {
          border-color: #004537;
          background: #004537;
          color: #fff;
        }
        .cs-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #9ca3af;
          text-align: center;
          white-space: nowrap;
        }
        .cs-step.active .cs-label {
          color: #004537;
        }
        .cs-step.done .cs-label {
          color: #0f1a16;
        }
        .cs-line {
          position: absolute;
          top: 17px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: #d1d5db;
          z-index: 1;
        }
        .cs-step.done .cs-line {
          background: #004537;
        }
        @media (max-width: 520px) {
          .cs-label {
            font-size: 0.62rem;
          }
          .cs-circle {
            width: 28px;
            height: 28px;
            font-size: 0.78rem;
          }
          .cs-line {
            top: 14px;
          }
        }
      `}</style>
    </div>
  );
}
