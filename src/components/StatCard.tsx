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
      "bs-card p-4",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h6 className="text-secondary text-sm font-semibold mb-1 uppercase tracking-wider">{label}</h6>
          <h2 className="text-3xl font-bold mb-2 text-dark">{value}</h2>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm",
              trendDir === "up" ? "text-success" : trendDir === "down" ? "text-danger" : "text-secondary"
            )}>
              {trendDir === "up" && <ArrowUpRight className="h-4 w-4" />}
              {trendDir === "down" && <ArrowDownRight className="h-4 w-4" />}
              <span>{trend}</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-gray-50 rounded">
          <Icon className={cn("h-6 w-6", variants[variant])} />
        </div>
      </div>
    </div>
  );
}
