
import React, { useState, useEffect } from 'react';
import { Overview } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, 
  FileJson, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2,
  Heading,
  TextQuote,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface OverviewEditorProps {
  initialData: Overview | null;
  onSave: (data: Overview) => Promise<void>;
}

const OverviewEditor: React.FC<OverviewEditorProps> = ({ initialData, onSave }) => {
  const [localData, setLocalData] = useState<Overview>({
    title: "Professional Profile",
    subtitle: "Creative Technologist",
    description: "",
    stats: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLocalData(JSON.parse(JSON.stringify(initialData)));
      setIsDirty(false);
    }
  }, [initialData]);

  const updateField = (field: keyof Overview, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localData);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  const addStat = () => {
    const newStats = [...localData.stats, { label: "New Stat", value: "0" }];
    updateField('stats', newStats);
  };

  const removeStat = (index: number) => {
    const newStats = localData.stats.filter((_, i) => i !== index);
    updateField('stats', newStats);
  };

  const updateStat = (index: number, field: 'label' | 'value', value: string) => {
    const newStats = [...localData.stats];
    newStats[index][field] = value;
    updateField('stats', newStats);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <UserCircle className="text-neon-cyan" /> Profile Overview
          </h2>
          <p className="text-xs text-obsidian-textMuted font-mono mt-1 uppercase tracking-widest">Front-end Landing Page Metadata</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving || !isDirty}
          className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95 ${
            isDirty ? 'bg-neon-lime text-black hover:bg-white' : 'bg-obsidian-surface text-obsidian-textMuted opacity-50 cursor-not-allowed'
          }`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isSaving ? 'SYNCING...' : 'SAVE PROFILE'}</span>
        </button>
      </div>

      <div className="flex gap-8 overflow-hidden flex-1">
        <div className="flex-1 overflow-y-auto space-y-6 pb-20 pr-2 custom-scrollbar">
          
          {/* Header Specs */}
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-6 space-y-6">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-obsidian-border pb-4">
              <Heading size={18} className="text-neon-cyan" /> Identity Branding
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Main Heading</label>
                <input 
                  value={localData.title} 
                  onChange={(e) => updateField('title', e.target.value)} 
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-white focus:border-neon-cyan outline-none transition-all"
                  placeholder="e.g. Professional Profile"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Subheading / Role</label>
                <input 
                  value={localData.subtitle} 
                  onChange={(e) => updateField('subtitle', e.target.value)} 
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-neon-cyan focus:border-neon-cyan outline-none transition-all font-medium"
                  placeholder="e.g. Creative Technologist"
                />
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-obsidian-border pb-4">
              <TextQuote size={18} className="text-neon-purple" /> Biography / Summary
            </h3>
            <textarea 
              value={localData.description} 
              onChange={(e) => updateField('description', e.target.value)} 
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-6 text-white h-48 resize-none text-sm leading-relaxed focus:border-neon-purple outline-none transition-all"
              placeholder="Tell your professional story..."
            />
          </div>

          {/* Manual Stats Counter */}
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-obsidian-border pb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <BarChart3 size={18} className="text-neon-lime" /> Hardcoded Stats
              </h3>
              <button onClick={addStat} className="text-[10px] font-bold text-neon-lime hover:text-white flex items-center gap-1 uppercase transition-colors">
                <Plus size={12} /> Add Counter
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {localData.stats.map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-3 bg-obsidian-bg p-4 rounded-xl border border-obsidian-border group"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] text-obsidian-textMuted uppercase font-mono block mb-1">Label</label>
                          <input 
                            value={stat.label} 
                            onChange={(e) => updateStat(idx, 'label', e.target.value)} 
                            className="w-full bg-obsidian-surface border border-obsidian-border rounded p-2 text-xs text-white focus:border-neon-lime outline-none"
                            placeholder="e.g. Experience"
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-[9px] text-obsidian-textMuted uppercase font-mono block mb-1">Value</label>
                          <input 
                            value={stat.value} 
                            onChange={(e) => updateStat(idx, 'value', e.target.value)} 
                            className="w-full bg-obsidian-surface border border-obsidian-border rounded p-2 text-xs text-neon-lime font-bold focus:border-neon-lime outline-none text-center"
                            placeholder="6+ Years"
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeStat(idx)} 
                      className="text-obsidian-textMuted hover:text-red-500 self-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {localData.stats.length === 0 && (
              <div className="py-10 text-center border border-dashed border-obsidian-border rounded-xl">
                <p className="text-xs text-obsidian-textMuted font-mono">No stats defined. Add one to show on your profile.</p>
              </div>
            )}
          </div>
        </div>

        {/* JSON Preview Panel */}
        <div className="w-80 bg-black/40 border border-obsidian-border rounded-2xl p-6 hidden lg:flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-neon-cyan font-mono uppercase tracking-widest flex items-center gap-2">
              <FileJson size={14} /> Profile.json
            </span>
            {isDirty && <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />}
          </div>
          <pre className="flex-1 text-[10px] font-mono text-cyan-400/60 overflow-y-auto custom-scrollbar">
            {JSON.stringify(localData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default OverviewEditor;
