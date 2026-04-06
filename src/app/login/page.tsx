"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, User, ArrowRight, Loader2, Command } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Redireciona para o dashboard principal (admin)
        router.push("/");
        router.refresh();
      } else {
        setError("Usuário ou senha inválidos. Tente novamente.");
      }
    } catch (err) {
      setError("Houve um erro técnico. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 select-none selection:bg-black selection:text-white">
      
      {/* BRANDING (VERCEL STYLE) */}
      <div className="mb-12 flex flex-col items-center animate-in fade-in zoom-in duration-700">
         <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl mb-6 ring-4 ring-slate-50">
            <img src="/logo.png" alt="Sammy3D" className="w-full h-full object-cover rounded-2xl" />
         </div>
         <h1 className="text-2xl font-bold tracking-tighter text-black uppercase">Sammy 3D</h1>
         <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-1">Industrial ERP</p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-sm bg-white border border-slate-100 p-8 rounded-3xl shadow-xl space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
         <div className="space-y-1">
            <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
               Acesso Autenticado <Shield className="h-4 w-4 text-emerald-500" />
            </h2>
            <p className="text-[13px] text-slate-400 font-medium">Insira as credenciais do administrador para operar o sistema.</p>
         </div>

         <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Usuário Operacional</label>
               <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    autoFocus
                    required
                    type="text" 
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-[14px] outline-none focus:bg-white focus:border-black transition-all" 
                    placeholder="ex: sammy3d"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Senha Master</label>
               <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    required
                    type="password" 
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-[14px] outline-none focus:bg-white focus:border-black transition-all" 
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
               </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-tight">{error}</span>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full h-14 bg-black text-white rounded-xl text-[14px] font-bold shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Entrar no Terminal <ArrowRight className="h-4 w-4" /></>}
            </button>
         </form>

         <div className="pt-4 border-t border-slate-50 flex items-center justify-center gap-4 opacity-30 grayscale translate-y-2">
            <Command className="h-4 w-4" />
            <span className="text-[9px] font-black uppercase tracking-[0.5em]">Terminal Vercel Edge</span>
         </div>
      </div>

      <div className="mt-20 flex flex-col items-center gap-2 opacity-10">
         <p className="text-[10px] font-black uppercase tracking-widest">Sammy 3D Laboratório de Manufatura</p>
         <p className="text-[9px] font-mono">Build v123.2.ERP</p>
      </div>
    </div>
  );
}
