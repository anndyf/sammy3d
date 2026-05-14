"use client"

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Topbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute top-6 right-8 z-50 pointer-events-none flex justify-end">
       <Link href="/notifications" className="relative p-2.5 bg-[#1a1d24] border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all shadow-lg pointer-events-auto">
          <Bell className="h-5 w-5 text-cyan-400" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a1d24]"></div>
       </Link>
    </div>
  );
}
