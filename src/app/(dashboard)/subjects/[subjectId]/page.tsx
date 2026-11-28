
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";
import { auth } from "@clerk/nextjs/server";

import SubjectDetailsClient from "@/components/subjects/subject-details-client";

type SubjectDetailsPageProps = {
  params: Promise<{
    subjectId: string;
  }>;
};

export default async function SubjectDetailsPage({
  params,
}: SubjectDetailsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const user = await ensureDatabaseUser(userId);
  const { subjectId } = await params;

  // Fetch the subject and its topics.
  const subject = await prisma.subject.findFirst({
    where: {
      id: subjectId,
      userId: user.id,
    },
    include: {
      topics: {
        orderBy: [
          {
            order: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      },
    },
  });

  // Return 404 if the subject doesn't exist
  // or doesn't belong to the authenticated user.
  if (!subject) {
    notFound();
  }

  // Calculate topic statistics.
  const totalTopics = subject.topics.length;

  const completedTopics = subject.topics.filter(
    (topic) => topic.status === "COMPLETED",
  ).length;

  const inProgressTopics = subject.topics.filter(
    (topic) => topic.status === "IN_PROGRESS",
  ).length;

  const notStartedTopics = subject.topics.filter(
    (topic) => topic.status === "NOT_STARTED",
  ).length;

  const completionPercentage =
    totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

  return (
    <SubjectDetailsClient
      subject={{
        id: subject.id,
        name: subject.name,
        description: subject.description,
        color: subject.color,
        targetHoursPerWeek: subject.targetHoursPerWeek,
        createdAt: subject.createdAt.toISOString(),
      }}
      initialTopics={subject.topics.map((topic) => ({
        id: topic.id,
        subjectId: topic.subjectId,
        title: topic.title,
        description: topic.description,
        status: topic.status,
        priority: topic.priority,
        estimatedMinutes: topic.estimatedMinutes,
        order: topic.order,
        completedAt: topic.completedAt?.toISOString() ?? null,
        createdAt: topic.createdAt.toISOString(),
        updatedAt: topic.updatedAt.toISOString(),
      }))}
      statistics={{
        totalTopics,
        completedTopics,
        inProgressTopics,
        notStartedTopics,
        completionPercentage,
      }}
    />
  );
}
