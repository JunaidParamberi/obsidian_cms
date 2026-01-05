import React from 'react';
import { Project, Experience } from '../../types';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Activity, Code, Eye, Layers } from 'lucide-react';

interface OverviewProps {
  projects: Project[];
  experience: Experience[];
}

const Overview: React.FC<OverviewProps> = ({ projects, experience }) => {
  // Aggregate data for charts
  const categoryCount = projects.reduce((acc, curr) => {
    acc[curr.filterCategory] = (acc[curr.filterCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoryCount).map((key, index) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: categoryCount[key],
    color: index % 2 === 0 ? '#B026FF' : '#E0FF00'
  }));

  const activityData = [
    { name: 'Mon', commits: 4, deploys: 2 },
    { name: 'Tue', commits: 7, deploys: 1 },
    { name: 'Wed', commits: 12, deploys: 5 },
    { name: 'Thu', commits: 8, deploys: 3 },
    { name: 'Fri', commits: 15, deploys: 8 },
    { name: 'Sat', commits: 2, deploys: 0 },
    { name: 'Sun', commits: 5, deploys: 1 },
  ];

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-obsidian-card border border-obsidian-border p-6 rounded-xl relative overflow-hidden group"
    >
      <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
        <Icon size={100} />
      </div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-obsidian-textMuted text-sm font-mono uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg bg-white/5 ${color.replace('text-', 'text-')}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="w-full h-1 bg-obsidian-border rounded-full overflow-hidden">
        <div className={`h-full ${color.replace('text-', 'bg-')} w-2/3 animate-pulse`} />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Projects" value={projects.length} icon={Layers} color="text-neon-cyan" />
        <StatCard label="Years Experience" value="6+" icon={Activity} color="text-neon-lime" />
        <StatCard label="Tech Stack" value="React/GL" icon={Code} color="text-neon-purple" />
        <StatCard label="Portfolio Views" value="12.4k" icon={Eye} color="text-neon-pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="lg:col-span-2 bg-obsidian-card border border-obsidian-border rounded-xl p-6"
        >
          <h3 className="text-white font-medium mb-6 flex items-center gap-2">
            <Activity size={18} className="text-neon-lime" />
            Commit Activity
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="name" stroke="#6B6B7B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6B7B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0B', borderColor: '#1A1A2E', color: '#fff' }}
                  itemStyle={{ color: '#E0FF00' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="commits" fill="#1A1A2E" radius={[4, 4, 0, 0]}>
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#E0FF00' : '#2A2A4E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribution Chart */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-obsidian-card border border-obsidian-border rounded-xl p-6"
        >
          <h3 className="text-white font-medium mb-6 flex items-center gap-2">
            <Layers size={18} className="text-neon-purple" />
            Project Distribution
          </h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0A0A0B', borderColor: '#1A1A2E', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                 <span className="block text-3xl font-bold text-white">{projects.length}</span>
                 <span className="text-xs text-obsidian-textMuted uppercase">Items</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Overview;