import { prisma } from "./prisma";

const FIXED_ID = "singleton";

export async function getNote(): Promise<string> {
  const note = await prisma.note.findUnique({
    where: {
      id: FIXED_ID,
    },
  });

  return note?.body ?? "";
}

export async function saveNote(body: string): Promise<void> {
  await prisma.note.upsert({
    where: {
      id: FIXED_ID,
    },
    update: {
      body,
    },
    create: {
      id: FIXED_ID,
      body,
    },
  });
}