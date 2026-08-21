import { NextResponse } from "next/server";

import { getNote, saveNote } from "@/lib/notes";

export async function GET() {
  return NextResponse.json({
    body: await getNote(),
  });
}

export async function POST(req: Request) {
  const { body } = await req.json();

  await saveNote(body);

  return NextResponse.json({
    ok: true,
  });
}