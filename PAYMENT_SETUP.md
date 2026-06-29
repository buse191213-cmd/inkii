# Ödeme Sistemleri — Setup Guide

INKII Works 3 ödeme yöntemini destekler:
- 💰 **PayPal** (kart + bakiye)
- 💜 **Klarna** (Stripe üzerinden)
- 📧 **Auf Rechnung** (manuel banka)

## 1. PayPal Setup

### A. PayPal Business Hesabı Aç
1. https://www.paypal.com/de/business adresine git
2. "Business-Konto eröffnen"
3. INKII WORKS bilgileri ile aç

### B. App Oluştur (Developer Dashboard)
1. https://developer.paypal.com/dashboard/
2. "My Apps & Credentials"
3. **Sandbox** sekmesi (test için) → "Create App"
4. App name: "INKII Works"
5. Üretildikten sonra **Client ID** ve **Secret** kopyala

### C. Vercel Environment Variables

```
PAYPAL_CLIENT_ID       = "AeA1QIZXiflr7..."  # Sandbox veya Live
PAYPAL_CLIENT_SECRET   = "EBoKx3oBQpqg..."
PAYPAL_MODE            = "sandbox"           # Test için. Production: "live"
```

### D. Production'a Geçiş
- PayPal'in domain doğrulamasını tamamla
- Live Client ID al
- `PAYPAL_MODE = "live"` yap

---

## 2. Stripe Setup (Klarna)

### A. Stripe Hesabı Aç
1. https://dashboard.stripe.com/register
2. Almanya/şirket bilgileri ile hesap aç
3. Klarna'yı **Settings → Payment methods** sekmesinden aktif et

### B. API Keys

```
STRIPE_SECRET_KEY       = "sk_test_..."   # Test için. Live: sk_live_...
STRIPE_WEBHOOK_SECRET   = "whsec_..."     # Webhook için (aşağıda)
```

### C. Webhook Ayarlama (Önerilen)

1. Stripe Dashboard → **Developers → Webhooks**
2. "Add endpoint":
   - URL: `https://www.inkiiworks.de/api/stripe/webhook`
   - Events: `checkout.session.completed`
3. "Signing secret" değerini kopyala → `STRIPE_WEBHOOK_SECRET`

### D. Klarna'yı Aktif Et

Stripe Dashboard → **Settings → Payment methods → Klarna**
- Almanya için: kısa onboarding süreci
- Onaylandığında live ortamda çalışır

---

## 3. Test

### PayPal Sandbox Test
1. https://developer.paypal.com/dashboard/accounts
2. Sandbox test accounts:
   - **Buyer**: test@personal.example.com  (otomatik üretilmiş)
   - Passwort: dashboard'da gösteriliyor
3. INKII checkout'ta PayPal seç → modal açılır → buyer hesabıyla giriş yap

### Stripe Klarna Test
1. Klarna test mode'da çalışırken Stripe'ın test kartları kullanılabilir
2. https://stripe.com/docs/payments/klarna#testing

---

## 4. Akış

```
Müşteri /kasse → form doldur
              ↓
         PayPal seç?
              ↓
         Order DB'ye kaydet (PENDING)
              ↓
         PayPal modal açılır (frontend)
              ↓
         /api/paypal/create-order → PayPal Order ID
              ↓
         Müşteri PayPal'da onaylar
              ↓
         onApprove → capturePayPalPayment (server action)
              ↓
         Order güncellenir: status=BEZAHLT, paymentStatus=PAID
              ↓
         Müşteriye otomatik mail + PDF Rechnung
              ↓
         /bestellung-erfolg sayfasına yönlendirir
```

Klarna için akış:
```
Müşteri /kasse → form doldur → Klarna seç
              ↓
         Order DB'ye kaydet (PENDING)
              ↓
         /kasse/stripe-actions → Stripe Checkout Session
              ↓
         Stripe hosted checkout'a yönlendirir
              ↓
         Müşteri Klarna ile öder
              ↓
         /api/stripe/return → PaymentIntent doğrulanır
              ↓
         Order güncellenir: status=BEZAHLT
              ↓
         /bestellung-erfolg
```

---

## 5. Vercel Environment Variables (Toplu)

```bash
# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Hiçbiri yapılandırılmamışsa: o yöntem otomatik olarak checkout'tan kaldırılır
(`isPayPalConfigured()` / `isStripeConfigured()` checks).
