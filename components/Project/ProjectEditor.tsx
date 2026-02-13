
import React, { useState, useEffect, useMemo, useContext, useRef, useCallback } from 'react';
import { Project } from '../../types';
import { motion, AnimatePresence, useDragControls, DragControls } from 'framer-motion';
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
  ChevronDown,
  X,
  Palette,
  Pipette,
  Tag,
  Hash,
  BookOpen,
  History,
  Trophy,
  Target,
  Sparkles,
  GripVertical,
  Layers,
  Type as TypeIcon,
  AlertTriangle,
  Save
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
  onDirtyChange?: (isDirty: boolean) => void;
}

// Fixed: Define interface for ProjectCardItem props to avoid TypeScript key issues
interface ProjectCardItemProps {
  project: Project;
  onSelect: () => void;
  onDelete: (id: string) => void;
  ui: any;
  isDragging: boolean;
  onDragUpdate: (id: string, info: any) => void;
  setDraggingId: (id: string | null) => void;
}

// Fixed: Use React.FC to properly handle component props including intrinsic ones like 'key'
const ProjectCardItem: React.FC<ProjectCardItemProps> = ({ 
  project, 
  onSelect, 
  onDelete, 
  ui, 
  isDragging, 
  onDragUpdate, 
  setDraggingId 
}) => {
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
        isDragging ? 'z-50 border-neon-cyan scale-105 opacity-90' : 'z-0 border-obsidian-border hover:border-neon-cyan/50'
      }`}
      onClick={() => !isDragging && onSelect()}
    >
      <div className="relative aspect-video bg-obsidian-surface overflow-hidden">
        <img 
          src={project.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800'} 
          onLoad={() => setImageLoaded(true)} 
          className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-60 group-hover:opacity-100' : 'opacity-0'}`} 
        />
        <div 
          onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }} 
          className="absolute top-2 left-2 p-2 bg-black/70 text-white/90 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing border border-white/10 touch-none"
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
              message: `Warning: You are about to permanently delete "${project.title}".`, 
              onConfirm: () => onDelete(project.id) 
            }); 
          }} 
          className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="p-4 bg-obsidian-surface/40">
        <h3 className="text-sm font-bold text-white truncate">{project.title}</h3>
        <p className="text-[10px] text-obsidian-textMuted uppercase font-mono mt-1">{project.category}</p>
      </div>
    </motion.div>
  );
};

