import { Outlet } from 'react-router';
import TopNav from '@/navigation/TopNav';
import MobileNav from '@/navigation/MobileNav';
import LectureToolbar from '@/components/LectureToolbar';
import { LectureProvider, useLecture } from '@/contexts/LectureContext';

function Shell() {
  const { isLectureMode } = useLecture();
  return (
    <div className="min-h-screen" style={{ background: '#000d1d' }}>
      <LectureToolbar />
      <div style={{ paddingTop: isLectureMode ? 40 : 0 }}>
        <TopNav />
        <main className="pt-16 pb-20 lg:pb-4">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function AppShell() {
  return (
    <LectureProvider>
      <Shell />
    </LectureProvider>
  );
}
