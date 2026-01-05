
import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Project } from '../../types';
import { motion, AnimatePresence, useDragControls, DragControls } from 'framer-motion';
import { 
  LayoutGrid, 
  FileJson, 
  Save, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Loader2, 
  ArrowLeft, 
  Image as ImageIcon, 
  Search, 
  Star, 
  Settings2, 
  ChevronDown,
  X,
  Palette,
  Globe,
  Pipette,
  Tag,
  Hash,
  BookOpen,
  History,
  Trophy,
  Target,
  Sparkles,
  GripVertical,
  Layers
} from 'lucide-react';
import MediaGallery from './MediaGallery';
import GridPlanner from './GridPlanner';
import { UIContext } from '../../App';

interface ProjectEditorProps {
  projects: Project[];
  onSave: (project: Project) => Promise<void>;
  onAdd: (project: Project) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  onReorder?: (projects: Project[]) => void;
}

const ProjectCard = ({ 
  project, 
  onSelect, 
  onDelete, 
  ui,
  isDragging,
  dragControls
}: { 
  project: Project; 
  onSelect: () => void; 
  onDelete: (id: string) => void; 
  ui: any;
  isDragging?: boolean;
  dragControls: DragControls;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className={`group relative bg-obsidian-surface border rounded-xl overflow-hidden cursor-pointer shadow-lg transition-all h-full ${
        isDragging ? 'z-50 border-neon-cyan shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-105 opacity-90' : 'z-0 border-obsidian-border hover:border-neon-cyan/50'
      }`}
      onClick={(e) => {
        if (!isDragging) onSelect();
      }}
    >
      <div className="relative aspect-video bg-obsidian-surface overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-surface via-obsidian-border to-obsidian-surface bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] z-0" />
        )}
        
        <img 
          src={project.image} 
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-60 group-hover:opacity-100 scale-100' : 'opacity-0 scale-105'}`} 
          alt={project.title}
        />
        
        {/* Drag handle specifically for reordering */}
        <div 
          onPointerDown={(e) => {
            // Stop propagation and prevent default to isolate drag interaction from card clicks and container scroll
            e.stopPropagation();
            dragControls.start(e);
          }}
          className="absolute top-2 left-2 p-2 bg-black/70 text-white/90 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing border border-white/10 touch-none"
        >
           <GripVertical size={16} />
        </div>

        {project.featured && (
          <div className="absolute bottom-2 left-2 bg-neon-purple p-1 rounded shadow-lg z-10">
            <Star size={12} className="fill-current text-white" />
          </div>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            ui?.confirm({ 
              title: "Purge Project Record?", 
              message: `Warning: You are about to permanently delete "${project.title}". This action is irreversible.`, 
              onConfirm: () => onDelete(project.id)
            });
          }}
          className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-lg opacity-100 transition-opacity hover:bg-red-500 z-10 shadow-xl"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="p-4 bg-obsidian-surface/40">
        <h3 className="text-sm font-bold text-white truncate">{project.title}</h3>
        <p className="text-[10px] text-obsidian-textMuted uppercase font-mono mt-1">{project.category}</p>
      </div>
    </div>
  );
};

