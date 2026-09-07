import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dueTypes, duePayments, transactions, citizens, activityLogs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession, generateTxId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const types = await db.select().from(dueTypes);
  const activeCitizens = await db
    .select({ id: citizens.id, name: citizens.name })
    .from(citizens)
    .where(eq(citizens.status, "aktif"))
    .orderBy(citizens.name);
  const payments = await db.select().from(duePayments).orderBy(desc(duePayments.id));

  return NextResponse.json({ types, citizens: activeCitizens, payments });
}

// Pay a due (check mark)
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { citizenId, dueTypeId, month, year } = body;

  // Get due type to know amount
  const [dt] = await db.select().from(dueTypes).where(eq(dueTypes.id, dueTypeId)).limit(1);
  if (!dt) return NextResponse.json({ error: "Due type not found" }, { status: 404 });

  // Get citizen name
  const [cit] = await db.select({ name: citizens.name }).from(citizens).where(eq(citizens.id, citizenId)).limit(1);

  // Create transaction
  const txId = generateTxId();
  const [tx] = await db.insert(transactions).values({
    txId,
    txType: "masuk",
    category: dt.name,
    description: `${dt.name} ${cit?.name || ""} - ${month}/${year}`,
    amount: dt.amount,
    txDate: new Date().toISOString().split("T")[0],
    createdBy: user.id,
  }).returning();

  // Create or update payment
  const existing = await db.select().from(duePayments)
    .where(and(eq(duePayments.citizenId, citizenId), eq(duePayments.dueTypeId, dueTypeId), eq(duePayments.month, month), eq(duePayments.year, year)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(duePayments).set({ paid: true, paidDate: new Date().toISOString().split("T")[0], transactionId: tx.id })
      .where(eq(duePayments.id, existing[0].id));
  } else {
    await db.insert(duePayments).values({
      citizenId, dueTypeId, month, year, paid: true,
      paidDate: new Date().toISOString().split("T")[0],
      transactionId: tx.id,
    });
  }

  await db.insert(activityLogs).values({
    userId: user.id,
    action: "Bayar Iuran",
    detail: `${cit?.name} - ${dt.name} ${month}/${year}`,
  });

  return NextResponse.json({ success: true, txId });
}
