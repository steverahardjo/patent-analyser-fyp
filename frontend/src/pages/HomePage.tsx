import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import AboutSection from '../components/AboutSection';

function HomePage() {
  return (
    <main className="w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
        <Hero />
        <HowItWorks />
        <AboutSection />
      </div>
    </main>
  );
}

export default HomePage;
