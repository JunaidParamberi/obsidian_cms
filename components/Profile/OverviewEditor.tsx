
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
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 bg-obsidian-bg/80 backdrop-blur-md py-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <UserCircle className="text-neon-cyan shrink-0" size={24} /> Global Profile
          </h2>
          <p className="text-[10px] text-obsidian-textMuted font-mono mt-1 uppercase tracking-widest">Landing Page Metadata</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving || !isDirty}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-xs uppercase transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
            isDirty ? 'bg-neon-lime text-black hover:bg-white' : 'bg-obsidian-surface text-obsidian-textMuted opacity-50 cursor-not-allowed border border-obsidian-border'
          }`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isSaving ? 'Syncing...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-5 md:p-6 space-y-6">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-obsidian-border pb-4">
              <Heading size={18} className="text-neon-cyan shrink-0" /> <span className="text-sm uppercase tracking-wider">Identity Branding</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Main Heading</label>
                <input 
                  value={localData.title} 
                  onChange={(e) => updateField('title', e.target.value)} 
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-white focus:border-neon-cyan outline-none transition-all text-sm"
                  placeholder="Portfolio Title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Role Descriptor</label>
                <input 
                  value={localData.subtitle} 
                  onChange={(e) => updateField('subtitle', e.target.value)} 
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-neon-cyan focus:border-neon-cyan outline-none transition-all font-medium text-sm"
                  placeholder="Role"
                />
              </div>
            </div>
          </div>

          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-5 md:p-6 space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-obsidian-border pb-4">
              <TextQuote size={18} className="text-neon-purple shrink-0" /> <span className="text-sm uppercase tracking-wider">Biography</span>
            </h3>
            <textarea 
              value={localData.description} 
              onChange={(e) => updateField('description', e.target.value)} 
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-5 md:p-6 text-white h-40 md:h-48 resize-none text-sm leading-relaxed focus:border-neon-purple outline-none transition-all"
              placeholder="Tell your story..."
            />
          </div>

          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-5 md:p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-obsidian-border pb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <BarChart3 size={18} className="text-neon-lime shrink-0" /> <span className="text-sm uppercase tracking-wider">Key Counters</span>
              </h3>
              <button onClick={addStat} className="text-[10px] font-black text-neon-lime hover:text-white flex items-center gap-1 uppercase transition-colors">
                <Plus size={14} /> Add Stat
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {localData.stats.map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col gap-3 bg-obsidian-bg p-4 rounded-xl border border-obsidian-border group relative"
                  >
                    <div className="grid grid-cols-2 gap-3 pr-8">
                      <div className="space-y-1">
                        <label className="text-[9px] text-obsidian-textMuted uppercase font-mono block">Label</label>
                        <input 
                          value={stat.label} 
                          onChange={(e) => updateStat(idx, 'label', e.target.value)} 
                          className="w-full bg-obsidian-surface border border-obsidian-border rounded-lg p-2 text-[11px] text-white focus:border-neon-lime outline-none"
                          placeholder="Label"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-obsidian-textMuted uppercase font-mono block">Value</label>
                        <input 
                          value={stat.value} 
                          onChange={(e) => updateStat(idx, 'value', e.target.value)} 
                          className="w-full bg-obsidian-surface border border-obsidian-border rounded-lg p-2 text-[11px] text-neon-lime font-bold focus:border-neon-lime outline-none text-center"
                          placeholder="Value"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeStat(idx)} 
                      className="absolute top-4 right-4 text-obsidian-textMuted hover:text-red-500 transition-colors"
                      title="Remove Stat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {localData.stats.length === 0 && (
              <div className="py-12 text-center border border-dashed border-obsidian-border rounded-2xl bg-obsidian-bg/40">
                <p className="text-[10px] text-obsidian-textMuted font-mono uppercase tracking-widest">No stats defined.</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full xl:w-80 shrink-0 hidden xl:flex flex-col h-fit sticky top-24">
          <div className="bg-black/40 border border-obsidian-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-neon-cyan font-mono uppercase tracking-widest flex items-center gap-2">
                <FileJson size={14} /> Profile Schema
              </span>
              {isDirty && <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse shadow-[0_0_8px_#B026FF]" />}
            </div>
            <pre className="text-[10px] font-mono text-cyan-400/40 overflow-hidden leading-relaxed">
              {JSON.stringify(localData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewEditor;
