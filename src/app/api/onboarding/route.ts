
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";

const onboardingSchema = z.object({
  academicLevel: z.string().min(1).max(100),
  institution: z.string().trim().min(2).max(150),
  course: z.string().trim().min(2).max(150),
  dailyStudyHours: z.number().int().min(1).max(12),
  preferredStudyTime: z.enum([
    "Morning",
    "Afternoon",
    "Evening",
    "Night",
  ]),
  studyGoal: z.string().trim().min(10).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const validation = onboardingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Please check your information.",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const user = await ensureDatabaseUser(userId);

    const profile = await prisma.studentProfile.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        ...validation.data,
        onboardingCompleted: true,
      },
      update: {
        ...validation.data,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your study profile has been saved!",
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding submission failed:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
