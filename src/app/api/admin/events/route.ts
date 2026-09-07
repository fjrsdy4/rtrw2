import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, attendance, citizens } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await db.select().from(events).orderBy(desc(events.eventDate));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [created] = await db.insert(events).values({
    title: body.title,
    description: body.description || null,
    eventDate: body.eventDate,
    eventTime: body.eventTime || null,
    location: body.location || null,
    createdBy: user.id,
  }).returning();
  return NextResponse.json(created);
}

export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  await db.delete(attendance).where(eq(attendance.eventId, id));
  await db.delete(events).where(eq(events.id, id));
  return NextResponse.json({ success: true });
}
