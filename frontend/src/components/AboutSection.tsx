import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, Search, Zap, FileSearch,Leaf } from 'lucide-react';

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
            title="What Are TRIZ Principles?" 
            icon={<Lightbulb size={24} className="text-yellow-500" />}
          >
            <p>
              TRIZ (Theory of Inventive Problem Solving) is a framework developed to analyze patterns of innovation across thousands of patents. It identifies 40 key principles that drive most technological breakthroughs—such as “Segmentation”, “Another Dimension”, or “Prior Action.”
            </p>
            <p className="mt-2">
              Our system uses AI to automatically match each patent claim to the most relevant TRIZ principles. This helps you spot what kind of inventive thinking your patent reflects and reveals untapped areas for future innovation.
            </p>
          </AccordionItem>

          <AccordionItem 
            title="What Is an Eco-Solution Patent?" 
            icon={<Leaf size={24} className="text-green-600" />}
          >
            <p>
              Eco-solution patents are inventions that aim to reduce environmental impact—whether by improving energy efficiency, enabling renewable alternatives, minimizing waste, or supporting sustainability in manufacturing or daily life.
            </p>
            <p className="mt-2">
              Our tool is optimized for analyzing patents in this domain. By focusing on eco-innovation, we ensure higher relevance and accuracy when classifying ideas using TRIZ principles.
            </p>
          </AccordionItem>

          <AccordionItem 
            title="How Does the AI Work?" 
            icon={<Zap size={24} className="text-purple-500" />}
          >
            <p>
              We use a combination of Large Language Models (LLMs) and semantic similarity algorithms to understand your patent like a human expert would. Each claim is broken into chunks and compared against an internal knowledge base of TRIZ principles.
            </p>
            <p className="mt-2">
              Instead of just matching keywords, our system captures the meaning behind each claim—helping you get smarter results, summaries, and suggestions instantly.
            </p>
          </AccordionItem>
          <AccordionItem 
            title="How Is This Different from ChatGPT?" 
            icon={<Zap size={24} className="text-indigo-500" />}
          >
            <p>
              While ChatGPT and other general-purpose AI tools are powerful, they are not specialized for patent analysis. They lack structured logic for interpreting innovation frameworks like TRIZ.
            </p>
            <p className="mt-2">
              Our tool is purpose-built for eco-innovation patents. It combines semantic embeddings with a curated TRIZ knowledge base to give you accurate, explainable insights—something generic models can’t reliably deliver.
            </p>
          </AccordionItem>


        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;