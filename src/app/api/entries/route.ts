import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/lib/validations";
import { generateInsight } from "@/lib/gemini";
import { Prisma } from "@prisma/client";

function parseEntryDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function parsePositiveInt(input: string | null, fallback: number) {
  if (!input) return fallback;
  const parsed = Number.parseInt(input, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toWeekStart(date: Date) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - diffToMonday);
  return utc;
}

async function maybeGenerateInsight(userId: string) {
  const latestInsight = await prisma.insight.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (latestInsight) {
    const msSinceLastInsight = Date.now() - latestInsight.createdAt.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    if (msSinceLastInsight < fiveMinutes) return;
  }

  const recentEntries = await prisma.entry.findMany({
    where: {
      userId,
      date: {
        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { date: "asc" },
  });

  if (recentEntries.length < 3) return;

  const content = await generateInsight(recentEntries);
  const newestDate = recentEntries[recentEntries.length - 1]?.date ?? new Date();

  await prisma.insight.create({
    data: {
      userId,
      weekStartDate: toWeekStart(newestDate),
      content,
    },
  });
}

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(50, parsePositiveInt(searchParams.get("limit"), 10));
  const daysParam = searchParams.get("days");
  const days = parsePositiveInt(daysParam, 0);

  const where = days > 0
    ? {
        userId: session.user.id,
        date: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      }
    : { userId: session.user.id };

  const [items, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.entry.count({ where }),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const input = parsed.data;
    const date = parseEntryDate(input.date);

    const entry = await prisma.entry.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
      create: {
        userId: session.user.id,
        date,
        workoutType: input.workoutType,
        workoutDuration: input.workoutDuration,
        perceivedExertion: input.perceivedExertion,
        sorenessLevel: input.sorenessLevel,
        sleepDuration: input.sleepDuration,
        sleepQuality: input.sleepQuality,
        energyLevel: input.energyLevel,
        notes: input.notes ?? null,
      },
      update: {
        workoutType: input.workoutType,
        workoutDuration: input.workoutDuration,
        perceivedExertion: input.perceivedExertion,
        sorenessLevel: input.sorenessLevel,
        sleepDuration: input.sleepDuration,
        sleepQuality: input.sleepQuality,
        energyLevel: input.energyLevel,
        notes: input.notes ?? null,
      },
    });

    void maybeGenerateInsight(session.user.id).catch((error) => {
      console.error("Background insight generation failed:", error);
    });

    return NextResponse.json({ entry }, { status: 201 });
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
    console.error("Failed to save entry:", error);
    return NextResponse.json({ error: "Failed to save entry." }, { status: 500 });
  }
}
