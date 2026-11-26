
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";

// ==========================================
// VALIDATION
// ==========================================

const updateSubjectSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),

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
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided." }
  );

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
// PATCH - UPDATE SUBJECT
// ==========================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { subjectId } = await params;

    if (!subjectId) {
      return NextResponse.json(
        { error: "Subject ID is required." },
        { status: 400 }
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

    const validation = updateSubjectSchema.safeParse(body);

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

    // Update only if the subject belongs to this user.
    const result = await prisma.subject.updateMany({
      where: {
        id: subjectId,
        userId: user.id,
      },
      data: validation.data,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Subject not found." },
        { status: 404 }
      );
    }

    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subject updated successfully.",
        subject,
      },
      { status: 200 }
    );
  } catch (error) {
    if (isDuplicateError(error)) {
      return NextResponse.json(
        { error: "A subject with this name already exists." },
        { status: 409 }
      );
    }

    console.error("Update subject failed:", error);

    return NextResponse.json(
      { error: "Unable to update subject." },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE - DELETE SUBJECT
// ==========================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { subjectId } = await params;

    if (!subjectId) {
      return NextResponse.json(
        { error: "Subject ID is required." },
        { status: 400 }
      );
    }

    const user = await ensureDatabaseUser(userId);

    // Delete only the authenticated user's subject.
    const result = await prisma.subject.deleteMany({
      where: {
        id: subjectId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Subject not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subject deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete subject failed:", error);

    return NextResponse.json(
      { error: "Unable to delete subject." },
      { status: 500 }
    );
  }
}
