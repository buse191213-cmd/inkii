import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";

const CUSTOMER_SESSION_COOKIE = "inkii_customer_session";
const SECRET = process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-me";

// Password hashing with scrypt (Node.js built-in)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const computed = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"));
  } catch {
    return false;
  }
}

// Token: customerId|timestamp signed
function signToken(customerId: string): string {
  const ts = Date.now();
  const payload = `${customerId}|${ts}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

function verifyToken(token: string): string | null {
  try {
    const parts = token.split("|");
    if (parts.length !== 3) return null;
    const [customerId, ts, sig] = parts;
    const payload = `${customerId}|${ts}`;
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    // Session 30 days
    const age = Date.now() - Number(ts);
    if (age > 30 * 24 * 60 * 60 * 1000) return null;
    return customerId;
  } catch {
    return null;
  }
}

export async function setCustomerSession(customerId: string): Promise<void> {
  const token = signToken(customerId);
  const c = await cookies();
  c.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearCustomerSession(): Promise<void> {
  const c = await cookies();
  c.delete(CUSTOMER_SESSION_COOKIE);
}

export async function getCurrentCustomerId(): Promise<string | null> {
  const c = await cookies();
  const token = c.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentCustomer() {
  const id = await getCurrentCustomerId();
  if (!id) return null;
  return db.customer.findUnique({ where: { id } });
}
