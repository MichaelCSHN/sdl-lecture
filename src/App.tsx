import SideNav from './components/SideNav';
import HomeSection from './sections/HomeSection';
import BackgroundSection from './sections/BackgroundSection';
import ConceptSection from './sections/ConceptSection';
import CaseStudySection from './sections/CaseStudySection';
import DemoSection from './sections/DemoSection';
import ChallengesSection from './sections/ChallengesSection';
import ResourcesSection from './sections/ResourcesSection';

export default function App() {
  return (
    <div className="relative" style={{ background: '#000d1d' }}>
      <SideNav />
      <HomeSection />
      <BackgroundSection />
      <ConceptSection />
      <CaseStudySection />
      <DemoSection />
      <ChallengesSection />
      <ResourcesSection />
    </div>
  );
}
