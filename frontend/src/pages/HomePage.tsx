import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import AboutSection from '../components/AboutSection';
import TechStack from '../components/TechStack';

function HomePage() {
  return (
    <main className="w-full h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20 scroll-smooth">
        <Hero />
        <HowItWorks />
        <AboutSection />
        <TechStack />
      </div>
    </main>
  );
}


export default HomePage;
