import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";
import OnboardingWizard from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureDatabaseUser(userId);

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (profile?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="ambient-orb -left-32 top-20 h-80 w-80 bg-purple-200/60" />
      <div className="ambient-orb -right-32 bottom-10 h-80 w-80 bg-cyan-200/50" />

      <div className="relative z-10 w-full">
        <OnboardingWizard
          initialValues={
            profile
              ? {
                  academicLevel: profile.academicLevel ?? "",
                  institution: profile.institution ?? "",
                  course: profile.course ?? "",
                  dailyStudyHours: profile.dailyStudyHours ?? 3,
                  preferredStudyTime:
                    profile.preferredStudyTime ?? "",
                  studyGoal: profile.studyGoal ?? "",
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}