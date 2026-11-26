
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";

// ==========================================
// VALIDATION
// ==========================================

const subjectSchema = z
  .object({
    name: z.string().trim().min(2).max(80),

    description: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional(),

    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),

    targetHoursPerWeek: z
      .number()
      .int()
      .min(1)
      .max(168)
      .nullable()
      .optional(),
  })
  .strict();

// ==========================================
// ERROR HANDLER
// ==========================================

function isDuplicateError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

// ==========================================
// GET - FETCH ALL SUBJECTS
// ==========================================

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await ensureDatabaseUser(userId);

    const subjects = await prisma.subject.findMany({
      where: {
        userId: user.id,
      },

      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: subjects.length,
        subjects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch subjects failed:", error);

    return NextResponse.json(
      { error: "Unable to fetch subjects." },
      { status: 500 }
    );
  }
}

// ==========================================
// POST - CREATE SUBJECT
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const validation = subjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Please check your subject information.",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const user = await ensureDatabaseUser(userId);

    const subject = await prisma.subject.create({
      data: {
        ...validation.data,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subject created successfully.",
        subject,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDuplicateError(error)) {
      return NextResponse.json(
        { error: "A subject with this name already exists." },
        { status: 409 }
      );
    }

    console.error("Create subject failed:", error);

    return NextResponse.json(
      { error: "Unable to create subject." },
      { status: 500 }
    );
  }
}
