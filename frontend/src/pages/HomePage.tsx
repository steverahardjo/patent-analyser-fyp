import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import AboutSection from '../components/AboutSection';
import TechStack from '../components/TechStack';

function HomePage() {
  return (
    <main className="w-full h-full overflow-y-auto overflow-x-hidden">
      <div className="min-h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
        <Hero />
        <HowItWorks />
        <AboutSection />
        <TechStack />
      </div>
    </main>
  );
}



export default HomePage;
