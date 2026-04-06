import type { Metadata } from 'next';
import './globals.css';
// Imports deletados pós-refatoração

export const metadata: Metadata = {
  title: 'SAMMY3D | Gestão Inteligente',
  description: 'Sistema ERP Premium para Impressão 3D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#f8f9fa] text-[#212529] min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
