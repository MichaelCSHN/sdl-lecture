import { Outlet } from 'react-router';
import TopNav from '@/navigation/TopNav';
import MobileNav from '@/navigation/MobileNav';

export default function AppShell() {
  return (
    <div className="min-h-screen" style={{ background: '#000d1d' }}>
      <TopNav />
      <main className="pt-16 pb-20 lg:pb-4">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
