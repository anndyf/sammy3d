"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, User, ArrowRight, Loader2 } from "lucide-react";
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
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Usuário ou senha inválidos.");
      }
    } catch (err) {
      setError("Erro técnico na conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] flex flex-col items-center justify-center p-6 select-none overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>

      {/* BRANDING */}
      <div className="mb-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000 relative z-10">
         <div className="w-24 h-24 rounded-2xl bg-[#1e293b] border-2 border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,211,238,0.15)] relative overflow-hidden group">
            {/* Custom CSS Kitty Logo */}
            <div className="relative w-14 h-14 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
               <div className="absolute -top-1 -left-1 w-5 h-5 bg-cyan-400 rotate-[-15deg] rounded-sm"></div>
               <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rotate-[15deg] rounded-sm"></div>
               <div className="w-full h-full bg-cyan-400 rounded-xl relative z-10 flex flex-col items-center justify-center border-2 border-black/10">
                  <div className="absolute -top-5 w-8 h-5 flex gap-0.5 items-end">
                     <div className="w-2 h-2.5 bg-amber-400 rounded-t-sm"></div>
                     <div className="w-2 h-4 bg-amber-400 rounded-t-sm"></div>
                     <div className="w-2 h-2.5 bg-amber-400 rounded-t-sm"></div>
                  </div>
                  <div className="flex gap-2.5 mb-1.5">
                     <div className="text-[12px] font-black text-black select-none leading-none">X</div>
                     <div className="text-[12px] font-black text-black select-none leading-none">X</div>
                  </div>
                  <div className="w-4 h-1 border-b-2 border-black/30 rounded-full"></div>
               </div>
            </div>
         </div>
         <h1 className="text-3xl font-black tracking-[0.1em] text-white uppercase mb-1 drop-shadow-sm">Sammy 3D</h1>
         <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em]">Industrial ERP</p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-sm bg-[#14161b] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-8 animate-in slide-in-from-bottom-8 duration-1000 relative z-10">
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
               Acesso Autenticado <Shield className="h-5 w-5 text-cyan-400" />
            </h2>
            <p className="text-[12px] text-slate-500 font-bold leading-relaxed">Insira as credenciais do administrador para operar o sistema.</p>
         </div>

         <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Usuário Operacional</label>
               <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    autoFocus
                    required
                    type="text" 
                    className="w-full h-14 bg-[#0a0b0e] border border-white/5 rounded-2xl pl-12 pr-4 text-sm text-white caret-white font-medium outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800 force-white-text" 
                    placeholder="ex: sammy3d"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Senha Master</label>
               <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    required
                    type="password" 
                    className="w-full h-14 bg-[#0a0b0e] border border-white/5 rounded-2xl pl-12 pr-4 text-sm text-white caret-white font-medium outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800 force-white-text" 
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
               </div>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[11px] font-black text-red-400 uppercase tracking-tight">{error}</span>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full h-16 bg-white text-black rounded-2xl text-[15px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(255,255,255,0.05)] hover:bg-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Entrar no Terminal 
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
         </form>

         <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4 opacity-10">
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap">Sammy 3D Labs</span>
            <div className="h-px bg-white/20 flex-1"></div>
         </div>
      </div>

      <div className="mt-12 opacity-5 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Encrypted Terminal V.2.0</p>
      </div>
    </div>
  );
}
