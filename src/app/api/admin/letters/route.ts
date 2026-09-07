import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { letterRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await db.select().from(letterRequests).orderBy(desc(letterRequests.createdAt));
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [updated] = await db.update(letterRequests).set({
    status: body.status,
    notes: body.notes || null,
  }).where(eq(letterRequests.id, body.id)).returning();
  return NextResponse.json(updated);
}
