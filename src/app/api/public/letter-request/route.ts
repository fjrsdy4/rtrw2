import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { letterRequests, notifications } from "@/db/schema";
import { generateTicket } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticketNo = generateTicket("SRT");
    await db.insert(letterRequests).values({
      ticketNo,
      requesterName: body.requesterName,
      requesterPhone: body.requesterPhone || null,
      letterType: body.letterType,
      purpose: body.purpose || null,
    });
    await db.insert(notifications).values({
      title: "Permohonan Surat Baru",
      message: `${body.requesterName} mengajukan ${body.letterType} (${ticketNo})`,
      type: "letter",
    });
    return NextResponse.json({ success: true, ticketNo });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
