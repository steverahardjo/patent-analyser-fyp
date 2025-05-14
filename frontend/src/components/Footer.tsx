import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Twitter size={20} />, url: "#", label: "Twitter" },
    { icon: <Linkedin size={20} />, url: "#", label: "LinkedIn" },
    { icon: <Github size={20} />, url: "#", label: "GitHub" },
    { icon: <Mail size={20} />, url: "#", label: "Email" }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 - Logo and description */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="bg-blue-600 text-white p-2 rounded-md mr-2">
                  PA
                </span>
                Patent Analyzer
              </h3>
              <p className="text-gray-400 mb-4">
                Empowering inventors and researchers with AI-driven patent analysis tools to accelerate innovation.
              </p>
            </motion.div>
          </div>

          {/* Column 2 - Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                    <ExternalLink size={16} className="mr-2" /> Patent Search
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                    <ExternalLink size={16} className="mr-2" /> API Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                    <ExternalLink size={16} className="mr-2" /> TRIZ Principles
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                    <ExternalLink size={16} className="mr-2" /> Tutorials
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4 mb-6">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    aria-label={link.label}
                    whileHover={{ y: -3, color: '#3b82f6' }}
                    className="bg-gray-800 text-gray-400 p-2 rounded-full hover:text-white transition-all duration-300"
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                Contact us at: <a href="mailto:info@patentanalyzer.ai" className="text-blue-400 hover:underline">info@patentanalyzer.ai</a>
              </p>
            </motion.div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true, amount: 0.2 }}
          className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm"
        >
          <p>© {currentYear} Patent Analyzer AI. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;