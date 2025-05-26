import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Technology stack items with logos from known CDNs
const technologies = [
  {
    name: "OpenAI",
    logoUrl: "https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1741166747419",
    description: "Powering classification, summarization, and Q&A using GPT models"
  },
  {
    name: "Qdrant",
    logoUrl: "https://qdrant.tech/img/brand-resources-logos/logomark.svg",
    description: "Stores hybrid embeddings for fast, accurate semantic retrieval"
  },
  {
    name: "Hugging Face",
    logoUrl: "https://huggingface.co/front/assets/huggingface_logo.svg",
    description: "State-of-the-art Dataset storage and model hosting"
  },
  {
    name: "Cohere",
    logoUrl: "https://cohere.com/logo.svg",
    description: "Used for sparse embeddings in hybrid semantic search"
  },
  {
    name: "Python",
    logoUrl: "https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/community/logos/python-logo-only.png",
    description: "Backend processing and algorithm implementation"
  },
  {
    name: "LangChain",
    logoUrl: "https://avatars.githubusercontent.com/u/126733545?s=200&v=4",
    description: "Manages LLM workflows and prompt orchestration in the backend"
  },
  {
    name: "React",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1150px-React-icon.svg.png",
    description: "Frontend UI development for responsive interfaces"
  },
  {
    name: "Node.js",
    logoUrl: "https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg",
    description: "Open-Source JavaScript runtime environment"
  },
  {
    name: "Tailwind CSS",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/1024px-Tailwind_CSS_Logo.svg.png",
    description: "Utility-first CSS framework for modern designs"
  },
  {
    name: "Azure",
    logoUrl: "https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.svg",
    description: "Cloud-based storage and compute resources"
  },
  {
    name: "Flask",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Flask_logo.svg",
    description: "Lightweight web framework for serving AI endpoints"
  },
  {
    name: "Docker",
    logoUrl: "https://www.vectorlogo.zone/logos/docker/docker-icon.svg",
    description: "Containerization of backend services for local testing"
  },
  {
    name: "VS Code",
    logoUrl: "https://code.visualstudio.com/assets/images/code-stable.png",
    description: "IDE used to build, debug, and test the project"
  },
  {
    name: "GitHub",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
    description: "Version control, collaboration, and code management"
  }
];

const TechStack = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !autoScroll) return;

    let animationId: number;
    let startTime: number;
    let lastPos = 0;
    
    const scroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (scrollContainer) {
        // Slow auto-scroll speed
        lastPos = (progress / 50) % scrollContainer.scrollWidth;
        scrollContainer.scrollLeft = lastPos;
        
        // Reset when we've scrolled through all items
        if (lastPos + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
          startTime = timestamp;
        }
      }
      
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    return () => cancelAnimationFrame(animationId);
  }, [autoScroll]);

  const handleMouseEnter = () => setAutoScroll(false);
  const handleMouseLeave = () => setAutoScroll(true);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Powered By</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform leverages cutting-edge technologies to deliver accurate and insightful patent analysis.
          </p>
        </motion.div>

        <div 
          className="relative overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            ref={scrollRef}
            className="flex space-x-8 py-6 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[...technologies, ...technologies].map((tech, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 flex flex-col items-center bg-white rounded-lg shadow-sm p-6 min-w-[200px] w-48 h-64 border border-gray-100"
              >
                <div className="w-20 h-20 mb-4 flex items-center justify-center">
                  <img 
                    src={tech.logoUrl} 
                    alt={`${tech.name} logo`} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tech.name}</h3>
                <p className="text-sm text-gray-600 text-center">{tech.description}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Gradient overlays to indicate scrolling */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-sm text-center text-gray-500 mt-4"
        >
          Hover to pause scrolling
        </motion.p>
      </div>
    </section>
  );
};

export default TechStack;