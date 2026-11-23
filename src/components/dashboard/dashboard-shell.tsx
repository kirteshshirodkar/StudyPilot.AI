
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Brain,
  Timer,
  ChartNoAxesCombined,
  Flag,
  Settings,
  Sparkles,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Plus,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Planner", href: "/planner", icon: CalendarDays },
  { label: "My Subjects", href: "/subjects", icon: BookOpen },
  { label: "AI Study Buddy", href: "/ai-study", icon: Brain },
  { label: "Focus Room", href: "/focus", icon: Timer },
  { label: "My Progress", href: "/progress", icon: ChartNoAxesCombined },
  { label: "Deadlines", href: "/deadlines", icon: Flag },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen text-[#292540]">
      {/* Ambient background */}
      <div className="ambient-orb bg-purple-200/50 w-72 h-72 -top-20 -left-20" />
      <div className="ambient-orb bg-cyan-200/40 w-72 h-72 top-40 right-0" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#292540]/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`glass-sidebar fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col p-5 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a58af5] to-[#7955dc] text-white shadow-lg shadow-purple-200">
              <Sparkles size={23} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                StudyPilot<span className="text-[#8d69e7]">.</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#9691aa]">
                Your AI study space
              </p>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded-xl p-2 hover:bg-purple-50"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#aaa5ba]">
          Workspace
        </div>

        <nav className="flex flex-col gap-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#9472eb] to-[#ad8bf0] text-white shadow-lg shadow-purple-200/70"
                    : "text-[#77728e] hover:bg-white/80 hover:text-[#805cda]"
                }`}
              >
                <Icon size={19} />
                {item.label}
                {item.label === "AI Study Buddy" && (
                  <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[9px] ${
                    active ? "bg-white/20 text-white" : "bg-purple-100 text-purple-600"
                  }`}>
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="mb-4 rounded-3xl bg-gradient-to-br from-[#eee8ff] via-[#f4edff] to-[#e5f7ff] p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#936ce5] shadow-sm">
              <Sparkles size={19} />
            </div>
            <h3 className="text-sm font-bold">Your next level awaits!</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#77728e]">
              Build a study routine and make every session count.
            </p>
            <Link
              href="/planner"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-[#815ed8] shadow-sm transition hover:-translate-y-0.5"
            >
              Create a study plan <Plus size={14} />
            </Link>
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#77728e] hover:bg-white/80"
          >
            <Settings size={19} />
            Settings
          </Link>

          <div className="mt-3 flex items-center gap-3 border-t border-purple-100/80 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f6c9db] to-[#d9c5ff] text-sm font-bold text-[#6546a5]">
              S
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">Student</p>
              <p className="text-xs text-[#9993aa]">StudyPilot member</p>
            </div>
            <ChevronDown size={17} className="text-[#9993aa]" />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="relative z-10 min-h-screen lg:pl-[260px]">
        <header className="glass-panel sticky top-0 z-30 mx-3 mt-3 flex h-[72px] items-center justify-between rounded-2xl px-4 sm:mx-6 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-[#77728e] hover:bg-purple-50 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="hidden items-center gap-2 rounded-xl bg-[#f5f2fc] px-4 py-2.5 sm:flex">
              <Search size={17} className="text-[#9993aa]" />
              <input
                placeholder="Search anything..."
                className="w-44 bg-transparent text-sm outline-none placeholder:text-[#aaa5b8]"
              />
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-[#9993aa]">
                /
              </span>
            </div>

            <div className="sm:hidden">
              <p className="text-sm font-bold">StudyPilot AI</p>
              <p className="text-[10px] text-[#9993aa]">Your study space</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-[#9993aa] md:block">
              Your journey starts today ✨
            </span>

            <button
              className="relative rounded-xl bg-white/80 p-3 text-[#77728e] shadow-sm transition hover:text-[#8967e8]"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f39b9b] ring-2 ring-white" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c7b5ff] to-[#f7c8d9] text-sm font-bold text-[#6546a5]">
              S
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
