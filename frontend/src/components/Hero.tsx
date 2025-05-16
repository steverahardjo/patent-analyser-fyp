import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const scrollToNextSection = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
  <section className="h-[800px] px-6 md:px-20 pt-6 flex flex-col md:flex-row items-start justify-between relative overflow-hidden">
      {/* Left: Text Content (25%) */}
        <div className="w-full md:w-[30%] z-10 mt-[70px]">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
        >
          Patent Analyzer Chatbot
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mb-8"
        >
          <span className="text-xl sm:text-2xl md:text-3xl text-blue-600 font-medium leading-snug">
            <TypeAnimation
              sequence={[
                'Analyze',
                1000,
                'Analyze • Classify',
                1000,
                'Analyze • Classify • Summarize',
                1000,
                'Analyze • Classify • Summarize • Discover with AI.',
                2000,
              ]}
              speed={50}
              repeat={Infinity}
            />
          </span>
        </motion.div>

        <motion.button
          onClick={scrollToNextSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Explore Now
        </motion.button>
      </div>

      {/* Right: Lottie Animation (75%) */}
      <div className="w-full md:w-[70%] flex items-start justify-end z-0 mt-[-130px] mr-[-90px] ">


        <DotLottieReact
          src="https://lottie.host/e4129f56-88dc-48fd-8270-90267776aebe/C5hksay2TH.lottie"
          loop
          autoplay
          style={{
            width: 'auto',
            height: '750px',
            maxWidth: '130%',
            transform: 'scale(1.35)',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Scroll Chevron */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 cursor-pointer z-0 "
        onClick={scrollToNextSection}
      >
        <ChevronDown size={36} className="text-blue-500 animate-bounce" />
      </motion.div>
    </section>
  );
};

export default Hero;
