import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, Search, Zap, FileSearch } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const AccordionItem = ({ title, children, icon }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 px-4 text-left focus:outline-none"
      >
        <div className="flex items-center">
          <div className="mr-4">
            {icon}
          </div>
          <span className="text-lg font-medium text-gray-900">{title}</span>
        </div>
        <span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-0 text-gray-600">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const AboutSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About Our Technology</h2>
          <p className="text-lg text-gray-600">
            Our patent analysis chatbot leverages advanced AI techniques to provide deep insights into patent documents.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true, amount: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <AccordionItem 
            title="TRIZ Principle Classification" 
            icon={<Lightbulb size={24} className="text-yellow-500" />}
          >
            <p>
              Our system automatically identifies which of the 40 TRIZ innovation principles are present in patent documents. TRIZ (Theory of Inventive Problem Solving) is a problem-solving methodology developed by Genrich Altshuller that systematizes innovation processes.
            </p>
            <p className="mt-2">
              By mapping patents to TRIZ principles, we help inventors understand the innovation patterns in their field and identify potential new directions for research and development.
            </p>
          </AccordionItem>

          <AccordionItem 
            title="AI-Powered Similarity Analysis" 
            icon={<Search size={24} className="text-blue-500" />}
          >
            <p>
              Using advanced embedding techniques and machine learning algorithms, our system can find patents similar to the one you're analyzing. This helps identify potential prior art, infringement risks, or collaboration opportunities.
            </p>
            <p className="mt-2">
              The similarity analysis considers not just keywords but the semantic meaning of patent claims and descriptions, providing much more accurate results than traditional keyword-based searches.
            </p>
          </AccordionItem>
{/* 
          <AccordionItem 
            title="Natural Language Processing" 
            icon={<Zap size={24} className="text-purple-500" />}
          >
            <p>
              Our system uses state-of-the-art natural language processing models to analyze patent text, extract key concepts, and generate human-readable summaries. This makes complex patent documents more accessible and understandable.
            </p>
            <p className="mt-2">
              By breaking down technical jargon and complex legal language, we help innovators quickly grasp the essence of patents without requiring specialized expertise in patent law or specific technical domains.
            </p>
          </AccordionItem> */}

          <AccordionItem 
            title="Comprehensive Patent Reports" 
            icon={<FileSearch size={24} className="text-teal-500" />}
          >
            <p>
              Generate detailed reports that include key patent metrics, visualization of claims coverage, technology categorization, and market potential assessments. These reports help in making informed decisions about patent strategy.
            </p>
            <p className="mt-2">
              Whether you're conducting due diligence, developing an IP strategy, or researching competition, our comprehensive reports provide actionable insights tailored to your specific needs.
            </p>
          </AccordionItem>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;