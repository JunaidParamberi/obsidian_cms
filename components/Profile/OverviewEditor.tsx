
import React, { useState, useEffect, useMemo, useContext } from 'react';
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
import { geminiService } from '../../services/geminiService';
import { UIContext } from '../../services/uiContext';

interface OverviewEditorProps {
  initialData: Overview | null;
  onSave: (data: Overview) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}

const OverviewEditor: React.FC<OverviewEditorProps> = ({ initialData, onSave, onDirtyChange }) => {
  const ui = useContext(UIContext);
  const [localData, setLocalData] = useState<Overview>({
    title: "Professional Profile",
    subtitle: "Creative Technologist",
    description: "",
    stats: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLocalData(JSON.parse(JSON.stringify(initialData)));
    }
  }, [initialData]);

  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(localData) !== JSON.stringify(initialData);
  }, [localData, initialData]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleAIWrite = async () => {
    setIsAILoading(true);
    try {
      const result = await geminiService.generateText(`Write a professional 2-paragraph portfolio biography for Junaid Paramberi. Role: "${localData.title}" and context: "${localData.subtitle}". Make it sound high-end and visionary.`);
      updateField('description', result);
    } catch (e) {
      ui?.notify("AI Write Failed", "error");
    } finally {
      setIsAILoading(false);
    }
  };

  const updateField = (field: keyof Overview, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localData);
    } finally {
      setIsSaving(false);
    }
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
          className={`w-full sm:w-auto px-10 py-3 rounded-xl font-black text-xs uppercase transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
            isDirty ? 'bg-neon-lime text-black hover:bg-white' : 'bg-obsidian-surface text-obsidian-textMuted opacity-50 cursor-not-allowed border border-obsidian-border'
          }`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isSaving ? 'Syncing...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-6 space-y-6">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-obsidian-border pb-4">
              <Heading size={18} className="text-neon-cyan shrink-0" /> <span className="text-sm uppercase tracking-wider">Identity Branding</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Main Heading</label>
                <input value={localData.title} onChange={(e) => updateField('title', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-white focus:border-neon-cyan outline-none text-sm" placeholder="Portfolio Title" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Role Descriptor</label>
                <input value={localData.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-neon-cyan focus:border-neon-cyan outline-none font-medium text-sm" placeholder="Role" />
              </div>
            </div>
          </div>
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-border pb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <TextQuote size={18} className="text-neon-purple shrink-0" /> <span className="text-sm uppercase tracking-wider">Biography</span>
              </h3>
              <button 
                onClick={handleAIWrite} 
                disabled={isAILoading}
                className={`flex items-center gap-2 px-4 py-1.5 bg-obsidian-bg border rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden ${isAILoading ? 'border-neon-purple bg-neon-purple/10 text-white' : 'border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10'}`}
              >
                {isAILoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                AI Write Bio
                {isAILoading && <div className="absolute inset-0 shimmer-ai pointer-events-none" />}
              </button>
            </div>
            <textarea value={localData.description} onChange={(e) => updateField('description', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-5 text-white h-48 resize-none text-sm leading-relaxed focus:border-neon-purple outline-none" placeholder="Tell your story..." />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewEditor;
