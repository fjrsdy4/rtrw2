import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, notifications } from "@/db/schema";
import { generateTicket } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticketNo = generateTicket("ADU");
    await db.insert(complaints).values({
      ticketNo,
      reporterName: body.isAnonymous ? null : body.reporterName,
      isAnonymous: body.isAnonymous || false,
      category: body.category || null,
      content: body.content,
    });
    await db.insert(notifications).values({
      title: "Pengaduan Baru",
      message: `${body.isAnonymous ? "Anonim" : body.reporterName} mengirim pengaduan (${ticketNo})`,
      type: "complaint",
    });
    return NextResponse.json({ success: true, ticketNo });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
