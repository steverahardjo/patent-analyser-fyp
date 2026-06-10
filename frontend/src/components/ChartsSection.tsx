import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A28CF0', '#FFA07A', '#9FE2BF', '#FFD700'];

const ChartsSection: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'triz' | 'keywords' | 'complexity'>('triz');
  const [trizData, setTrizData] = useState([]);
  const [topicsData, setTopicsData] = useState([]);
  type ComplexityDatum = { num_principles: number; count: number };
  const [complexityData, setComplexityData] = useState<ComplexityDatum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setChartError(null);
      try {
        const [trizRes, topicRes, complexityRes] = await Promise.all([
          fetch('/data/triz_pie_data.json'),
          fetch('/data/topics_chart_data.json'),
          fetch('/data/claim_complexity_data.json'),
        ]);

        if (!trizRes.ok) throw new Error(`TRIZ data: ${trizRes.status}`);
        if (!topicRes.ok) throw new Error(`Topics data: ${topicRes.status}`);
        if (!complexityRes.ok) throw new Error(`Complexity data: ${complexityRes.status}`);

        setTrizData(await trizRes.json());
        setTopicsData(await topicRes.json());
        setComplexityData(await complexityRes.json());
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load chart data';
        setChartError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (chartError) {
    return (
      <section className="h-full flex items-center p-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto w-full text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Interactive Insights</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 font-medium">Failed to load chart data</p>
            <p className="text-red-500 text-sm mt-1">{chartError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="h-full flex items-center p-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto w-full text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Interactive Insights</h2>
          <div className="animate-pulse bg-gray-100 rounded-xl h-[350px] flex items-center justify-center">
            <p className="text-gray-400">Loading charts...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full flex items-center p-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto w-full">
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
          {['triz', 'keywords', 'complexity'].map((chart) => (
            <button
              key={chart}
              onClick={() => setActiveChart(chart as any)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeChart === chart
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {chart === 'triz' && 'TRIZ Principles'}
              {chart === 'keywords' && 'Patent Topics'}
              {chart === 'complexity' && 'TRIZ Principles per Patent'}
            </button>
          ))}
        </div>

        <motion.div
          key={activeChart}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-50 rounded-xl p-4 shadow-sm min-h-[300px]"
        >
          {activeChart === 'triz' && (
            <div className="h-[350px]">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Top 8 TRIZ Principles Detected</h3>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={trizData}
                    dataKey="Count"
                    nameKey="TRIZ Principle"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {trizData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'keywords' && (
            <div className="h-[350px]">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Top 15 Eco-Related Patent Topics</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={topicsData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="Topic" width={150} />
                  <Tooltip />
                  <Bar dataKey="Count" name="Frequency" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'complexity' && (
            <div className="h-[350px]">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Number of TRIZ Principles per Patent</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={complexityData}>
                  <XAxis dataKey="num_principles" label={{ value: 'TRIZ Principles per Patent', position: 'insideBottom', dy: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Patent Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ChartsSection;
