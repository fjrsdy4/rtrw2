import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assetBorrows, notifications, assets } from "@/db/schema";
import { generateTicket } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticketNo = generateTicket("PJM");
    
    // get asset name
    const [asset] = await db.select({ name: assets.name }).from(assets).where(eq(assets.id, body.assetId)).limit(1);
    
    await db.insert(assetBorrows).values({
      ticketNo,
      assetId: body.assetId,
      borrowerName: body.borrowerName,
      borrowerPhone: body.borrowerPhone || null,
      borrowDate: body.borrowDate,
      returnDate: body.returnDate || null,
      purpose: body.purpose || null,
    });
    await db.insert(notifications).values({
      title: "Peminjaman Aset Baru",
      message: `${body.borrowerName} meminjam ${asset?.name || "aset"} (${ticketNo})`,
      type: "borrow",
    });
    return NextResponse.json({ success: true, ticketNo });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
