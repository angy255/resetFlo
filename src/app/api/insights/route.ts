import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { generateInsight } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function toWeekStart(date: Date) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - diffToMonday);
  return utc;
}

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const insight = await prisma.insight.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ insight });
}

export async function POST() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const latestInsight = await prisma.insight.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (latestInsight && Date.now() - latestInsight.createdAt.getTime() < FIVE_MINUTES_MS) {
    return NextResponse.json(
      { error: "Insight was generated recently. Please wait a few minutes." },
      { status: 429 },
    );
  }

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const entries = await prisma.entry.findMany({
    where: {
      userId: session.user.id,
      date: { gte: since },
    },
    orderBy: { date: "asc" },
  });

  if (entries.length < 3) {
    return NextResponse.json(
      { error: "Need at least 3 entries to generate meaningful insights." },
      { status: 400 },
    );
  }

  try {
    const content = await generateInsight(entries);
    const insight = await prisma.insight.create({
      data: {
        userId: session.user.id,
        weekStartDate: toWeekStart(entries[entries.length - 1].date),
        content,
      },
    });
    return NextResponse.json({ insight }, { status: 201 });
  } catch (error) {
    console.error("Failed to generate insight:", error);
    const message = error instanceof Error ? error.message : "Failed to generate insight.";

    if (/rate/i.test(message) || /429/.test(message)) {
      return NextResponse.json(
        { error: "Insight generation is rate limited right now. Please try again shortly." },
        { status: 429 },
      );
    }

    if (/blocked/i.test(message) || /safety/i.test(message)) {
      return NextResponse.json({ error: "AI response was blocked. Please try again." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to generate insight right now. Please try again shortly." },
      { status: 500 },
    );
  }
}
