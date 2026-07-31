import { NextRequest, NextResponse } from "next/server";
import { runPaymentReminders } from "@/lib/payment-reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Zugriff nur mit korrektem CRON_SECRET — als Authorization-Header
  // (Vercel-Cron) ODER als URL-Parameter ?key=... (externe Scheduler).
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const urlKey = req.nextUrl.searchParams.get("key");
  if (secret && authHeader !== `Bearer ${secret}` && urlKey !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runPaymentReminders();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
