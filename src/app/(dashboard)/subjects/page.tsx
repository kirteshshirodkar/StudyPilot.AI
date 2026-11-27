
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";

import SubjectsClient from "@/components/subjects/subjects-client";

export default async function SubjectsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
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

  const totalTargetHours = subjects.reduce(
    (total, subject) => total + (subject.targetHoursPerWeek ?? 0),
    0,
  );

  return (
    <SubjectsClient
      initialSubjects={subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        description: subject.description,
        color: subject.color,
        targetHoursPerWeek: subject.targetHoursPerWeek,
        topicCount: subject._count.topics,
        createdAt: subject.createdAt.toISOString(),
      }))}
      totalTargetHours={totalTargetHours}
    />
  );
}
