"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/company", label: "Company" },
  { href: "/legal", label: "Legal" },
] as const;

export function LandingNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 top-5 z-50 px-4">
      <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between rounded-[999px] border border-slate-200/70 bg-white/78 px-5 py-3 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(8,17,37,0.92),rgba(7,16,36,0.72))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.42)]">
        <div className="pointer-events-none absolute inset-x-20 top-0 h-px bg-linear-to-r from-transparent via-[#59abe7]/35 to-transparent dark:via-[#59abe7]/45" />

        <Link href="/" className="group flex items-center rounded-full px-2 py-1 transition-colors hover:bg-slate-100/70 dark:hover:bg-white/5">
          <div className="mr-3 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-white/75 dark:border-[#59abe7]/30 dark:bg-white/[0.03]">
            <Image src="/Stratum_Labs.png" alt="Stratum Labs" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-base font-semibold text-slate-900 tracking-[0.01em] dark:text-white md:text-lg">
            Stratum <span className="text-[#5ab5e7]">Labs</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/70 bg-slate-100/70 p-1 text-sm font-medium text-slate-700 dark:border-white/6 dark:bg-white/[0.03] dark:text-slate-300">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 transition-all ${
                  isActive
                    ? "border border-slate-200/80 bg-white text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#5663e8] shadow-[0_0_24px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_24px_rgba(86,99,232,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
            Live Swarm Active
          </div>

          <div className="rounded-full border border-slate-200/70 bg-white/70 p-1 dark:border-white/10 dark:bg-white/[0.04]">
            <ThemeToggle />
          </div>
          
          <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-[#5663e8] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-[#59abe7] md:block">
            Login
          </Link>

          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center rounded-full bg-[#5663e8] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[rgba(86,99,232,0.24)] transition-colors hover:bg-[#6570ff]"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
}
