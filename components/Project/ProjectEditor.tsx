import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, FileJson, Save, Plus, Trash2, Monitor, Code, FolderPlus, Loader2, ArrowLeft, Image as ImageIcon, Search } from 'lucide-react';
import MediaGallery from './MediaGallery';
import GridPlanner from './GridPlanner';

interface ProjectEditorProps {
  projects: Project[];
  onSave: (project: Project) => Promise<void>;
  onAdd: (project: Project) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ projects, onSave, onAdd, onDelete }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'edit'>('grid');
  const [selectedId, setSelectedId] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'visual' | 'json'>('visual');
  const [localProject, setLocalProject] = useState<Project | null>(null);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (viewMode === 'edit' && selectedId) {
      const proj = projects.find(p => p.id === selectedId);
      if (proj) {
        setLocalProject(proj);
        setJsonString(JSON.stringify(proj, null, 2));
      } else {
        setViewMode('grid');
      }
    }
  }, [selectedId, projects, viewMode]);

  const handleCreate = async () => {
    const newId = `proj_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      title: 'Untitled Project',
      category: 'Design',
      filterCategory: 'graphic',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
      description: 'Brief description of the project...',
      tags: ['New'],
      specs: { typography: 'Inter', colors: ['#000000', '#ffffff'], grid: 'Responsive 12-Col' },
      narrative: { challenge: '', execution: '', result: '' },
      gallery: [],
      gridArea: 'md:col-span-6 md:row-span-1'
    };
    
    setIsSaving(true);
    try {
      await onAdd(newProject);
      setSelectedId(newId);
      setViewMode('edit');
    } finally {
      setIsSaving(false);
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

  const handleDelete = async (e: React.MouseEvent | null, idToDelete?: string) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const id = idToDelete || selectedId;
    if (!id) return;

    const project = projects.find(p => p.id === id);
    const projTitle = project?.title || 'this project';

    if (window.confirm(`Permanently remove "${projTitle}" from Google Firestore?`)) {
      setDeletingId(id);
      try {
        await onDelete(id);
        if (viewMode === 'edit' && id === selectedId) {
          setViewMode('grid');
        }
      } catch (error) {
        console.error("Cloud Deletion Error:", error);
      } finally {
        setDeletingId(null);
      }
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
    setJsonString(JSON.stringify(newProject, null, 2));
  };

  if (viewMode === 'grid') {
    const filteredProjects = projects.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-obsidian-surface/50 p-4 rounded-xl border border-obsidian-border">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderPlus className="text-neon-cyan" /> Firestore Collection
            </h2>
            <p className="text-xs text-obsidian-textMuted font-mono mt-1">Live Sync • Project Assets</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={14} />
                <input 
                  type="text" 
                  placeholder="Search database..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-neon-purple outline-none"
                />
             </div>
             <button onClick={handleCreate} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-neon-purple text-black font-bold rounded-lg hover:bg-neon-purple/90 transition-colors">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                <span className="hidden md:inline">New Record</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative bg-obsidian-card border border-obsidian-border rounded-xl overflow-hidden cursor-pointer hover:border-neon-cyan/50 transition-all ${deletingId === project.id ? 'opacity-30' : ''}`}
                onClick={() => { if (!deletingId) { setSelectedId(project.id); setViewMode('edit'); } }}
              >
                <div className="aspect-[16/9] relative overflow-hidden bg-black">
                   <img src={project.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                   <div className="absolute inset-0 bg-gradient-to-t from-obsidian-card via-transparent to-transparent pointer-events-none" />
                   
                   {/* Delete Button */}
                   <button 
                     onClick={(e) => handleDelete(e, project.id)}
                     className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white/50 hover:text-red-500 hover:bg-black transition-all z-40 opacity-0 group-hover:opacity-100 border border-white/10"
                   >
                      {deletingId === project.id ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16} />}
                   </button>
                </div>

                <div className="p-4 relative">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neon-lime px-1.5 py-0.5 rounded bg-neon-lime/10 border border-neon-lime/20">
                        {project.filterCategory}
                      </span>
                   </div>
                   <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate">{project.title}</h3>
                   <p className="text-xs text-obsidian-textMuted truncate">{project.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // --- EDITOR VIEW (Simplified for context) ---
  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
       <div className="flex items-center justify-between mb-6 bg-obsidian-bg sticky top-0 z-10 py-2">
         <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('grid')} className="text-obsidian-textMuted hover:text-white transition-colors pr-4 border-r border-obsidian-border flex items-center gap-2">
              <ArrowLeft size={18} /> <span className="text-xs uppercase font-mono">Back</span>
            </button>
            <h2 className="text-sm font-bold text-white">Editing Record: {localProject?.title}</h2>
         </div>
         <div className="flex gap-3">
            <button onClick={(e) => handleDelete(e)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30">
               {deletingId ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-neon-lime/10 text-neon-lime border border-neon-lime/50 rounded-lg hover:bg-neon-lime/20 transition-colors shadow-[0_0_15px_rgba(224,255,0,0.1)]">
               {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
               <span className="font-mono text-xs font-bold uppercase">Sync Changes</span>
            </button>
         </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6 space-y-4">
               <h3 className="text-white font-medium border-b border-obsidian-border pb-2 mb-4">Identity</h3>
               <div className="grid grid-cols-2 gap-4">
                 <input value={localProject?.title} onChange={(e) => updateField('title', e.target.value)} className="bg-obsidian-bg border border-obsidian-border rounded p-3 text-white focus:border-neon-purple outline-none" />
                 <input value={localProject?.category} onChange={(e) => updateField('category', e.target.value)} className="bg-obsidian-bg border border-obsidian-border rounded p-3 text-white focus:border-neon-purple outline-none" />
               </div>
               <textarea value={localProject?.description} onChange={(e) => updateField('description', e.target.value)} className="w-full bg-obsidian-bg border border-obsidian-border rounded p-3 text-white h-24" />
            </div>
            
            <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6">
               <h3 className="text-white font-medium mb-4 flex items-center gap-2"><ImageIcon size={16} className="text-neon-cyan" /> Cloud Assets</h3>
               <MediaGallery items={localProject?.gallery || []} onChange={(items) => updateField('gallery', items)} />
            </div>
            
            <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6">
               <h3 className="text-white font-medium mb-4 flex items-center gap-2"><LayoutGrid size={16} className="text-neon-purple" /> Dynamic Grid Area</h3>
               <GridPlanner value={localProject?.gridArea || ''} onChange={(val) => updateField('gridArea', val)} />
            </div>
        </div>

        <div className="w-1/3 bg-black/50 border border-obsidian-border rounded-xl p-4 overflow-hidden flex flex-col hidden lg:flex">
           <div className="flex items-center gap-2 mb-4 text-[10px] text-neon-lime font-mono uppercase tracking-widest opacity-70">
              <FileJson size={12} /> raw_firestore_document.json
           </div>
           <textarea 
             value={jsonString} 
             readOnly 
             className="flex-1 bg-transparent font-mono text-xs text-green-400/70 outline-none resize-none"
           />
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;