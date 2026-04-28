import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export function LandingNavbar() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <nav className="flex items-center justify-between px-6 py-4 rounded-full border border-[#59abe7]/25 bg-[#071024]/84 backdrop-blur-xl shadow-lg shadow-[rgba(86,99,232,0.16)]">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden border border-[#59abe7]/30">
            <Image src="/icon.png" alt="Stratum Labs" width={32} height={32} className="object-cover" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Stratum <span className="text-[#5ab5e7]">Labs</span>
          </span>
        </Link>

        {/* Center Links - Desktop Only */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/products" className="hover:text-[#59abe7] transition-colors">
            Products
          </Link>
          <Link href="/company" className="hover:text-[#59abe7] transition-colors">
            Company
          </Link>
          <Link href="/legal" className="hover:text-[#59abe7] transition-colors">
            Legal
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center px-4 py-1.5 rounded-full border border-[#59abe7]/30 text-[#5ab5e7] text-[10px] uppercase tracking-widest font-mono bg-[#5663e8]/10 shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
            Live Swarm Active
          </div>
          
          <Link href="/login" className="hidden md:block text-sm font-medium text-slate-300 hover:text-[#59abe7] transition-colors">
            Login
          </Link>

          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold text-white bg-[#5663e8] hover:bg-[#6570ff] transition-colors rounded-full shadow-lg shadow-[rgba(86,99,232,0.24)]"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
}
