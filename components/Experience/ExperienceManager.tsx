
import React, { useState, useContext } from 'react';
import { Experience } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Trophy, 
  Target,
  ArrowRight,
  Database
} from 'lucide-react';
import { UIContext } from '../../App';

interface ExperienceManagerProps {
  experience: Experience[];
  onUpdate: (updated: Experience[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ExperienceManager: React.FC<ExperienceManagerProps> = ({ experience, onUpdate, onDelete }) => {
  const ui = useContext(UIContext);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleDeleteTrigger = (item: Experience) => {
    ui?.confirm({
      title: "Purge Career Milestone?",
      message: `Warning: You are about to permanently remove "${item.role}" at ${item.company} from the database. This will update the live timeline on your portfolio immediately.`,
      type: 'danger',
      onConfirm: async () => {
        await onDelete(item.id);
      }
    });
  };

  const handleEdit = (id: string, field: keyof Experience, value: string) => {
    const updated = experience.map(e => e.id === id ? { ...e, [field]: value } : e);
    onUpdate(updated);
  };

  const handleAdd = async () => {
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      role: 'New Position',
      company: 'Company Name',
      period: 'Start - Present',
      description: 'Describe your achievements and impact in this role...',
      type: 'work'
    };
    setIsSaving(true);
    try {
      await onUpdate([newExp, ...experience]);
      setEditingId(newExp.id);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-32">
       <div className="sticky top-0 z-30 pt-1 pb-4 bg-obsidian-bg/80 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-obsidian-surface p-5 md:p-6 rounded-2xl border border-obsidian-border shadow-2xl gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-neon-purple/10 rounded-xl border border-neon-purple/20 shrink-0">
                <Briefcase className="text-neon-purple" size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Timeline</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-[9px] text-obsidian-textMuted font-mono uppercase tracking-widest flex items-center gap-2">
                     <Database size={10} /> Cloud Active
                   </p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleAdd}
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-neon-purple text-black font-black rounded-xl hover:bg-white transition-all active:scale-95 disabled:opacity-50 shadow-lg"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
              <span className="uppercase tracking-widest text-xs">New Milestone</span>
            </button>
          </div>
       </div>

       <div className="relative pl-8 md:pl-12 border-l-2 border-obsidian-border/50 ml-2 md:ml-4 space-y-8">
          <AnimatePresence mode="popLayout">
            {experience.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative bg-obsidian-surface border border-obsidian-border p-5 md:p-8 rounded-2xl transition-all duration-300 group hover:border-neon-cyan/30 ${editingId === item.id ? 'ring-1 ring-neon-purple/30' : ''}`}
              >
                <div className="absolute -left-[41px] md:-left-[59px] top-8 md:top-10 flex items-center justify-center">
                   <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-obsidian-bg z-10 transition-shadow duration-500 ${
                     item.type === 'work' 
                      ? 'bg-neon-lime shadow-[0_0_12px_rgba(224,255,0,0.4)]' 
                      : 'bg-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                   }`} />
                </div>

                <div className="flex flex-col justify-between items-start gap-4 md:gap-6">
                   <div className="flex-1 space-y-4 w-full">
                      {editingId === item.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Position / Diploma</label>
                              <input 
                                 value={item.role} 
                                 onChange={(e) => handleEdit(item.id, 'role', e.target.value)}
                                 className="w-full bg-obsidian-bg border border-obsidian-border text-white px-4 py-3 rounded-xl focus:border-neon-purple outline-none transition-all font-bold text-sm"
                                 placeholder="e.g. Graphic Designer"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Institution</label>
                              <input 
                                 value={item.company} 
                                 onChange={(e) => handleEdit(item.id, 'company', e.target.value)}
                                 className="w-full bg-obsidian-bg border border-obsidian-border text-neon-lime px-4 py-3 rounded-xl focus:border-neon-purple outline-none transition-all font-bold text-sm"
                                 placeholder="e.g. Creative Studio"
                              />
                           </div>
                        </div>
                      ) : (
                        <div>
                           <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                             <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-neon-cyan transition-colors truncate">{item.role}</h3>
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                               item.type === 'work' 
                                ? 'bg-neon-lime/10 text-neon-lime border-neon-lime/20' 
                                : 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
                             }`}>
                                {item.type}
                             </span>
                           </div>
                           <p className="text-neon-lime text-base md:text-lg font-medium">
                             {item.company}
                           </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] font-mono text-obsidian-textMuted uppercase tracking-widest bg-black/30 w-fit px-3 py-1.5 rounded-lg border border-obsidian-border">
                        <Calendar size={12} className="text-neon-purple/50 shrink-0" />
                        {editingId === item.id ? (
                           <input 
                              value={item.period} 
                              onChange={(e) => handleEdit(item.id, 'period', e.target.value)}
                              className="bg-transparent text-white focus:text-neon-purple outline-none w-28 md:w-32"
                              placeholder="2023 - Present"
                           />
                        ) : (
                           <span>{item.period}</span>
                        )}
                      </div>
                   </div>

                   <div className="flex items-center gap-2 w-full md:w-auto justify-end md:justify-start">
                      <select 
                        value={item.type}
                        onChange={(e) => handleEdit(item.id, 'type', e.target.value as any)}
                        className={`hidden md:block px-3 py-2 rounded-lg text-[10px] uppercase font-bold bg-obsidian-bg border border-obsidian-border outline-none cursor-pointer transition-colors ${
                          item.type === 'work' ? 'text-neon-lime hover:border-neon-lime/50' : 'text-neon-cyan hover:border-neon-cyan/50'
                        }`}
                      >
                         <option value="work">Industry Work</option>
                         <option value="education">Education</option>
                      </select>
                      
                      <button 
                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                        className={`p-2.5 rounded-xl transition-all border flex-1 md:flex-none flex justify-center ${
                          editingId === item.id 
                            ? 'bg-neon-purple text-black border-neon-purple shadow-lg' 
                            : 'text-obsidian-textMuted hover:text-white hover:bg-obsidian-bg border-obsidian-border'
                        }`}
                      >
                        {editingId === item.id ? <CheckCircle2 size={20} /> : <Edit2 size={20} />}
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteTrigger(item)}
                        className="p-2.5 text-obsidian-textMuted hover:text-red-500 hover:bg-red-500/10 border border-obsidian-border hover:border-red-500/30 rounded-xl transition-all flex-1 md:flex-none flex justify-center"
                      >
                        <Trash2 size={20} />
                      </button>
                   </div>
                </div>

                <div className="mt-6 space-y-3">
                  {editingId === item.id ? (
                     <div className="space-y-1.5">
                        <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Impact Summary</label>
                        <textarea 
                           value={item.description} 
                           onChange={(e) => handleEdit(item.id, 'description', e.target.value)}
                           className="w-full bg-obsidian-bg border border-obsidian-border text-obsidian-text p-4 h-40 rounded-xl focus:border-neon-purple outline-none resize-none text-sm transition-all leading-relaxed"
                           placeholder="Describe your impact..."
                        />
                     </div>
                  ) : (
                     <p className="text-obsidian-text leading-relaxed text-sm opacity-90 max-w-3xl border-l-2 border-obsidian-border pl-4">
                       {item.description}
                     </p>
                  )}
                </div>

                {editingId === item.id && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="mt-6 pt-4 border-t border-obsidian-border flex justify-end"
                  >
                    <button 
                      onClick={() => setEditingId(null)}
                      className="w-full md:w-auto text-[10px] bg-neon-purple text-black px-8 py-2.5 rounded-lg font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl"
                    >
                      Commit Record
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {experience.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-obsidian-border rounded-3xl bg-obsidian-surface/20 px-6">
               <History size={40} className="mx-auto text-obsidian-textMuted opacity-20 mb-4" />
               <h3 className="text-white font-bold mb-2">The Timeline is Empty</h3>
               <p className="text-xs text-obsidian-textMuted font-mono uppercase tracking-widest">Cloud Firestore Synchronization Required.</p>
            </div>
          )}
       </div>
    </div>
  );
};

const History = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export default ExperienceManager;
