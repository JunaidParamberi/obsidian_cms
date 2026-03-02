
import React, { useState, useEffect, useMemo, useContext, useRef, useCallback } from 'react';
import { Project } from '../../types';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  FolderPlus, 
  Loader2, 
  ArrowLeft, 
  Image as ImageIcon, 
  Search, 
  Star, 
  Settings2, 
  X,
  Sparkles,
  GripVertical,
  Layers,
  AlertTriangle,
  Save,
  Wand2,
  BrainCircuit,
  Zap,
  Target,
  Cpu,
  MessageSquareQuote,
  LayoutGrid,
  // Added Info to imports
  Info
} from 'lucide-react';
import MediaGallery from './MediaGallery';
import GridPlanner from './GridPlanner';
import { UIContext } from '../../services/uiContext';
import { geminiService } from '../../services/geminiService';

// Added missing ProjectEditorProps interface definition
interface ProjectEditorProps {
  projects: Project[];
  onSave: (project: Project) => Promise<any>;
  onAdd: (project: Project) => Promise<Project>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (projects: Project[]) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

const ProjectCardItem: React.FC<{
  project: Project;
  onSelect: () => void;
  onDelete: (id: string) => void;
  ui: any;
  isDragging: boolean;
  onDragUpdate: (id: string, info: any) => void;
  setDraggingId: (id: string | null) => void;
}> = ({ project, onSelect, onDelete, ui, isDragging, onDragUpdate, setDraggingId }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const dragControls = useDragControls();

  return (
    <motion.div 
      layout 
      drag 
      dragControls={dragControls} 
      dragListener={false} 
      dragSnapToOrigin 
      onDragStart={() => setDraggingId(project.id)} 
      onDragEnd={() => setDraggingId(null)} 
      onDrag={(e, info) => onDragUpdate(project.id, info)}
      className={`group relative bg-obsidian-surface border rounded-xl overflow-hidden cursor-pointer shadow-lg transition-all h-full ${
        isDragging ? 'z-50 border-neon-cyan scale-105 opacity-90 ring-4 ring-neon-cyan/20 shadow-neon-cyan/10' : 'z-0 border-obsidian-border hover:border-neon-cyan/50'
      }`}
      onClick={() => !isDragging && onSelect()}
    >
      <div className="relative aspect-video bg-obsidian-surface overflow-hidden">
        <img 
          src={project.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800'} 
          onLoad={() => setImageLoaded(true)} 
          className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-40 group-hover:opacity-100' : 'opacity-0'}`} 
        />
        <div 
          onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }} 
          className="absolute top-2 left-2 p-2 bg-black/70 text-white/90 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing border border-white/10 shadow-xl"
        >
           <GripVertical size={16} />
        </div>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            ui?.confirm({ 
              title: "Purge Project Record?", 
              message: `Warning: You are about to permanently delete "${project.title}".`, 
              onConfirm: () => onDelete(project.id) 
            }); 
          }} 
          className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 shadow-xl"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="p-4 bg-obsidian-surface/40">
        <h3 className="text-sm font-bold text-white truncate">{project.title}</h3>
        <p className="text-[10px] text-obsidian-textMuted uppercase font-mono mt-1 tracking-widest">{project.category}</p>
      </div>
    </motion.div>
  );
};

