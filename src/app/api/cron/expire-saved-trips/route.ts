import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Hard-deletes saved trips past their expiresAt. Triggered by Vercel Cron
 * (see vercel.json) or any external scheduler — Vercel automatically sends
 * `Authorization: Bearer $CRON_SECRET` when that env var is set on the
 * project, which is what this checks.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { count } = await prisma.savedTrip.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return NextResponse.json({ deleted: count });
}
