
import React, { useMemo } from 'react';
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
  Pie,
  Legend
} from 'recharts';
import { Activity, Code, Eye, Layers, Image as ImageIcon, Briefcase, Zap, Globe } from 'lucide-react';

interface OverviewProps {
  projects: Project[];
  experience: Experience[];
}

const Overview: React.FC<OverviewProps> = ({ projects, experience }) => {
  // 1. Calculate Project Categories Distribution
  const categoryData = useMemo(() => {
    const counts = projects.reduce((acc, curr) => {
      acc[curr.filterCategory] = (acc[curr.filterCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors: Record<string, string> = {
      graphic: '#E0FF00', // neon-lime
      web: '#00F0FF',     // neon-cyan
      motion: '#B026FF',  // neon-purple
      photo: '#FF0055',   // neon-pink
      uiux: '#E0E0FF'     // neon-ice
    };

    return Object.keys(counts).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: counts[key],
      color: colors[key] || '#6B6B7B'
    }));
  }, [projects]);

  // 2. Calculate Top Skills / Tech Stack from Tags
  const techStack = useMemo(() => {
    const tagCounts = projects.flatMap(p => p.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [projects]);

  // 3. Calculate Total Media Assets
  const totalMedia = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.gallery?.length || 0), 0) + projects.length;
  }, [projects]);

  // 4. Calculate Experience Stats
  const yearsExp = useMemo(() => {
    if (experience.length === 0) return "0";
    const years = experience.map(exp => {
      const match = exp.period.match(/(\d{4})/);
      return match ? parseInt(match[1]) : new Date().getFullYear();
    });
    const earliest = Math.min(...years);
    const current = new Date().getFullYear();
    return `${current - earliest}+`;
  }, [experience]);

  const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
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
          <p className="text-obsidian-textMuted text-[10px] font-mono uppercase tracking-widest">{label}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
          {subValue && <p className="text-[10px] text-obsidian-textMuted mt-1 font-mono">{subValue}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="w-full h-1 bg-obsidian-border rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          className={`h-full ${color.replace('text-', 'bg-')} opacity-50`} 
        />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Bar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Firestore Records" 
          value={projects.length} 
          subValue={`${experience.length} Experience items`} 
          icon={Layers} 
          color="text-neon-cyan" 
        />
        <StatCard 
          label="Market Tenure" 
          value={yearsExp} 
          subValue="Active Professional Years" 
          icon={Briefcase} 
          color="text-neon-lime" 
        />
        <StatCard 
          label="Cloud Assets" 
          value={totalMedia} 
          subValue="Images & Videos in DB" 
          icon={ImageIcon} 
          color="text-neon-purple" 
        />
        <StatCard 
          label="Primary Domain" 
          value={techStack[0]?.name || "N/A"} 
          subValue="Based on project tagging" 
          icon={Code} 
          color="text-neon-pink" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tech Stack Distribution */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="lg:col-span-2 bg-obsidian-card border border-obsidian-border rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Zap size={18} className="text-neon-lime" />
              Technology Popularity
            </h3>
            <span className="text-[10px] font-mono text-obsidian-textMuted uppercase">Cross-Project Analysis</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techStack} layout="vertical" margin={{ left: 20, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#6B6B7B" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0B', borderColor: '#1A1A2E', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {techStack.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#00F0FF', '#E0FF00', '#B026FF', '#FF0055', '#E0E0FF'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution Pie */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-obsidian-card border border-obsidian-border rounded-xl p-6"
        >
          <h3 className="text-white font-medium mb-6 flex items-center gap-2">
            <Globe size={18} className="text-neon-cyan" />
            Project Segments
          </h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0A0A0B', borderColor: '#1A1A2E', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-10">
              <div className="text-center">
                 <span className="block text-3xl font-bold text-white leading-none">{projects.length}</span>
                 <span className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-tighter">Live Docs</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Feed Simulator (derived from projects) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6"
      >
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
           <Activity size={18} className="text-neon-pink" />
           Cloud Synchronisation Log
        </h3>
        <div className="space-y-3">
          {projects.slice(0, 5).map((p, i) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-obsidian-border/50 last:border-0">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_#00F0FF]" />
                  <span className="text-xs text-white font-medium">Synced Project: <span className="text-obsidian-textMuted">{p.title}</span></span>
               </div>
               <span className="text-[10px] font-mono text-obsidian-textMuted">{p.filterCategory.toUpperCase()}</span>
            </div>
          ))}
          {projects.length === 0 && (
             <p className="text-sm text-obsidian-textMuted italic">No activity recorded in cloud storage yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
