"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
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
  UserRound,
  LogOut,
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

type DashboardShellProps = {
  children: React.ReactNode;
  userName: string;
  userImage: string | null;
};

export default function DashboardShell({
  children,
  userName,
  userImage,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openUserProfile, signOut } = useClerk();

  const [activeAccountMenu, setActiveAccountMenu] = useState<
    "sidebar" | "topbar" | null
  >(null);
  const sidebarAccountRef = useRef<HTMLDivElement>(null);
  const topbarAccountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        !sidebarAccountRef.current?.contains(target) &&
        !topbarAccountRef.current?.contains(target)
      ) {
        setActiveAccountMenu(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveAccountMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleManageAccount = () => {
    setActiveAccountMenu(null);
    openUserProfile();
  };

  const handleSignOut = async () => {
    setActiveAccountMenu(null);
    await signOut({ redirectUrl: "/sign-in" });
  };

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
                  <span
                    className={`ml-auto rounded-md px-1.5 py-0.5 text-[9px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
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

          <div
            ref={sidebarAccountRef}
            className="relative mt-3 border-t border-purple-100/80 pt-4"
          >
            <button
              type="button"
              onClick={() =>
                setActiveAccountMenu((current) =>
                  current === "sidebar" ? null : "sidebar",
                )
              }
              aria-expanded={activeAccountMenu === "sidebar"}
              aria-haspopup="menu"
              className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-white/80"
            >
              <UserAvatar userName={userName} userImage={userImage} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#29243b]">
                  {userName}
                </p>
                <p className="text-xs text-[#9993aa]">StudyPilot member</p>
              </div>

              <ChevronDown
                size={17}
                className={`text-[#9993aa] transition-transform ${
                  activeAccountMenu === "sidebar" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeAccountMenu === "sidebar" && (
              <AccountDropdown
                userName={userName}
                userImage={userImage}
                onManageAccount={handleManageAccount}
                onSignOut={handleSignOut}
              />
            )}
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

            <div ref={topbarAccountRef} className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveAccountMenu((current) =>
                    current === "topbar" ? null : "topbar",
                  )
                }
                aria-expanded={activeAccountMenu === "topbar"}
                aria-haspopup="menu"
                aria-label="Open account menu"
                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-purple-50"
              >
                <UserAvatar
                  userName={userName}
                  userImage={userImage}
                  size="md"
                />

                <ChevronDown
                  size={15}
                  className={`hidden text-[#9993aa] transition-transform sm:block ${
                    activeAccountMenu === "topbar" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeAccountMenu === "topbar" && (
                <div className="absolute right-0 top-full z-[70] mt-3 w-64">
                  <AccountDropdown
                    userName={userName}
                    userImage={userImage}
                    placement="below"
                    onManageAccount={handleManageAccount}
                    onSignOut={handleSignOut}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function UserAvatar({
  userName,
  userImage,
  size = "md",
}: {
  userName: string;
  userImage: string | null;
  size?: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#a58af5] to-[#7955dc] font-bold text-white shadow-md ${dimensions}`}
    >
      {userImage ? (
        <Image
          src={userImage}
          alt={`${userName}'s profile`}
          fill
          unoptimized
          sizes={size === "sm" ? "36px" : "40px"}
          className="object-cover"
        />
      ) : (
        userName.trim().charAt(0).toUpperCase() || "S"
      )}
    </div>
  );
}

function AccountDropdown({
  userName,
  userImage,
  onManageAccount,
  onSignOut,
  placement = "above",
}: {
  userName: string;
  userImage: string | null;
  onManageAccount: () => void;
  onSignOut: () => void;
  placement?: "above" | "below";
}) {
  return (
    <div
      className={`absolute right-0 z-[70] w-64 overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-2 shadow-2xl shadow-purple-200/50 backdrop-blur-2xl ${
        placement === "above" ? "bottom-full mb-3" : "top-full mt-3"
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#f4efff] to-[#eefaff] p-3">
        <UserAvatar userName={userName} userImage={userImage} size="md" />

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#29243b]">
            {userName}
          </p>
          <p className="text-xs text-[#9993aa]">StudyPilot member</p>
        </div>
      </div>

      <div className="my-2 h-px bg-purple-100" />

      <button
        type="button"
        onClick={onManageAccount}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#77728e] transition hover:bg-purple-50 hover:text-[#805cda]"
      >
        <UserRound size={17} />
        Manage account
      </button>

      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
      >
        <LogOut size={17} />
        Sign out
      </button>
    </div>
  );
}
