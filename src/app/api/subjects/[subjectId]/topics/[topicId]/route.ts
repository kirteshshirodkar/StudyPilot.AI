
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";

const updateTopicSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    status: z
      .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])
      .optional(),
    estimatedMinutes: z
      .number()
      .int()
      .min(1)
      .max(1440)
      .nullable()
      .optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

type RouteContext = {
  params: Promise<{
    subjectId: string;
    topicId: string;
  }>;
};

// PATCH: Update topic details and completion status
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await ensureDatabaseUser(userId);
    const { subjectId, topicId } = await params;

    // Verify subject ownership.
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 },
      );
    }

    // Verify topic belongs to this subject.
    const existingTopic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        subjectId,
      },
    });

    if (!existingTopic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validation = updateTopicSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid topic data",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Build update data without overwriting unspecified fields.
    const updateData: {
      title?: string;
      description?: string | null;
      priority?: "LOW" | "MEDIUM" | "HIGH";
      status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      estimatedMinutes?: number | null;
      order?: number;
      completedAt?: Date | null;
    } = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }

    if (data.estimatedMinutes !== undefined) {
      updateData.estimatedMinutes = data.estimatedMinutes;
    }

    if (data.order !== undefined) {
      updateData.order = data.order;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;

      // Set completion timestamp when completed.
      if (data.status === "COMPLETED") {
        updateData.completedAt =
          existingTopic.completedAt ?? new Date();
      } else {
        // Clear completion timestamp when reopened.
        updateData.completedAt = null;
      }
    }

    const updatedTopic = await prisma.topic.update({
      where: {
        id: topicId,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Topic updated successfully",
      topic: updatedTopic,
    });
  } catch (error) {
    console.error("UPDATE TOPIC ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update topic" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a topic
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await ensureDatabaseUser(userId);
    const { subjectId, topicId } = await params;

    // Verify subject ownership.
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 },
      );
    }

    // Verify topic belongs to this subject.
    const topic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        subjectId,
      },
      select: {
        id: true,
      },
    });

    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 },
      );
    }

    await prisma.topic.delete({
      where: {
        id: topicId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TOPIC ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete topic" },
      { status: 500 },
    );
  }
}