const AIWriterButton: React.FC<{ isLoading: boolean; onClick: () => void; }> = ({ isLoading, onClick }) => (
  <button 
    onClick={(e) => { e.preventDefault(); onClick(); }}
    disabled={isLoading}
    className={`absolute right-3 top-3 p-2 rounded-lg border transition-all flex items-center gap-2 group z-20 overflow-hidden ${
      isLoading 
        ? 'bg-neon-purple border-neon-purple text-white shadow-[0_0_20px_rgba(176,38,255,0.4)]' 
        : 'bg-obsidian-bg border-obsidian-border text-neon-purple hover:border-neon-purple/60 hover:bg-neon-purple/5 shadow-md'
    }`}
  >
    {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:scale-110 transition-transform" />}
    <span className="text-[9px] font-black uppercase tracking-widest hidden group-hover:inline transition-all">AI Write</span>
    {isLoading && <div className="absolute inset-0 shimmer-ai pointer-events-none" />}
  </button>
);

const ProjectEditor: React.FC<ProjectEditorProps> = ({ projects, onSave, onAdd, onDelete, onReorder, onDirtyChange }) => {
  const ui = useContext(UIContext);
  const [viewMode, setViewMode] = useState<'grid' | 'edit'>('grid');
  const [selectedId, setSelectedId] = useState<string>('');
  const [localProject, setLocalProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAILoading, setIsAILoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPromptValue, setAIPromptValue] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const originalProject = useMemo(() => projects.find(p => p.id === selectedId) || null, [selectedId, projects]);

  const isDirty = useMemo(() => {
    if (!localProject || !originalProject) return false;
    return JSON.stringify(localProject) !== JSON.stringify(originalProject);
  }, [localProject, originalProject]);

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (viewMode === 'edit' && selectedId) {
      if (originalProject) setLocalProject(JSON.parse(JSON.stringify(originalProject)));
    } else if (viewMode === 'grid') {
      setLocalProject(null);
    }
  }, [selectedId, originalProject, viewMode]);

  const updateField = useCallback((path: string, value: any) => {
    setLocalProject(prev => {
        if (!prev) return null;
        const next = JSON.parse(JSON.stringify(prev));
        const keys = path.split('.');
        let current: any = next;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return next;
    });
  }, []);

  const handleAIWriteField = async (field: string, prompt: string) => {
    if (!localProject?.title) return ui?.notify("Project Title Required", "error");
    
    // If no context, ask for it first
    if (!localProject.aiContext) {
      setAIPromptValue('');
      setShowAIPrompt(true);
      // We'll need a way to resume this specific field write after context is provided
      // For simplicity, let's just ask them to use Magic Fill or provide context first
      return ui?.notify("Please provide project context first via Magic Fill", "info");
    }

    setIsAILoading(field);
    try {
      const result = await geminiService.generateText(
        `Project: "${localProject.title}". 
         Role: "${localProject.category}". 
         Context: "${localProject.aiContext}". 
         Task: ${prompt}. 
         Requirement: Keep it very short and punchy.`
      );
      updateField(field, result);
      ui?.notify("AI Content Generated");
    } catch (e) {
      ui?.notify("AI Write Failed", "error");
    } finally {
      setIsAILoading(null);
    }
  };

  const handleMagicFill = async () => {
    if (!localProject?.title) return ui?.notify("Project Title Required", "error");
    setAIPromptValue(localProject.aiContext || '');
    setShowAIPrompt(true);
  };

  const confirmMagicFill = async () => {
    if (!aiPromptValue.trim()) return ui?.notify("Context Required", "error");
    setIsAILoading('magic');
    setShowAIPrompt(false);
    
    // Save context to project
    updateField('aiContext', aiPromptValue);

    try {
      const data = await geminiService.magicFillProject(localProject!.title, localProject!.category, aiPromptValue);
      updateField('description', data.description);
      updateField('narrative.challenge', data.challenge);
      updateField('narrative.execution', data.execution);
      updateField('narrative.result', data.result);
      updateField('tags', data.tags);
      ui?.notify("Magic Intelligence Sync Complete");
    } catch (e) {
      ui?.notify("AI Sync Failed", "error");
    } finally {
      setIsAILoading(null);
    }
  };

  const handleSave = async (silent: boolean = false) => {
    if (!localProject) return;
    setIsSaving(true);
    try {
      await onSave(localProject);
      if (silent) onDirtyChange?.(false);
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragUpdate = useCallback((draggedId: string, info: any) => {
    if (!gridRef.current) return;
    const fromIndex = projects.findIndex(p => p.id === draggedId);
    if (fromIndex === -1) return;
    const gridItems = Array.from(gridRef.current.children) as HTMLElement[];
    const { x, y } = info.point;
    let toIndex = fromIndex;
    for (let i = 0; i < gridItems.length; i++) {
      if (i === fromIndex || i >= projects.length) continue;
      const rect = gridItems[i].getBoundingClientRect();
      const dist = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2));
      if (dist < 60) { toIndex = i; break; }
    }
    if (toIndex !== fromIndex) {
      const next = [...projects];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      onReorder?.(next);
    }
  }, [projects, onReorder]);

  if (viewMode === 'grid') {
    const filtered = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-obsidian-surface border border-obsidian-border p-6 rounded-2xl gap-4 shadow-xl">
          <div><h2 className="text-xl font-bold text-white flex items-center gap-3"><FolderPlus className="text-neon-cyan" size={24} /> Visual Vault</h2><p className="text-[10px] text-obsidian-textMuted font-mono mt-1 uppercase tracking-widest flex items-center gap-2"><Zap size={10} className="text-neon-lime" /> Ordering System Active</p></div>
          <div className="flex flex-col sm:flex-row gap-3"><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={14} /><input placeholder="Filter Projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-neon-purple outline-none shadow-inner" /></div><button onClick={async () => { setIsCreating(true); try { const id = `proj_${Date.now()}`; await onAdd({ id, title: 'Untitled', category: 'New', filterCategory: 'coding', image: '', description: '', tags: [], specs: { typography: '', colors: [], grid: '' }, narrative: { challenge: '', execution: '', result: '' }, gallery: [] }); setSelectedId(id); setViewMode('edit'); } finally { setIsCreating(false); } }} disabled={isCreating} className="px-6 py-3 bg-neon-purple text-black font-black rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">{isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}<span className="text-[10px] uppercase tracking-widest">New Deployment</span></button></div>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20"><AnimatePresence mode="popLayout">{filtered.map((p) => (<ProjectCardItem key={p.id} project={p} ui={ui} isDragging={draggingId === p.id} onSelect={() => { setSelectedId(p.id); setViewMode('edit'); }} onDelete={onDelete} onDragUpdate={handleDragUpdate} setDraggingId={setDraggingId} />))}</AnimatePresence></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-obsidian-surface border border-neon-purple/30 p-8 rounded-2xl text-center shadow-2xl">
              <AlertTriangle size={48} className="text-neon-purple mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white uppercase mb-2">Unsaved Meta</h3>
              <p className="text-obsidian-textMuted text-sm font-mono mb-8 leading-relaxed">Changes to "{localProject?.title}" will be lost.</p>
              <div className="flex flex-col gap-3">
                <button onClick={async () => { if(await handleSave(true)) { setShowExitConfirm(false); setViewMode('grid'); } }} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neon-lime text-black rounded-xl font-black uppercase text-[10px] tracking-widest"><Save size={16} /> Save & Proceed</button>
                <button onClick={() => { onDirtyChange?.(false); setShowExitConfirm(false); setViewMode('grid'); }} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600/10 border border-red-500/30 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white"><Trash2 size={16} /> Discard Changes</button>
                <button onClick={() => setShowExitConfirm(false)} className="w-full px-6 py-4 bg-obsidian-bg border border-obsidian-border text-white rounded-xl font-black uppercase text-[10px] tracking-widest">Stay</button>
              </div>
            </motion.div>
          </div>
        )}

        {showAIPrompt && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-obsidian-surface border border-neon-purple/30 p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-neon-purple/10 rounded-xl">
                  <BrainCircuit size={32} className="text-neon-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase">Magic Intelligence</h3>
                  <p className="text-obsidian-textMuted text-[10px] font-mono uppercase tracking-widest">Contextual Case Study Generation</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">What is this project about?</label>
                <textarea 
                  autoFocus
                  value={aiPromptValue}
                  onChange={(e) => setAIPromptValue(e.target.value)}
                  placeholder="e.g. A high-end e-commerce platform for luxury watches built with Next.js and Framer Motion..."
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-5 text-white h-40 text-sm focus:border-neon-purple outline-none transition-all resize-none leading-relaxed"
                />
                <p className="text-[9px] text-obsidian-textMuted italic">AI will generate short, punchy descriptions for Challenge, Execution, and Outcome based on your input.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={confirmMagicFill}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-neon-purple text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-neon-purple/20 hover:bg-white hover:text-black transition-all"
                >
                  <Sparkles size={16} /> Generate Case Study
                </button>
                <button 
                  onClick={() => { setShowAIPrompt(false); setAIPromptValue(''); }}
                  className="px-8 py-4 bg-obsidian-bg border border-obsidian-border text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-obsidian-border transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center justify-between mb-6 bg-obsidian-bg sticky top-0 z-30 py-4 border-b border-obsidian-border">
        <div className="flex items-center gap-6">
          <button onClick={() => isDirty ? setShowExitConfirm(true) : setViewMode('grid')} className="text-obsidian-textMuted hover:text-white flex items-center gap-2 font-black font-mono text-[10px] tracking-widest uppercase transition-colors"><ArrowLeft size={18} className="text-neon-cyan" /> Back to Vault</button>
          <div className="h-6 w-px bg-obsidian-border" />
          <button onClick={handleMagicFill} disabled={isAILoading === 'magic'} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all relative overflow-hidden ${isAILoading === 'magic' ? 'bg-neon-purple border-neon-purple text-white shadow-lg' : 'border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10'}`}>{isAILoading === 'magic' ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={14} />} Magic Fill{isAILoading === 'magic' && <div className="absolute inset-0 shimmer-ai pointer-events-none" />}</button>
        </div>
        <button onClick={() => handleSave(false)} disabled={isSaving || !isDirty} className={`px-10 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all shadow-xl ${isDirty ? 'bg-neon-lime text-black shadow-neon-lime/20 hover:bg-white' : 'bg-obsidian-surface text-obsidian-textMuted opacity-50 cursor-not-allowed border border-obsidian-border'}`}>{isSaving ? 'Syncing...' : 'Save Record'}</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pb-24 custom-scrollbar pr-1">
          {/* Identity Section */}
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-8 space-y-8 shadow-2xl">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 border-b border-obsidian-border pb-6"><Settings2 size={18} className="text-neon-cyan" /> Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2"><label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Name</label><input value={localProject?.title || ''} onChange={(e) => updateField('title', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-white text-sm focus:border-neon-cyan outline-none transition-all" /></div>
              <div className="space-y-2"><label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Type</label><input value={localProject?.category || ''} onChange={(e) => updateField('category', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-white text-sm focus:border-neon-cyan outline-none transition-all" /></div>
              <div className="space-y-2"><label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Segment</label><select value={localProject?.filterCategory} onChange={(e) => updateField('filterCategory', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-white text-sm outline-none focus:border-neon-cyan cursor-pointer transition-all"><option value="coding">Software</option><option value="graphic">Graphic</option><option value="motion">Motion</option><option value="photo-video">Photo</option></select></div>
              <div className="space-y-2"><label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Project Link</label><input value={localProject?.link || ''} onChange={(e) => updateField('link', e.target.value)} placeholder="https://..." className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-white text-sm focus:border-neon-cyan outline-none transition-all" /></div>
              <div className="space-y-2">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Visibility</label>
                <button 
                  onClick={() => updateField('featured', !localProject?.featured)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${localProject?.featured ? 'bg-neon-lime/10 border-neon-lime text-neon-lime' : 'bg-obsidian-bg border-obsidian-border text-obsidian-textMuted'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest">{localProject?.featured ? 'Featured' : 'Standard'}</span>
                  <Star size={14} className={localProject?.featured ? 'fill-neon-lime' : ''} />
                </button>
              </div>
            </div>
            <div className="space-y-2 relative"><label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Summary</label><AIWriterButton isLoading={isAILoading === 'description'} onClick={() => handleAIWriteField('description', 'Write a short project summary (max 2 sentences).')} /><textarea value={localProject?.description || ''} onChange={(e) => updateField('description', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-5 text-white h-28 text-sm focus:border-neon-purple outline-none transition-all resize-none leading-relaxed" /></div>
          </div>

          {/* Case Narrative Section */}
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-8 space-y-8 shadow-2xl">
             <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 border-b border-obsidian-border pb-6"><Wand2 size={18} className="text-neon-purple" /> Case Narrative</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2 relative"><label className="text-[10px] text-obsidian-textMuted uppercase font-mono flex items-center gap-2"><Target size={12} className="text-neon-pink" /> Challenge</label><AIWriterButton isLoading={isAILoading === 'narrative.challenge'} onClick={() => handleAIWriteField('narrative.challenge', 'Write a short, punchy explanation of the core challenge.')} /><textarea value={localProject?.narrative?.challenge || ''} onChange={(e) => updateField('narrative.challenge', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-5 text-white h-48 text-sm focus:border-neon-purple outline-none transition-all resize-none leading-relaxed" /></div>
                <div className="space-y-2 relative"><label className="text-[10px] text-obsidian-textMuted uppercase font-mono flex items-center gap-2"><Cpu size={12} className="text-neon-cyan" /> Execution</label><AIWriterButton isLoading={isAILoading === 'narrative.execution'} onClick={() => handleAIWriteField('narrative.execution', 'Write a brief overview of the technical process and tools.')} /><textarea value={localProject?.narrative?.execution || ''} onChange={(e) => updateField('narrative.execution', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-5 text-white h-48 text-sm focus:border-neon-purple outline-none transition-all resize-none leading-relaxed" /></div>
                <div className="space-y-2 relative"><label className="text-[10px] text-obsidian-textMuted uppercase font-mono flex items-center gap-2"><MessageSquareQuote size={12} className="text-neon-lime" /> Outcome</label><AIWriterButton isLoading={isAILoading === 'narrative.result'} onClick={() => handleAIWriteField('narrative.result', 'Write a quick summary of the final success and impact.')} /><textarea value={localProject?.narrative?.result || ''} onChange={(e) => updateField('narrative.result', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-5 text-white h-48 text-sm focus:border-neon-purple outline-none transition-all resize-none leading-relaxed" /></div>
             </div>
          </div>

          {/* Design Specs Section */}
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-8 space-y-8 shadow-2xl">
             <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 border-b border-obsidian-border pb-6"><Layers size={18} className="text-neon-lime" /> Design Specs</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest flex items-center gap-2">Typography</label>
                  <input 
                    value={localProject?.specs?.typography || ''} 
                    onChange={(e) => updateField('specs.typography', e.target.value)} 
                    placeholder="e.g. Inter, Playfair Display"
                    className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl p-4 text-white text-sm focus:border-neon-cyan outline-none transition-all" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest flex items-center gap-2">Color Palette</label>
                  <div className="flex flex-wrap gap-3">
                    {localProject?.specs?.colors?.map((color, idx) => (
                      <div key={idx} className="group relative">
                        <input 
                          type="color" 
                          value={color} 
                          onChange={(e) => {
                            const newColors = [...(localProject?.specs?.colors || [])];
                            newColors[idx] = e.target.value;
                            updateField('specs.colors', newColors);
                          }}
                          className="w-10 h-10 rounded-lg border border-obsidian-border cursor-pointer bg-transparent overflow-hidden"
                        />
                        <button 
                          onClick={() => {
                            const newColors = localProject?.specs?.colors?.filter((_, i) => i !== idx);
                            updateField('specs.colors', newColors);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => updateField('specs.colors', [...(localProject?.specs?.colors || []), '#000000'])}
                      className="w-10 h-10 rounded-lg border border-dashed border-obsidian-border flex items-center justify-center text-obsidian-textMuted hover:border-neon-cyan hover:text-neon-cyan transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
             </div>
          </div>

          {/* Media Section - Full Row Full Screen Experience */}
          <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-8 shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-obsidian-border pb-6">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                <ImageIcon size={18} className="text-neon-cyan" /> Visual Assets
              </h3>
              <p className="text-[10px] text-obsidian-textMuted font-mono uppercase tracking-widest hidden md:block">
                Drag and drop assets to reorder • Double-click to set as primary cover
              </p>
            </div>
            <MediaGallery 
              items={localProject?.gallery || []} 
              currentCover={localProject?.image || ''} 
              onChange={(items) => updateField('gallery', items)} 
              onSetCover={(url) => updateField('image', url)} 
            />
          </div>

          {/* Architecture and Metadata - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-8 shadow-2xl flex flex-col">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 border-b border-obsidian-border pb-6"><Layers size={18} className="text-neon-purple" /> Bento Grid Architecture</h3>
              <div className="flex-1 mt-6">
                <GridPlanner value={localProject?.gridArea || ''} onChange={(val) => updateField('gridArea', val)} />
              </div>
            </div>

            <div className="bg-obsidian-surface border border-obsidian-border rounded-2xl p-8 shadow-2xl flex flex-col">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 border-b border-obsidian-border pb-6"><LayoutGrid size={18} className="text-neon-lime" /> Metadata Tags</h3>
              <div className="mt-10 space-y-6 flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Stack Classification</label>
                  <button onClick={async () => { setIsAILoading('tags'); const t = await geminiService.generateText(`Suggest 6 technical tags for "${localProject?.title}". Return only comma separated values.`); updateField('tags', t.split(',').map(s=>s.trim())); setIsAILoading(null); }} disabled={isAILoading !== null} className="text-[9px] text-neon-purple hover:text-white uppercase font-black tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"><Sparkles size={12} /> Auto-Tag AI</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localProject?.tags?.map((tag, idx) => (
                    <motion.span key={`${tag}-${idx}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-1.5 bg-obsidian-bg border border-obsidian-border text-neon-cyan text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-3 group hover:border-neon-cyan/50 transition-all">
                      {tag}
                      <button onClick={() => updateField('tags', localProject.tags.filter((_, i) => i !== idx))} className="text-obsidian-textMuted hover:text-red-500 transition-colors"><X size={10} /></button>
                    </motion.span>
                  ))}
                  <div className="relative">
                    <input 
                      onKeyDown={(e) => { if (e.key === 'Enter') { const val = (e.target as HTMLInputElement).value.trim(); if (val) { updateField('tags', [...(localProject?.tags || []), val]); (e.target as HTMLInputElement).value = ''; } } }} 
                      className="bg-obsidian-bg border border-obsidian-border rounded-lg text-[10px] text-white px-3 py-1.5 outline-none focus:border-neon-cyan w-40 font-mono transition-all" 
                      placeholder="+ Manual Add" 
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-obsidian-border">
                <div className="flex items-center gap-3 text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest italic">
                  <Info size={14} className="text-neon-cyan" />
                  These tags drive the smart filtering on the live site.
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