// Internal component to handle drag controls per item
const DraggableProjectWrapper = ({ 
  project, 
  draggingId, 
  setDraggingId, 
  handleDragUpdate, 
  onSelect, 
  onDelete, 
  ui 
}: any) => {
  const dragControls = useDragControls();
  
  return (
    <motion.div
      key={project.id}
      layout
      drag
      dragControls={dragControls}
      dragListener={false} // CRITICAL: Disable default drag start on click/touch to fix mobile scroll conflict
      dragSnapToOrigin
      onDragStart={() => setDraggingId(project.id)}
      onDragEnd={() => setDraggingId(null)}
      onDrag={(e, info) => handleDragUpdate(project.id, info)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      style={{ touchAction: 'pan-y' }} // Allow vertical scroll on the wrapper itself
    >
      <ProjectCard 
        project={project} 
        ui={ui} 
        isDragging={draggingId === project.id}
        dragControls={dragControls}
        onSelect={onSelect} 
        onDelete={onDelete} 
      />
    </motion.div>
  );
};

const ProjectEditor: React.FC<ProjectEditorProps> = ({ projects, onSave, onAdd, onDelete, onReorder }) => {
  const ui = useContext(UIContext);
  const [viewMode, setViewMode] = useState<'grid' | 'edit'>('grid');
  const [selectedId, setSelectedId] = useState<string>('');
  const [localProject, setLocalProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  const [debouncedJson, setDebouncedJson] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const originalProject = useMemo(() => {
    return projects.find(p => p.id === selectedId) || null;
  }, [selectedId, projects]);

  const isDirty = useMemo(() => {
    if (!localProject || !originalProject) return false;
    return JSON.stringify(localProject) !== JSON.stringify(originalProject);
  }, [localProject, originalProject]);

  useEffect(() => {
    if (viewMode === 'edit' && selectedId) {
      if (originalProject) {
        setLocalProject(JSON.parse(JSON.stringify(originalProject)));
      } else {
        setViewMode('grid');
        setSelectedId('');
      }
    }
  }, [selectedId, originalProject, viewMode]);

  useEffect(() => {
    if (!localProject) {
      setDebouncedJson('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedJson(JSON.stringify(localProject, null, 2));
    }, 300);
    return () => clearTimeout(timer);
  }, [localProject]);

  const handleCreate = async () => {
    const newId = `proj_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      title: 'Untitled Project',
      category: 'Design & Development',
      filterCategory: 'coding',
      featured: false,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800',
      description: 'Record summary...',
      tags: ['New'],
      specs: { typography: 'Inter', colors: ['#000000'], grid: '12-Col' },
      narrative: { challenge: '', execution: '', result: '' },
      gallery: [],
      gridArea: 'md:col-span-6 md:row-span-1',
      link: ''
    };
    
    setIsCreating(true);
    try {
      await onAdd(newProject);
      setSelectedId(newId);
      setViewMode('edit');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!localProject) return;
    setIsSaving(true);
    try {
      await onSave(localProject);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (path: string, value: any) => {
    if (!localProject) return;
    const newProject = { ...localProject };
    const keys = path.split('.');
    let current: any = newProject;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setLocalProject(newProject);
  };

  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    
    const tag = tagInput.trim();
    if (tag && localProject && !localProject.tags.includes(tag)) {
      updateField('tags', [...localProject.tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!localProject) return;
    updateField('tags', localProject.tags.filter(t => t !== tagToRemove));
  };

  const handleDragUpdate = (draggedId: string, info: any) => {
    if (!gridRef.current) return;
    
    const fromIndex = projects.findIndex(p => p.id === draggedId);
    if (fromIndex === -1) return;

    const gridItems = Array.from(gridRef.current.children) as HTMLElement[];
    const cursorX = info.point.x;
    const cursorY = info.point.y;

    let toIndex = fromIndex;
    
    for (let i = 0; i < gridItems.length; i++) {
      if (i === fromIndex) continue;
      const rect = gridItems[i].getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(cursorX - centerX, cursorY - centerY);

      if (distance < 100) {
        toIndex = i;
        break;
      }
    }

    if (toIndex !== fromIndex) {
      const newProjects = [...projects];
      const [movedProject] = newProjects.splice(fromIndex, 1);
      newProjects.splice(toIndex, 0, movedProject);
      onReorder?.(newProjects);
    }
  };

  if (viewMode === 'grid') {
    const filtered = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
      <div className="flex flex-col h-full space-y-4 md:space-y-6">
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-obsidian-surface border border-obsidian-border p-4 md:p-6 rounded-2xl gap-4">
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <FolderPlus className="text-neon-cyan shrink-0" size={20} /> Visual Archive
            </h2>
            <p className="text-[9px] md:text-[10px] text-obsidian-textMuted font-mono mt-1 uppercase tracking-widest leading-relaxed">
              <Sparkles size={10} className="inline mr-1 text-neon-lime" /> Use the grip handle to reorder live.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative w-full sm:w-48 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={14} />
                <input 
                  placeholder="Filter records..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-neon-purple outline-none" 
                />
             </div>
             <button 
              onClick={handleCreate} 
              disabled={isCreating}
              className="px-6 py-2 bg-neon-purple text-black font-bold rounded-lg hover:bg-neon-purple/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
             >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs">GENERATING...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} /> <span className="text-xs uppercase">New Project</span>
                  </>
                )}
             </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-obsidian-surface border border-obsidian-border border-dashed rounded-3xl opacity-50 text-center px-6">
             <Layers size={40} className="text-obsidian-textMuted mb-4" />
             <p className="text-obsidian-textMuted font-mono text-sm uppercase">No cloud records detected</p>
             <button onClick={handleCreate} className="text-neon-cyan font-bold text-[10px] mt-4 hover:underline uppercase tracking-widest">Create First Project</button>
          </div>
        ) : (
          <div 
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <DraggableProjectWrapper 
                  key={p.id}
                  project={p}
                  draggingId={draggingId}
                  setDraggingId={setDraggingId}
                  handleDragUpdate={handleDragUpdate}
                  onSelect={() => { setSelectedId(p.id); setViewMode('edit'); }}
                  onDelete={onDelete}
                  ui={ui}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-obsidian-bg sticky top-0 z-30 py-4 border-b border-obsidian-border gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode('grid')} className="text-obsidian-textMuted hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> <span className="text-xs font-bold font-mono">BACK</span>
          </button>
          <div className="flex flex-col border-l border-obsidian-border pl-4">
            <h2 className="text-sm font-bold text-white font-mono truncate max-w-[150px] md:max-w-none">{localProject?.title}</h2>
            <span className="text-[9px] text-obsidian-textMuted uppercase font-mono">ID: {localProject?.id}</span>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => ui?.confirm({ 
              title: "Purge Project Record?", 
              message: "Warning: This action is irreversible. All associated cloud data will be purged.", 
              onConfirm: () => { if(localProject) onDelete(localProject.id); setViewMode('grid'); }
            })} 
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-red-500/20 text-red-500 text-[10px] font-black uppercase hover:bg-red-500/10 transition-all"
          >
            Delete
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || !isDirty} 
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-mono text-[10px] font-black uppercase transition-all shadow-lg ${isDirty ? 'bg-neon-lime text-black' : 'bg-obsidian-surface text-obsidian-textMuted opacity-50 cursor-not-allowed'}`}
          >
            {isSaving ? 'Syncing...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pb-20 custom-scrollbar pr-1 md:pr-2">
          
          <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-obsidian-border pb-4 gap-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Settings2 size={16} className="text-neon-cyan shrink-0" /> <span className="text-sm uppercase tracking-wider">Core Identity</span>
              </h3>
              <div className="flex items-center justify-between sm:justify-end gap-3 bg-obsidian-bg px-3 py-2 rounded-lg border border-obsidian-border w-full sm:w-auto">
                <span className="text-[10px] text-obsidian-textMuted uppercase font-mono">Featured Project</span>
                <button 
                  onClick={() => updateField('featured', !localProject?.featured)} 
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${localProject?.featured ? 'bg-neon-purple' : 'bg-obsidian-border'}`}
                >
                  <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${localProject?.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Project Title</label>
                <input value={localProject?.title || ''} onChange={(e) => updateField('title', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-3 text-white focus:border-neon-cyan outline-none transition-colors text-sm" placeholder="Project Name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Display Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={14} />
                  <input value={localProject?.category || ''} onChange={(e) => updateField('category', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-3 pl-10 text-white focus:border-neon-cyan outline-none text-sm" placeholder="UI/UX, Branding..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Filter Type</label>
                <div className="relative">
                  <select value={localProject?.filterCategory} onChange={(e) => updateField('filterCategory', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-3 text-white appearance-none outline-none focus:border-neon-purple text-sm">
                    <option value="coding">Coding / Web</option>
                    <option value="graphic">Graphic Design</option>
                    <option value="motion">Motion GFX</option>
                    <option value="photo-video">Photo & Video</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest flex items-center gap-1">
                <Hash size={10} /> Metadata Tags
              </label>
              <div className="bg-obsidian-bg border border-obsidian-border rounded-lg p-3 min-h-[50px] flex flex-wrap gap-2 items-center">
                <AnimatePresence>
                  {localProject?.tags.map(tag => (
                    <motion.span 
                      key={tag} 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-white transition-colors shrink-0"><X size={10} /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                <input 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyDown={handleAddTag}
                  placeholder="Tag + Enter" 
                  className="bg-transparent text-xs text-white outline-none flex-1 min-w-[100px] ml-1" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest text-neon-cyan">Project URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={14} />
                <input value={localProject?.link || ''} onChange={(e) => updateField('link', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-3 pl-10 text-neon-cyan focus:border-neon-cyan outline-none transition-colors text-sm" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-textMuted uppercase font-mono tracking-widest">Executive Summary</label>
              <textarea value={localProject?.description || ''} onChange={(e) => updateField('description', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-4 text-white h-24 md:h-28 resize-none text-sm focus:border-neon-cyan outline-none leading-relaxed" placeholder="Short description..." />
            </div>
          </div>

          <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 md:p-6 space-y-6">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-obsidian-border pb-4"><BookOpen size={16} className="text-neon-lime shrink-0" /> <span className="text-sm uppercase tracking-wider">Case Study Narrative</span></h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono flex items-center gap-2"><Target size={12} className="text-neon-pink" /> The Challenge</label>
                <textarea value={localProject?.narrative.challenge || ''} onChange={(e) => updateField('narrative.challenge', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-4 text-white h-32 resize-none text-sm focus:border-neon-pink outline-none leading-relaxed transition-colors" placeholder="What problem were you solving?" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono flex items-center gap-2"><History size={12} className="text-neon-cyan" /> Execution</label>
                <textarea value={localProject?.narrative.execution || ''} onChange={(e) => updateField('narrative.execution', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-4 text-white h-32 resize-none text-sm focus:border-neon-cyan outline-none leading-relaxed transition-colors" placeholder="How did you implement it?" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono flex items-center gap-2"><Trophy size={12} className="text-neon-lime" /> The Result</label>
                <textarea value={localProject?.narrative.result || ''} onChange={(e) => updateField('narrative.result', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-4 text-white h-32 resize-none text-sm focus:border-neon-lime outline-none leading-relaxed transition-colors" placeholder="What was the outcome?" />
              </div>
            </div>
          </div>

          <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 md:p-6">
             <h3 className="text-white font-medium mb-6 flex items-center gap-2 border-b border-obsidian-border pb-4"><ImageIcon size={16} className="text-neon-cyan shrink-0" /> <span className="text-sm uppercase tracking-wider">Media Assets</span></h3>
             <MediaGallery items={localProject?.gallery || []} currentCover={localProject?.image || ''} onChange={(items) => updateField('gallery', items)} onSetCover={(url) => updateField('image', url)} />
          </div>
          <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-5 md:p-6">
             <h3 className="text-white font-medium mb-6 flex items-center gap-2 border-b border-obsidian-border pb-4"><LayoutGrid size={16} className="text-neon-purple shrink-0" /> <span className="text-sm uppercase tracking-wider">Bento Grid Planner</span></h3>
             <GridPlanner value={localProject?.gridArea || ''} onChange={(val) => updateField('gridArea', val)} />
          </div>
        </div>

        <div className="w-full lg:w-80 bg-black/40 border border-obsidian-border rounded-xl p-4 hidden xl:flex flex-col">
          <div className="text-[10px] text-neon-lime font-mono uppercase mb-4 opacity-70 flex items-center gap-2"><FileJson size={14} /> JSON Stream</div>
          <textarea value={debouncedJson} readOnly className="flex-1 bg-transparent font-mono text-[10px] text-green-400/50 outline-none resize-none custom-scrollbar leading-relaxed" />
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
