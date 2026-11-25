
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ensureDatabaseUser } from "@/lib/ensure-user";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureDatabaseUser(userId);

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  const firstName = user.name?.trim().split(/\s+/)[0] || "Student";

  const studyTimeMessages: Record<string, string> = {
    Morning: "You're a morning learner. Let's make those early hours count.",
    Afternoon: "Your afternoons are your time to focus and grow.",
    Evening: "Let's make your evenings productive and meaningful.",
    Night: "Your night-time focus can take you closer to your goals.",
  };

  return (
    <div className="space-y-8">
      {/* Personalized welcome */}
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#9875e8] via-[#a17ce9] to-[#c08be8] p-7 text-white shadow-xl shadow-purple-200/50 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-48 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur-xl">
            ✨ YOUR PERSONAL STUDY SPACE
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hey, {firstName}! 👋
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
            Your goals are waiting. Let's turn your study plans into
            something amazing, one focused session at a time.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-3 text-sm font-semibold backdrop-blur-lg">
            <span>🎯</span>
            {profile?.studyGoal || "Every expert was once a beginner."}
          </div>
        </div>
      </section>

      {/* Academic profile */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-[#29243b]">
            Your learning journey
          </h2>
          <p className="mt-1 text-sm text-[#9993aa]">
            Your academic profile at a glance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ProfileCard
            icon="🎓"
            label="Education level"
            value={profile?.academicLevel || "Not set"}
            detail="Your current level"
          />

          <ProfileCard
            icon="🏫"
            label="Institution"
            value={profile?.institution || "Not set"}
            detail="Your university or school"
          />

          <ProfileCard
            icon="📚"
            label="Course"
            value={profile?.course || "Not set"}
            detail="Your field of study"
          />

          <ProfileCard
            icon="⏱️"
            label="Daily study target"
            value={
              profile?.dailyStudyHours
                ? `${profile.dailyStudyHours} hours`
                : "Not set"
            }
            detail="Your planned daily commitment"
          />
        </div>
      </section>

      {/* Study preferences */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[26px] border border-white/80 bg-white/70 p-6 shadow-lg shadow-purple-100/40 backdrop-blur-2xl">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eee8ff] text-xl">
            🌤️
          </div>

          <p className="text-sm font-semibold text-[#9993aa]">
            Your preferred study time
          </p>

          <h3 className="mt-2 text-2xl font-extrabold text-[#29243b]">
            {profile?.preferredStudyTime || "Not set"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#9993aa]">
            {studyTimeMessages[profile?.preferredStudyTime || ""] ||
              "Choose your preferred time to help us build a routine around your day."}
          </p>
        </div>

        <div className="rounded-[26px] border border-white/80 bg-white/70 p-6 shadow-lg shadow-purple-100/40 backdrop-blur-2xl">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e5f8f2] text-xl">
            🚀
          </div>

          <p className="text-sm font-semibold text-[#9993aa]">
            Your main goal
          </p>

          <h3 className="mt-2 text-lg font-extrabold text-[#29243b]">
            {profile?.studyGoal || "Set your learning goal"}
          </h3>

          <p className="mt-2 text-sm text-[#9993aa]">
            Every focused session brings you one step closer.
          </p>
        </div>
      </section>

      {/* Next feature placeholder */}
      <section className="rounded-[26px] border border-dashed border-[#d9cafa] bg-white/50 p-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eee8ff] text-[#8967e8]">
          ✨
        </div>

        <h2 className="text-lg font-extrabold text-[#29243b]">
          Your study journey starts here
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#9993aa]">
          Add your subjects and topics next. StudyPilot AI will use them
          to help build your personalized study plan.
        </p>
      </section>
    </div>
  );
}

function ProfileCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-w-0 rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-lg shadow-purple-100/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebff] text-lg">
        {icon}
      </div>

      <p className="text-xs font-semibold text-[#9993aa]">{label}</p>

      <h3 className="mt-2 break-words text-lg font-extrabold text-[#29243b]">
        {value}
      </h3>

      <p className="mt-1 text-xs text-[#aaa5b8]">{detail}</p>
    </div>
  );
}
