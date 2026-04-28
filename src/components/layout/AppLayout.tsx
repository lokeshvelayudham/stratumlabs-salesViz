"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  PlayCircle, 
  Mail, 
  PlusCircle, 
  Settings, 
  Activity,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { signoutAction } from "@/app/(auth)/actions";

type SidebarUser = {
  name: string;
  email: string;
  image: string | null;
  initials: string;
  planName: string;
  planDetail: string;
};

const NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Pipeline", href: "/pipeline", icon: PlayCircle },
  { name: "Outreach", href: "/outreach", icon: Mail },
  { name: "Manual Intake", href: "/manual-intake", icon: PlusCircle },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Activity", href: "/activity", icon: Activity },
];

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup", "/products", "/company", "/legal"]);

const FALLBACK_USER: SidebarUser = {
  name: "Admin User",
  email: "Authenticated workspace",
  image: null,
  initials: "A",
  planName: "Core Workspace",
  planDetail: "Connected access",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<SidebarUser>(FALLBACK_USER);
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

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
    <div className="flex min-h-screen bg-[#061024]/95 text-slate-50 font-sans">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-200 h-200 bg-[#5663e8]/12 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#081125]/78 backdrop-blur-xl border-r border-white/5 flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 overflow-hidden border border-[#59abe7]/35 shrink-0">
            <Image src="/Stratum_Labs.png" alt="Stratum Labs" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-lg font-bold text-slate-50 tracking-tight">Stratum Labs</span>
        </div>
        
        <div className="p-4 flex-1">
          <div className="text-[10px] font-bold font-mono text-[#59abe7]/80 uppercase tracking-widest mb-4 px-2">
            // Main_Menu
          </div>
          <nav className="space-y-1 font-mono text-xs">
            {NAVIGATION.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#5663e8]/12 text-[#5ab5e7] border border-[#59abe7]/30 shadow-[0_0_15px_rgba(86,99,232,0.16)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Icon className={`mr-3 shrink-0 h-4 w-4 ${isActive ? "text-[#5ab5e7]" : "text-slate-500"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="rounded-2xl border border-[#59abe7]/18 bg-[#5663e8]/10 px-3 py-3 shadow-[0_0_24px_rgba(86,99,232,0.12)]">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0 border border-[#59abe7]/40">
                <AvatarImage src={currentUser.image ?? ""} />
                <AvatarFallback className="bg-slate-900 text-[#5ab5e7] font-mono text-xs">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-100 truncate">{currentUser.name}</div>
                <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                <div className="mt-2 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#081125]/80 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#5ab5e7]">
                  {currentUser.planName}
                </div>
                <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 truncate">
                  {currentUser.planDetail}
                </div>
              </div>
            </div>
          </div>
          <form action={signoutAction}>
            <button
              type="submit"
              className="w-full flex items-center px-3 py-2.5 font-mono text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 rounded-lg transition-all duration-200"
            >
              <LogOut className="mr-3 h-4 w-4 text-slate-500" />
              Terminate_Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 flex-1 flex flex-col min-h-screen w-full relative z-10">
        {/* Top Header */}
        <header className="h-16 bg-[#081125]/76 backdrop-blur-md flex items-center justify-between px-6 border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center md:hidden">
            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 overflow-hidden border border-[#59abe7]/35 shrink-0">
              <Image src="/Stratum_Labs.png" alt="Stratum Labs" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-lg font-bold">Stratum Labs</span>
          </div>
          <div className="hidden md:flex flex-1">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 font-mono text-[10px] text-[#5ab5e7] tracking-widest shadow-[0_0_18px_rgba(86,99,232,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
              sys.status: online
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2 max-w-40">
              <Avatar className="h-8 w-8 border border-[#59abe7]/40">
                <AvatarImage src={currentUser.image ?? ""} />
                <AvatarFallback className="bg-slate-800 text-[#5ab5e7] font-mono text-xs">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-100 truncate">{currentUser.name}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#59abe7]/75 truncate">{currentUser.planName}</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
