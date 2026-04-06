import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white text-slate-900 select-none antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[240px] relative">
        <Topbar />
        
        {/* VERCEL CONTENT AREA: INCREASED MAX PADDING FOR EXTREME BREATHING ROOM */}
        <main className="flex-1 w-full flex flex-col min-h-[calc(100vh-56px)] px-6 md:px-12 lg:px-24 xl:px-32 py-12">
           <div className="flex-1 max-w-[1200px] w-full mx-auto animate-in fade-in duration-500">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
}
