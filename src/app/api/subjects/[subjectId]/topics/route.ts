
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";

const createTopicSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  estimatedMinutes: z.number().int().min(1).max(1440).optional().nullable(),
});

type RouteContext = {
  params: Promise<{
    subjectId: string;
  }>;
};

// GET: Fetch all topics belonging to a subject
export async function GET(
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
    const { subjectId } = await params;

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

    const topics = await prisma.topic.findMany({
      where: {
        subjectId,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      count: topics.length,
      topics,
    });
  } catch (error) {
    console.error("GET SUBJECT TOPICS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch topics" },
      { status: 500 },
    );
  }
}

// POST: Create a topic
export async function POST(
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
    const { subjectId } = await params;

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

    const body = await request.json();
    const validation = createTopicSchema.safeParse(body);

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

    // Place the new topic after the existing topics.
    const lastTopic = await prisma.topic.aggregate({
      where: {
        subjectId,
      },
      _max: {
        order: true,
      },
    });

    const topic = await prisma.topic.create({
      data: {
        subjectId,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        estimatedMinutes: data.estimatedMinutes ?? null,
        order: (lastTopic._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Topic created successfully",
        topic,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE SUBJECT TOPIC ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create topic" },
      { status: 500 },
    );
  }
}
