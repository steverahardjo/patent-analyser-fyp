import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Lightbulb, ChevronLeft, ChevronRight, MessageSquare, Sparkles, Zap } from 'lucide-react';

const steps = [
  {
    title: "Step 1: Upload Eco-Focused Patent",
    description:
      "Begin by uploading your eco-innovation patent (PDF format only). The system works best with text-based files focused on sustainability, energy, waste reduction, or other green solutions.",
    icon: <Upload size={40} className="text-blue-500" />,
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100"
  },
  {
    title: "Step 2: Enter the Chat Workspace",
    description:
      "After upload, you’ll be taken to an interactive chat interface. No setup required—just start exploring your patent with guided buttons or natural language questions.",
    icon: <MessageSquare size={40} className="text-purple-500" />,
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100"
  },
  {
    title: "Step 3a: Classify with TRIZ Principles",
    description:
      "Click 'Classify Claims' to automatically detect the TRIZ principles related to your patent. Each claim is analyzed and labeled to support idea refinement and innovation.",
    icon: <Sparkles size={40} className="text-yellow-500" />,
    color: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-yellow-100"
  },
  {
    title: "Step 3b: Generate a Summary",
    description:
      "Click 'Summarize' to get a concise overview of your patent’s key content and intent. Perfect for quick reviews or sharing insights with others.",
    icon: <Zap size={40} className="text-orange-500" />,
    color: "bg-teal-50 border-teal-200",
    iconBg: "bg-teal-100"
  },
  {
    title: "Step 3c: Ask Questions or Request Charts",
    description:
      "Use the chatbot to ask detailed questions about your patent or generate helpful visualizations like TRIZ breakdown charts—no technical skills required.",
    icon: <Lightbulb size={40} className="text-teal-500" />,
    color: "bg-indigo-50 border-indigo-200",
    iconBg: "bg-indigo-100"
  }
];


const HowItWorks = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 350;
    const currentScroll = scrollContainerRef.current.scrollLeft;
    
    scrollContainerRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How to Use</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our patent analysis chatbot simplifies complex patent research through a seamless three-step process.
          </p>
        </motion.div>

        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none hidden sm:block"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide py-4 px-2 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
                className={`flex-shrink-0 snap-center w-full sm:w-80 md:w-96 border rounded-xl p-6 shadow-sm ${step.color} transition-all duration-300 hover:shadow-md`}
              >
                <div className={`${step.iconBg} rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </motion.div>
            ))}
          </div>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none hidden sm:block"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
        </div>

        <div className="flex justify-center space-x-2 mt-6 sm:hidden">
          <button onClick={() => scroll('left')} className="p-2 bg-gray-200 rounded-full" aria-label="Scroll left">
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <button onClick={() => scroll('right')} className="p-2 bg-gray-200 rounded-full" aria-label="Scroll right">
            <ChevronRight size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;