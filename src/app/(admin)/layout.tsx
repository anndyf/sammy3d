import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen text-white select-none antialiased bg-[#12151c]">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[260px] relative">
        <Topbar />
        
        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full flex flex-col min-h-[calc(100vh-56px)] px-4 sm:px-6 md:px-10 lg:px-12 pt-20 pb-32 md:py-8">
           <div className="flex-1 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
}
