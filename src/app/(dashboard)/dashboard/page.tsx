
import {
  ArrowUpRight,
  Clock3,
  Flame,
  Target,
  BookOpen,
  Sparkles,
  Plus,
  Play,
  CalendarDays,
  Brain,
  Trophy,
} from "lucide-react";

const stats = [
  {
    label: "Study time",
    value: "0h 00m",
    note: "Total learning time",
    icon: Clock3,
    color: "bg-[#eee8ff] text-[#8967e8]",
  },
  {
    label: "Study streak",
    value: "0 days",
    note: "Start your first streak",
    icon: Flame,
    color: "bg-[#ffe9df] text-[#e58b64]",
  },
  {
    label: "Study goals",
    value: "0 / 0",
    note: "Goals completed",
    icon: Target,
    color: "bg-[#ddf6ed] text-[#48a887]",
  },
  {
    label: "Subjects",
    value: "0",
    note: "Ready to get started",
    icon: BookOpen,
    color: "bg-[#e2f3ff] text-[#58a2d4]",
  },
];

const quickActions = [
  {
    title: "Create study plan",
    description: "Organize your upcoming study sessions.",
    icon: CalendarDays,
    color: "bg-[#eee8ff] text-[#8967e8]",
    href: "/planner",
  },
  {
    title: "Generate AI quiz",
    description: "Test your knowledge with AI.",
    icon: Brain,
    color: "bg-[#ffe9df] text-[#df8b67]",
    href: "/ai-study",
  },
  {
    title: "Start focus session",
    description: "Get in the zone with Pomodoro.",
    icon: Play,
    color: "bg-[#ddf6ed] text-[#48a887]",
    href: "/focus",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#a68af3] via-[#9878e8] to-[#c18de6] p-6 text-white shadow-xl shadow-purple-200/60 sm:p-9">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} />
            YOUR PERSONAL STUDY SPACE
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hey there, future achiever! 👋
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
            Your goals are waiting. Let's turn your study plans into
            something amazing, one focused session at a time.
          </p>

          <a
            href="/onboarding"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#805bd7] shadow-lg transition hover:-translate-y-1"
          >
            Personalize your study space
            <ArrowUpRight size={17} />
          </a>
        </div>

        <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-medium text-white/75">
          <Trophy size={15} />
          Every expert was once a beginner.
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Your overview</h2>
            <p className="mt-1 text-xs text-[#9993aa]">
              Your learning journey at a glance
            </p>
          </div>
          <span className="rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#8b83a2]">
            Today
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="glass-panel rounded-[24px] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#9993aa]">
                    {stat.label}
                  </span>
                  <div className={`rounded-xl p-2.5 ${stat.color}`}>
                    <Icon size={19} />
                  </div>
                </div>
                <h3 className="mt-5 text-2xl font-extrabold tracking-tight">
                  {stat.value}
                </h3>
                <p className="mt-1 text-xs text-[#aaa5b8]">{stat.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main dashboard grid */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Daily progress */}
        <div className="glass-panel rounded-[26px] p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Daily study goal</h2>
              <p className="mt-1 text-xs text-[#9993aa]">
                Small steps lead to big achievements.
              </p>
            </div>
            <div className="rounded-xl bg-[#eee8ff] p-2.5 text-[#8967e8]">
              <Target size={20} />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-7 sm:flex-row">
            <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  "conic-gradient(#9875e8 0deg, #eae4f7 0deg)",
              }}
            >
              <div className="flex h-[124px] w-[124px] flex-col items-center justify-center rounded-full bg-[#faf9ff]">
                <span className="text-3xl font-extrabold">0%</span>
                <span className="text-[10px] font-semibold text-[#aaa5b8]">
                  COMPLETED
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold">Your journey begins here!</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#9690a8]">
                Set your daily study goal and start building a consistent
                learning routine.
              </p>
              <a
                href="/onboarding"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#eee8ff] px-4 py-2.5 text-sm font-bold text-[#805bd7] hover:bg-[#e4dbff]"
              >
                Set my study goal <Plus size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Weekly activity */}
        <div className="glass-panel rounded-[26px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Weekly activity</h2>
              <p className="mt-1 text-xs text-[#9993aa]">
                Your study consistency
              </p>
            </div>
            <span className="rounded-lg bg-[#ddf6ed] px-2 py-1 text-[10px] font-bold text-[#48a887]">
              THIS WEEK
            </span>
          </div>

          <div className="mt-8 flex h-36 items-end justify-between gap-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end justify-center rounded-full bg-[#f1edfa]">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-[#9875e8] to-[#c3a9ff]"
                    style={{ height: "4%" }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#aaa5b8]">
                  {day}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-[#aaa5b8]">
            Your activity will appear here.
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold">Make your next move</h2>
          <p className="mt-1 text-xs text-[#9993aa]">
            Everything you need to stay ahead.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <a
                href={action.href}
                key={action.title}
                className="glass-panel group rounded-[24px] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100/60"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl p-3 ${action.color}`}>
                    <Icon size={22} />
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-[#aaa5b8] transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#8967e8]"
                  />
                </div>
                <h3 className="mt-5 font-bold">{action.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#9993aa]">
                  {action.description}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Today's schedule placeholder */}
      <section className="glass-panel rounded-[26px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Today's schedule</h2>
            <p className="mt-1 text-xs text-[#9993aa]">
              Your upcoming learning sessions
            </p>
          </div>
          <CalendarDays size={21} className="text-[#8967e8]" />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-white/35 px-4 py-10 text-center">
          <div className="rounded-2xl bg-[#eee8ff] p-4 text-[#8967e8]">
            <BookOpen size={25} />
          </div>
          <h3 className="mt-4 text-sm font-bold">
            Your schedule is waiting!
          </h3>
          <p className="mt-2 max-w-sm text-xs leading-6 text-[#9993aa]">
            Add your subjects and study preferences to start organizing
            your learning sessions.
          </p>
        </div>
      </section>
    </div>
  );
}