const ProjectEditor: React.FC<ProjectEditorProps> = ({ projects, onSave, onAdd, onDelete, onReorder, onDirtyChange }) => {
  const ui = useContext(UIContext);
  const [viewMode, setViewMode] = useState<'grid' | 'edit'>('grid');
  const [selectedId, setSelectedId] = useState<string>('');
  const [localProject, setLocalProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const originalProject = useMemo(() => projects.find(p => p.id === selectedId) || null, [selectedId, projects]);

  const isDirty = useMemo(() => {
    if (!localProject || !originalProject) return false;
    return JSON.stringify(localProject) !== JSON.stringify(originalProject);
  }, [localProject, originalProject]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

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

  const handleBack = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      setViewMode('grid');
    }
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
      if (i === fromIndex || i >= projects.length) continue;
      const rect = gridItems[i].getBoundingClientRect();
      const distance = Math.hypot(cursorX - (rect.left + rect.width / 2), cursorY - (rect.top + rect.height / 2));
      if (distance < 100) { toIndex = i; break; }
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
      <div className="flex flex-col h-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-obsidian-surface border border-obsidian-border p-6 rounded-2xl gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><FolderPlus className="text-neon-cyan" size={20} /> Visual Archive</h2>
            <p className="text-[10px] text-obsidian-textMuted font-mono mt-1 uppercase tracking-widest leading-relaxed"><Sparkles size={10} className="inline mr-1 text-neon-lime" /> Reorder live with handles.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={14} />
                <input placeholder="Filter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-neon-purple outline-none" />
             </div>
             <button 
                onClick={async () => { 
                  setIsCreating(true);
                  try {
                    const id = `proj_${Date.now()}`; 
                    await onAdd({ 
                      id, title: 'Untitled', category: 'New', filterCategory: 'coding', 
                      image: '', description: '', tags: [], 
                      specs: { typography: '', colors: [], grid: '' }, 
                      narrative: { challenge: '', execution: '', result: '' }, 
                      gallery: [] 
                    }); 
                    setSelectedId(id); 
                    setViewMode('edit'); 
                  } finally {
                    setIsCreating(false);
                  }
                }} 
                disabled={isCreating} 
                className="px-6 py-2 bg-neon-purple text-black font-bold rounded-lg hover:bg-neon-purple/90 flex items-center justify-center gap-2"
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span className="text-xs uppercase">New Project</span>
             </button>
          </div>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <ProjectCardItem 
                key={p.id} 
                project={p} 
                ui={ui} 
                isDragging={draggingId === p.id} 
                onSelect={() => { setSelectedId(p.id); setViewMode('edit'); }} 
                onDelete={onDelete}
                onDragUpdate={handleDragUpdate}
                setDraggingId={setDraggingId}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-obsidian-surface border border-neon-purple/30 p-8 rounded-2xl text-center">
                <AlertTriangle size={32} className="text-neon-purple mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white uppercase mb-2">Unsaved Progress</h3>
                <p className="text-obsidian-textMuted text-sm font-mono mb-8">Save modifications to "{localProject?.title}"?</p>
                <div className="flex flex-col gap-3">
                    <button onClick={async () => { if(await handleSave(true)) { setShowExitConfirm(false); setViewMode('grid'); } }} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neon-lime text-black rounded-xl font-bold uppercase text-xs"><Save size={16} /> Save & Exit</button>
                    <button onClick={() => { onDirtyChange?.(false); setShowExitConfirm(false); setViewMode('grid'); }} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600/10 border border-red-500/30 text-red-500 rounded-xl font-bold uppercase text-xs"><Trash2 size={16} /> Discard</button>
                    <button onClick={() => setShowExitConfirm(false)} className="w-full px-6 py-3 bg-obsidian-bg border border-obsidian-border text-white rounded-xl font-bold uppercase text-xs">Stay</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6 bg-obsidian-bg sticky top-0 z-30 py-4 border-b border-obsidian-border">
        <button onClick={handleBack} className="text-obsidian-textMuted hover:text-white flex items-center gap-2 font-bold font-mono text-xs"><ArrowLeft size={18} /> BACK</button>
        <button onClick={() => handleSave(false)} disabled={isSaving || !isDirty} className={`px-8 py-2 rounded-lg font-mono text-[10px] font-black uppercase transition-all shadow-lg ${isDirty ? 'bg-neon-lime text-black shadow-[0_0_15px_rgba(224,255,0,0.3)]' : 'bg-obsidian-surface text-obsidian-textMuted opacity-50'}`}>
          {isSaving ? 'Syncing...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-20 custom-scrollbar pr-1">
          <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6 space-y-6">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-obsidian-border pb-4"><Settings2 size={16} className="text-neon-cyan" /> IDENTITY</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono">Title</label>
                <input value={localProject?.title || ''} onChange={(e) => updateField('title', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-3 text-white text-sm" placeholder="Title" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono">Category</label>
                <input value={localProject?.category || ''} onChange={(e) => updateField('category', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-3 text-white text-sm" placeholder="Category" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-obsidian-textMuted uppercase font-mono">Filter</label>
                <select value={localProject?.filterCategory} onChange={(e) => updateField('filterCategory', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-3 text-white text-sm outline-none">
                  <option value="coding">Coding</option><option value="graphic">Graphic</option><option value="motion">Motion</option><option value="photo-video">Photo/Video</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-obsidian-textMuted uppercase font-mono">Summary</label>
              <textarea value={localProject?.description || ''} onChange={(e) => updateField('description', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg p-4 text-white h-24 text-sm" placeholder="Summary..." />
            </div>
          </div>

          <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6">
             <h3 className="text-white font-medium mb-6 flex items-center gap-2 border-b border-obsidian-border pb-4"><ImageIcon size={16} className="text-neon-cyan" /> MEDIA GALLERY</h3>
             <MediaGallery 
                items={localProject?.gallery || []} 
                currentCover={localProject?.image || ''} 
                onChange={(items) => updateField('gallery', items)} 
                onSetCover={(url) => updateField('image', url)} 
              />
          </div>

          <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6">
             <h3 className="text-white font-medium mb-6 flex items-center gap-2 border-b border-obsidian-border pb-4"><Layers size={16} className="text-neon-purple" /> BENTO GRID</h3>
             <GridPlanner value={localProject?.gridArea || ''} onChange={(val) => updateField('gridArea', val)} />
          </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
