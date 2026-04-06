import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

const profileSelect = {
  id: true,
  email: true,
  name: true,
  avatarColor: true,
  age: true,
  gender: true,
  weight: true,
  height: true,
  trainingLevel: true,
  trainingGoal: true,
  injuryNotes: true,
} as const;

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: profileSelect,
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to load profile:", error);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const profile = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name.trim(),
        avatarColor: parsed.data.avatarColor ?? null,
        age: parsed.data.age ?? null,
        gender: parsed.data.gender ?? null,
        weight: parsed.data.weight ?? null,
        height: parsed.data.height ?? null,
        trainingLevel: parsed.data.trainingLevel ?? null,
        trainingGoal: parsed.data.trainingGoal ?? null,
        injuryNotes: parsed.data.injuryNotes?.trim() || null,
      },
      select: profileSelect,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
