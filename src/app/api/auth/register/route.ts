import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        password: passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 },
    );
  }
}
