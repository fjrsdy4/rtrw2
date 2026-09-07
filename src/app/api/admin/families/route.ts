import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { families, citizens, activityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await db.select().from(families).orderBy(desc(families.createdAt));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "bendahara") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const [created] = await db.insert(families).values({
      noKK: body.noKK,
      headName: body.headName,
      address: body.address || null,
    }).returning();

    await db.insert(activityLogs).values({
      userId: user.id,
      action: "Tambah KK",
      detail: `Menambahkan KK: ${body.noKK} - ${body.headName}`,
    });
    return NextResponse.json(created);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
