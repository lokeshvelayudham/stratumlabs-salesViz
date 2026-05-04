"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Bot,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Inbox,
  Users, 
  PlayCircle, 
  Mail, 
  PlusCircle, 
  Settings, 
  Activity,
  ShieldUser,
  Sparkles,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { signoutAction } from "@/app/(auth)/actions";

type SidebarUser = {
  name: string;
  email: string;
  image: string | null;
  initials: string;
  planName: string;
  planDetail: string;
  isSuperAdmin: boolean;
  organizationName: string | null;
  organizationRole: string;
  processAccess: boolean;
};

const PROCESS_NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Swarm", href: "/swarm", icon: Bot },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Pipeline", href: "/pipeline", icon: PlayCircle },
  { name: "Outreach", href: "/outreach", icon: Mail },
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Manual Intake", href: "/manual-intake", icon: PlusCircle },
  { name: "Activity", href: "/activity", icon: Activity },
] as const;

const ACCOUNT_NAVIGATION = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Organization", href: "/organization", icon: Building2 },
] as const;

const ADMIN_NAVIGATION = { name: "Admin", href: "/admin", icon: ShieldUser };
const PROCESS_ROUTE_PREFIXES = ["/dashboard", "/swarm", "/leads", "/pipeline", "/outreach", "/inbox", "/manual-intake", "/activity"];

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup", "/products", "/pricing", "/company", "/legal"]);
const SIDEBAR_COLLAPSE_STORAGE_KEY = "stratum.sidebar.collapsed";

const FALLBACK_USER: SidebarUser = {
  name: "Admin User",
  email: "Authenticated workspace",
  image: null,
  initials: "A",
  planName: "Launch",
  planDetail: "2 active swarms · Workspace",
  isSuperAdmin: false,
  organizationName: "Workspace",
  organizationRole: "OWNER",
  processAccess: true,
};

const USER_MENU_LINKS = [
  { name: "User settings", href: "/settings", icon: Settings },
  { name: "Organization", href: "/organization", icon: Building2 },
  { name: "Choose plan", href: "/pricing#plans", icon: CreditCard },
  { name: "Upgrade plan", href: "/pricing#enterprise-flow", icon: Sparkles },
] as const;

