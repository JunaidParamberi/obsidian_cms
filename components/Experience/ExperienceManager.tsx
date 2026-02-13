
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Experience } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Database,
  Sparkles
} from 'lucide-react';
import { UIContext } from '../../services/uiContext';
import { geminiService } from '../../services/geminiService';

interface ExperienceManagerProps {
  experience: Experience[];
  onUpdate: (updated: Experience[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}

const ExperienceManager: React.FC<ExperienceManagerProps> = ({ experience, onUpdate, onDelete, onDirtyChange }) => {
  const ui = useContext(UIContext);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localExperience, setLocalExperience] = useState<Experience[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState<string | null>(null);

  useEffect(() => {
    setLocalExperience(JSON.parse(JSON.stringify(experience)));
  }, [experience]);

  const isDirty = useMemo(() => {
    return JSON.stringify(localExperience) !== JSON.stringify(experience);
  }, [localExperience, experience]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleAIWrite = async (item: Experience) => {
    setIsAILoading(item.id);
    try {
      const result = await geminiService.generateText(`Write a professional 2-sentence description for the role: "${item.role}" at company: "${item.company}". Focus on achievements.`);
      handleEditField(item.id, 'description', result);
    } catch (e) {
      ui?.notify("AI Content Generation Failed", "error");
    } finally {
      setIsAILoading(null);
    }
  };

  const handleDeleteTrigger = (item: Experience) => {
    ui?.confirm({
      title: "Purge Career Milestone?",
      message: `Warning: You are about to permanently remove "${item.role}" at ${item.company} from the database.`,
      type: 'danger',
      onConfirm: async () => {
        await onDelete(item.id);
      }
    });
  };

  const handleEditField = (id: string, field: keyof Experience, value: string) => {
    setLocalExperience(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAdd = async () => {
    const newExp: Experience = {
        id: `exp_${Date.now()}`,
        role: 'New Position',
        company: 'Company Name',
        period: 'Start - Present',
        description: 'Achievements...',
        type: 'work'
    };
    setLocalExperience(prev => [newExp, ...prev]);
    setEditingId(newExp.id);
  };

  const commitChanges = async () => {
    setIsSaving(true);
    try {
        await onUpdate(localExperience);
        setEditingId(null);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-32">
       <div className="sticky top-0 z-30 pt-1 pb-4 bg-obsidian-bg/80 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-obsidian-surface p-6 rounded-2xl border border-obsidian-border shadow-2xl gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-neon-purple/10 rounded-xl border border-neon-purple/20">
                <Briefcase className="text-neon-purple" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Timeline</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-[9px] text-obsidian-textMuted font-mono uppercase tracking-widest flex items-center gap-2">
                     <Database size={10} /> Cloud Sync Active
                   </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={handleAdd} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-obsidian-bg border border-obsidian-border text-white rounded-xl hover:border-neon-purple transition-all">
                    <Plus size={18} /> <span className="uppercase tracking-widest text-[10px] font-black">Add</span>
                </button>
                <button onClick={commitChanges} disabled={!isDirty || isSaving} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-xl ${isDirty ? 'bg-neon-lime text-black hover:bg-white' : 'bg-obsidian-surface text-obsidian-textMuted opacity-50'}`}>
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    <span>Sync Timeline</span>
                </button>
            </div>
          </div>
       </div>

       <div className="relative pl-12 border-l-2 border-obsidian-border/50 ml-4 space-y-8">
          <AnimatePresence mode="popLayout">
            {localExperience.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`relative bg-obsidian-surface border border-obsidian-border p-8 rounded-2xl transition-all hover:border-neon-cyan/30 ${editingId === item.id ? 'ring-1 ring-neon-purple/30' : ''}`}>
                <div className="absolute -left-[59px] top-10 flex items-center justify-center">
                   <div className={`w-5 h-5 rounded-full border-4 border-obsidian-bg z-10 ${item.type === 'work' ? 'bg-neon-lime shadow-[0_0_12px_#E0FF00]' : 'bg-neon-cyan shadow-[0_0_12px_#00F0FF]'}`} />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                   <div className="flex-1 space-y-4 w-full">
                      {editingId === item.id ? (
                        <div className="grid grid-cols-2 gap-4">
                           <input value={item.role} onChange={(e) => handleEditField(item.id, 'role', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border text-white px-4 py-3 rounded-xl focus:border-neon-purple outline-none text-sm" placeholder="Role" />
                           <input value={item.company} onChange={(e) => handleEditField(item.id, 'company', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border text-neon-lime px-4 py-3 rounded-xl focus:border-neon-purple outline-none text-sm" placeholder="Company" />
                        </div>
                      ) : (
                        <div>
                           <h3 className="text-2xl font-bold text-white">{item.role}</h3>
                           <p className="text-neon-lime text-lg font-medium">{item.company}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-obsidian-textMuted uppercase tracking-widest bg-black/30 w-fit px-3 py-1.5 rounded-lg border border-obsidian-border">
                        <Calendar size={12} className="text-neon-purple/50" />
                        {editingId === item.id ? <input value={item.period} onChange={(e) => handleEditField(item.id, 'period', e.target.value)} className="bg-transparent text-white outline-none w-32" /> : <span>{item.period}</span>}
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setEditingId(editingId === item.id ? null : item.id)} className={`p-2.5 rounded-xl border ${editingId === item.id ? 'bg-neon-purple text-black border-neon-purple' : 'text-obsidian-textMuted border-obsidian-border'}`}>
                        {editingId === item.id ? <CheckCircle2 size={20} /> : <Edit2 size={20} />}
                      </button>
                      <button onClick={() => handleDeleteTrigger(item)} className="p-2.5 text-obsidian-textMuted hover:text-red-500 hover:bg-red-500/10 border border-obsidian-border rounded-xl transition-all">
                        <Trash2 size={20} />
                      </button>
                   </div>
                </div>
                <div className="mt-6 relative group/area">
                   {editingId === item.id && (
                     <button onClick={() => handleAIWrite(item)} disabled={isAILoading === item.id} className="absolute right-4 top-4 p-2 bg-obsidian-surface border border-neon-purple/30 rounded-lg text-neon-purple hover:bg-neon-purple hover:text-white transition-all z-20 overflow-hidden shadow-lg">
                       {isAILoading === item.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                       {isAILoading === item.id && <div className="absolute inset-0 shimmer-ai pointer-events-none" />}
                     </button>
                   )}
                   {editingId === item.id ? <textarea value={item.description} onChange={(e) => handleEditField(item.id, 'description', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border text-obsidian-text p-4 h-40 rounded-xl outline-none resize-none text-sm leading-relaxed focus:border-neon-purple" /> : <p className="text-obsidian-text/80 text-sm leading-relaxed border-l-2 border-obsidian-border pl-4">{item.description}</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
       </div>
    </div>
  );
};

export default ExperienceManager;
