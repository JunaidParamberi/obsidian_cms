import React, { useState } from 'react';
import { Experience } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, Plus, Trash2, Edit2, Calendar } from 'lucide-react';

interface ExperienceManagerProps {
  experience: Experience[];
  setExperience: React.Dispatch<React.SetStateAction<Experience[]>>;
}

const ExperienceManager: React.FC<ExperienceManagerProps> = ({ experience, setExperience }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setExperience(prev => prev.filter(e => e.id !== id));
  };

  const handleEdit = (id: string, field: keyof Experience, value: string) => {
    setExperience(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAdd = () => {
    const newExp: Experience = {
      id: `new-${Date.now()}`,
      role: 'New Role',
      company: 'Company Name',
      period: 'Present',
      description: 'Role description...',
      type: 'work'
    };
    setExperience([newExp, ...experience]);
    setEditingId(newExp.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex justify-between items-center bg-obsidian-card p-4 rounded-xl border border-obsidian-border sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-neon-lime" /> Timeline
          </h2>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-neon-purple text-black font-bold rounded hover:bg-neon-purple/90 transition-colors"
          >
            <Plus size={18} /> Add Entry
          </button>
       </div>

       <div className="relative pl-8 border-l border-obsidian-border space-y-8">
          <AnimatePresence>
            {experience.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative bg-obsidian-card border border-obsidian-border p-6 rounded-xl hover:border-neon-lime/30 transition-colors group"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[39px] top-6 w-5 h-5 rounded-full border-4 border-obsidian-bg ${item.type === 'work' ? 'bg-neon-lime' : 'bg-neon-cyan'}`} />

                <div className="flex justify-between items-start mb-4">
                   <div className="flex-1 space-y-1">
                      {editingId === item.id ? (
                        <>
                           <input 
                              value={item.role} 
                              onChange={(e) => handleEdit(item.id, 'role', e.target.value)}
                              className="block w-full bg-obsidian-bg border border-obsidian-border text-white px-2 py-1 mb-1"
                           />
                           <input 
                              value={item.company} 
                              onChange={(e) => handleEdit(item.id, 'company', e.target.value)}
                              className="block w-full bg-obsidian-bg border border-obsidian-border text-neon-lime px-2 py-1"
                           />
                        </>
                      ) : (
                        <>
                           <h3 className="text-xl font-bold text-white">{item.role}</h3>
                           <p className="text-neon-lime">{item.company}</p>
                        </>
                      )}
                   </div>
                   <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${item.type === 'work' ? 'bg-neon-lime/10 text-neon-lime' : 'bg-neon-cyan/10 text-neon-cyan'}`}>
                        {item.type}
                      </span>
                      <button 
                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                        className="p-2 text-obsidian-textMuted hover:text-white"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-obsidian-textMuted hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-obsidian-textMuted mb-4">
                  <Calendar size={14} />
                  {editingId === item.id ? (
                     <input 
                        value={item.period} 
                        onChange={(e) => handleEdit(item.id, 'period', e.target.value)}
                        className="bg-obsidian-bg border border-obsidian-border text-white px-2 py-0.5"
                     />
                  ) : (
                     <span>{item.period}</span>
                  )}
                </div>

                {editingId === item.id ? (
                   <textarea 
                      value={item.description} 
                      onChange={(e) => handleEdit(item.id, 'description', e.target.value)}
                      className="w-full bg-obsidian-bg border border-obsidian-border text-obsidian-text p-2 h-20"
                   />
                ) : (
                   <p className="text-obsidian-text leading-relaxed">
                     {item.description}
                   </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
       </div>
    </div>
  );
};

export default ExperienceManager;