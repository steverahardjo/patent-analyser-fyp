import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend
} from 'recharts';

// Sample data for the charts
const trizData = [
  { name: 'Segmentation', value: 35 },
  { name: 'Taking Out', value: 25 },
  { name: 'Local Quality', value: 20 },
  { name: 'Asymmetry', value: 15 },
  { name: 'Merging', value: 5 }
];

const keywordsData = [
  { name: 'Algorithm', count: 86 },
  { name: 'Interface', count: 75 },
  { name: 'System', count: 65 },
  { name: 'Method', count: 62 },
  { name: 'Device', count: 58 },
  { name: 'Data', count: 50 }
];

const classificationData = [
  { subject: 'TRIZ Analysis', A: 85, fullMark: 100 },
  { subject: 'Similarity Detection', A: 78, fullMark: 100 },
  { subject: 'Keyword Extraction', A: 92, fullMark: 100 },
  { subject: 'Claim Coverage', A: 70, fullMark: 100 },
  { subject: 'Novelty Assessment', A: 88, fullMark: 100 },
  { subject: 'Commercial Viability', A: 65, fullMark: 100 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ChartsSection = () => {
  const [activeChart, setActiveChart] = useState('triz');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Interactive Insights</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualize key patent data through our interactive charts to identify patterns, trends, and opportunities.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveChart('triz')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              activeChart === 'triz' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            TRIZ Principles
          </button>
          <button
            onClick={() => setActiveChart('keywords')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              activeChart === 'keywords' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Frequent Keywords
          </button>
          <button
            onClick={() => setActiveChart('classification')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              activeChart === 'classification' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Classification Confidence
          </button>
        </div>

        <motion.div
          key={activeChart}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-50 rounded-xl p-4 shadow-sm min-h-[400px]"
        >
          {activeChart === 'triz' && (
            <div className="h-[400px]">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Top TRIZ Principles Detected</h3>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={trizData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trizData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'keywords' && (
            <div className="h-[400px]">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Frequent Keywords in Patents</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={keywordsData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Frequency" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'classification' && (
            <div className="h-[400px]">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Classification Confidence</h3>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart outerRadius={130} data={classificationData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Confidence Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ChartsSection;