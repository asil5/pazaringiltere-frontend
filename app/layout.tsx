import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Pazar İngiltere — UK\'de Türkçe Alışveriş',
  description: 'İngiltere\'deki Türk topluluğu için alışveriş platformu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            © 2026 Pazar İngiltere · pazaringiltere.co.uk
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