function UserAvatarMenu({
  currentUser,
  variant,
  collapsed = false,
}: {
  currentUser: SidebarUser;
  variant: "sidebar" | "header";
  collapsed?: boolean;
}) {
  const isHeader = variant === "header";
  const isCollapsedSidebar = variant === "sidebar" && collapsed;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={isHeader
          ? "flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/72 px-2.5 py-1.5 text-left transition-all duration-200 hover:border-[#59abe7]/30 hover:bg-white dark:border-white/10 dark:bg-white/4 dark:hover:bg-white/7"
          : isCollapsedSidebar
            ? "flex w-full items-center justify-center rounded-2xl border border-slate-200/70 bg-[#5663e8]/8 px-2 py-3 text-left shadow-[0_0_24px_rgba(86,99,232,0.08)] transition-all duration-200 hover:border-[#59abe7]/30 hover:bg-[#5663e8]/12 dark:border-[#59abe7]/18 dark:bg-[#5663e8]/10 dark:shadow-[0_0_24px_rgba(86,99,232,0.12)] dark:hover:bg-[#5663e8]/14"
            : "flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-[#5663e8]/8 px-3 py-3 text-left shadow-[0_0_24px_rgba(86,99,232,0.08)] transition-all duration-200 hover:border-[#59abe7]/30 hover:bg-[#5663e8]/12 dark:border-[#59abe7]/18 dark:bg-[#5663e8]/10 dark:shadow-[0_0_24px_rgba(86,99,232,0.12)] dark:hover:bg-[#5663e8]/14"
        }
        title={isCollapsedSidebar ? currentUser.name : undefined}
        aria-label={isCollapsedSidebar ? `Open account menu for ${currentUser.name}` : undefined}
      >
        <Avatar
          size={isHeader ? "default" : "lg"}
          className="shrink-0 rounded-full border border-[#59abe7]/40 bg-white ring-2 ring-white/70 dark:bg-slate-900 dark:ring-[#081125]"
        >
          <AvatarImage src={currentUser.image ?? ""} />
          <AvatarFallback className="bg-white text-[#5663e8] font-mono text-xs dark:bg-slate-900 dark:text-[#5ab5e7]">
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>

        {!isCollapsedSidebar ? (
          <>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{currentUser.name}</div>
              <div className="truncate text-xs text-slate-600 dark:text-slate-400">
                {isHeader ? currentUser.planName : currentUser.email}
              </div>
              {!isHeader ? (
                <div className="mt-2 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-white/80 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#5663e8] dark:bg-[#081125]/80 dark:text-[#5ab5e7]">
                  {currentUser.planName}
                </div>
              ) : null}
              {!isHeader ? (
                <div className="mt-1 truncate text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  {currentUser.isSuperAdmin ? `SUPER_ADMIN · ${currentUser.planDetail}` : currentUser.planDetail}
                </div>
              ) : null}
            </div>

            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
          </>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side={isHeader ? "bottom" : "top"}
        sideOffset={10}
        className="min-w-64 border-slate-200 bg-white/98 p-1.5 text-slate-700 shadow-[0_24px_60px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#081125]/96 dark:text-slate-200"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <Avatar
                size="lg"
                className="shrink-0 rounded-full border border-[#59abe7]/40 bg-white ring-2 ring-white/70 dark:bg-slate-900 dark:ring-[#081125]"
              >
                <AvatarImage src={currentUser.image ?? ""} />
                <AvatarFallback className="bg-white text-[#5663e8] font-mono text-xs dark:bg-slate-900 dark:text-[#5ab5e7]">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{currentUser.name}</div>
                <div className="truncate text-xs text-slate-600 dark:text-slate-400">{currentUser.email}</div>
                <div className="mt-2 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[#5663e8] dark:text-[#5ab5e7]">
                  {currentUser.planName}
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-slate-200/70 dark:bg-white/10" />

        {USER_MENU_LINKS.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={item.name}
              className="cursor-pointer px-3 py-2 focus:bg-slate-100 focus:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-slate-100"
            >
              <Link href={item.href} className="flex w-full items-center gap-2.5">
                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="bg-slate-200/70 dark:bg-white/10" />

        <form action={signoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<SidebarUser>(FALLBACK_USER);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY) === "true";
  });
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const canViewProcess = currentUser.processAccess || currentUser.isSuperAdmin;
  const isProcessRoute = PROCESS_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const navigation = [
    ...(canViewProcess ? PROCESS_NAVIGATION : []),
    ...ACCOUNT_NAVIGATION,
    ...(currentUser.isSuperAdmin ? [ADMIN_NAVIGATION] : []),
  ];

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, isSidebarCollapsed ? "true" : "false");
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (isPublicRoute) return;

    let ignore = false;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/session-user", { cache: "no-store" });
        if (!response.ok) return;

        const user = (await response.json()) as SidebarUser | null;
        if (!ignore && user) {
          setCurrentUser(user);
        }
      } catch {
        // Leave the shell fallback in place if user hydration fails.
      }
    };

    void loadCurrentUser();

    return () => {
      ignore = true;
    };
  }, [isPublicRoute, pathname]);

  // If it's a landing/marketing page, don't show the app layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f7f9ff] text-slate-950 font-sans dark:bg-[#061024]/95 dark:text-slate-50">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-200 h-200 bg-[#5663e8]/12 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className={`fixed z-20 hidden h-full flex-col border-r border-slate-200/70 bg-white/82 backdrop-blur-xl transition-[width] duration-200 dark:border-white/5 dark:bg-[#081125]/78 md:flex ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
        <div className={`flex h-16 items-center border-b border-slate-200/70 dark:border-white/5 ${isSidebarCollapsed ? "justify-center px-0" : "px-6"}`}>
          <div className={`${isSidebarCollapsed ? "mr-0" : "mr-2"} flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-white/75 dark:border-[#59abe7]/35 dark:bg-white/3`}>
            <Image src="/Stratum_Labs.png" alt="Stratum Labs" width={24} height={24} className="object-contain" />
          </div>
          {!isSidebarCollapsed ? (
            <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">Stratum Labs</span>
          ) : null}
        </div>
        
        <div className={`${isSidebarCollapsed ? "px-2 py-4" : "p-4"} flex-1`}>
          {!isSidebarCollapsed ? (
            <div className="mb-4 px-2 text-[10px] font-bold font-mono uppercase tracking-widest text-[#59abe7]/80">
              {"// Main_Menu"}
            </div>
          ) : null}
          <nav className="space-y-1 font-mono text-xs">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`flex items-center rounded-lg font-medium transition-all duration-200 ${isSidebarCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"} ${
                    isActive
                      ? "bg-[#5663e8]/12 text-[#5ab5e7] border border-[#59abe7]/30 shadow-[0_0_15px_rgba(86,99,232,0.16)]"
                      : "border border-transparent text-slate-600 hover:bg-[#5663e8]/8 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`${isSidebarCollapsed ? "mr-0" : "mr-3"} h-4 w-4 shrink-0 ${isActive ? "text-[#5ab5e7]" : "text-slate-500 dark:text-slate-500"}`} />
                  {!isSidebarCollapsed ? item.name : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`${isSidebarCollapsed ? "px-2 py-4" : "p-4"} border-t border-slate-200/70 dark:border-white/5`}>
          <UserAvatarMenu currentUser={currentUser} variant="sidebar" collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"} relative z-10 flex min-h-screen w-full flex-1 flex-col transition-[padding] duration-200`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/76 px-6 backdrop-blur-md dark:border-white/5 dark:bg-[#081125]/76">
          <div className="flex items-center md:hidden">
            <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-white/75 dark:border-[#59abe7]/35 dark:bg-white/3">
              <Image src="/Stratum_Labs.png" alt="Stratum Labs" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-lg font-bold text-slate-950 dark:text-white">Stratum Labs</span>
          </div>
          <div className="hidden md:flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/72 text-slate-600 transition-colors hover:border-[#59abe7]/30 hover:text-[#5663e8] dark:border-white/10 dark:bg-white/4 dark:text-slate-300 dark:hover:text-[#5ab5e7]"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 font-mono text-[10px] text-[#5ab5e7] tracking-widest shadow-[0_0_18px_rgba(86,99,232,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
              sys.status: online
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <UserAvatarMenu currentUser={currentUser} variant="header" />
            </div>
            <div className="rounded-full border border-slate-200/70 bg-white/72 p-1 dark:border-white/10 dark:bg-white/4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {!canViewProcess && isProcessRoute ? (
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200/70 bg-white/78 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/55">
              <div className="inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#5663e8] dark:text-[#5ab5e7]">
                process access required
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">This user can’t view the live swarm process yet.</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Ask an organization owner or admin to enable process access for this account inside the Organization page. Until then, this user can manage their account and view organization details only.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/organization" className="inline-flex items-center justify-center rounded-full bg-[#5663e8] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#6570ff] shadow-lg shadow-[rgba(86,99,232,0.24)]">
                  Open Organization
                </Link>
                <Link href="/settings" className="inline-flex items-center justify-center rounded-full border border-slate-200/80 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-white/70 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
                  Open Settings
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
