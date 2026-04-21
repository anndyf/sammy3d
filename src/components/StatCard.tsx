"use client"

import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDir?: "up" | "down" | "neutral";
  icon: LucideIcon;
  variant?: "primary" | "danger" | "success" | "warning" | "info" | "secondary";
  className?: string;
}

const variants = {
  primary: "text-[#0d6efd]",
  danger: "text-[#dc3545]",
  success: "text-[#198754]",
  warning: "text-[#ffc107]",
  info: "text-[#0dcaf0]",
  secondary: "text-[#6c757d]"
};

export function StatCard({ 
  label, 
  value, 
  trend, 
  trendDir = "neutral",
  icon: Icon, 
  variant = "primary",
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all group flex flex-col justify-between h-40",
      className
    )}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">{label}</h6>
          <h2 className="text-3xl font-black text-white tracking-tighter font-mono">{value}</h2>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-all">
          <Icon className={cn("h-5 w-5", 
            variant === 'primary' ? "text-blue-500" :
            variant === 'success' ? "text-emerald-500" :
            variant === 'danger' ? "text-red-500" :
            variant === 'warning' ? "text-amber-500" : "text-white"
          )} />
        </div>
      </div>
      
      {trend && (
        <div className={cn(
          "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
          trendDir === "up" ? "text-emerald-500" : trendDir === "down" ? "text-red-500" : "text-slate-500"
        )}>
          {trendDir === "up" && <ArrowUpRight className="h-3 w-3" />}
          {trendDir === "down" && <ArrowDownRight className="h-3 w-3" />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
