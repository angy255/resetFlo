import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/lib/validations";

function parseEntryDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const entry = await prisma.entry.findUnique({ where: { id } });

  if (!entry || entry.userId !== session.user.id) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  return NextResponse.json({ entry });
}

export async function PUT(request: Request, context: Context) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.entry.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid entry payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: {
        date: parseEntryDate(parsed.data.date),
        workoutType: parsed.data.workoutType,
        workoutDuration: parsed.data.workoutDuration,
        perceivedExertion: parsed.data.perceivedExertion,
        sorenessLevel: parsed.data.sorenessLevel,
        sleepDuration: parsed.data.sleepDuration,
        sleepQuality: parsed.data.sleepQuality,
        energyLevel: parsed.data.energyLevel,
        notes: parsed.data.notes ?? null,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An entry already exists for that date." },
        { status: 409 },
      );
    }
    console.error("Failed to update entry:", error);
    return NextResponse.json({ error: "Failed to update entry." }, { status: 500 });
  }
}
