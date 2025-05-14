import { useRef, useEffect } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import ChartsSection from '../components/ChartsSection';
import AboutSection from '../components/AboutSection';
import TechStack from '../components/TechStack';
import Footer from '../components/Footer';

function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scrollAmount = e.deltaY;
      container.scrollTop += scrollAmount;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-b from-gray-50 to-gray-100 scroll-smooth"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#CBD5E1 transparent'
      }}
    >
      <Hero />
      <HowItWorks />
      <ChartsSection />
      <AboutSection />
      <TechStack />
    </div>
  );
}

export default HomePage;