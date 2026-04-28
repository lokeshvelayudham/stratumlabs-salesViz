"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Activity, Terminal } from "lucide-react";
import { login, providerSignIn } from "@/app/(auth)/actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-[0_0_15px_rgba(86,99,232,0.3)] text-sm font-bold text-white bg-[#5663e8] hover:bg-[#6570ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59abe7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
    >
      {pending ? "Logging in..." : "Log in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-[#5663e8]/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="mb-8 relative z-10 flex flex-col items-center">
        <Link href="/" className="flex justify-center group mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border border-[#59abe7]/30 shadow-[0_0_15px_rgba(86,99,232,0.16)]">
            <Image src="/icon.png" alt="Stratum Labs" width={48} height={48} className="object-cover transition-transform group-hover:scale-110" />
          </div>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Log in to your account
        </h2>
      </div>

      <div className="max-w-100 w-full relative z-10 p-8 sm:p-10 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
        
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-slate-300 mb-2 text-center">Connect to Stratum with:</p>
          <form action={providerSignIn.bind(null, "google")}>
            <button type="submit" className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-700 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </form>
          <form action={providerSignIn.bind(null, "github")}>
            <button type="submit" className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-700 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              GitHub
            </button>
          </form>
          <form action={providerSignIn.bind(null, "microsoft-entra-id")}>
            <button type="submit" className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-700 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path fill="#f3f3f3" d="M0 0h11v11H0z"/><path fill="#f3f3f3" d="M12 0h11v11H12z"/><path fill="#f3f3f3" d="M0 12h11v11H0z"/><path fill="#f3f3f3" d="M12 12h11v11H12z"/></svg>
              Microsoft
            </button>
          </form>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-slate-900 text-slate-400 font-mono tracking-wide">Or continue with Email</span>
          </div>
        </div>

        <form className="space-y-4" action={formAction}>
          {state?.error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-md p-3 text-sm text-rose-400 font-mono flex items-center">
              <Terminal className="w-4 h-4 mr-2" />
              {state.error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2.5 border border-slate-800 rounded-lg bg-slate-900/80 text-white placeholder-slate-500 focus:outline-none focus:ring-[#59abe7] focus:border-[#59abe7] sm:text-sm transition-colors"
              placeholder="youremail@email.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-[#5ab5e7] hover:text-[#8dcff1] transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-3 py-2.5 border border-slate-800 rounded-lg bg-slate-900/80 text-white placeholder-slate-500 focus:outline-none focus:ring-[#59abe7] focus:border-[#59abe7] sm:text-sm transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <SubmitButton />

        </form>

      </div>
      
      <div className="max-w-100 mt-6 text-center z-10">
        <p className="text-sm text-slate-400">
          Don&apos;t have an account? <Link href="/signup" className="font-medium text-[#5ab5e7] hover:text-[#8dcff1] transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
