import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureDatabaseUser(userId);

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingCompleted: true },
  });

  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}