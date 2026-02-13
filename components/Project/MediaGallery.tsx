
import React, { useRef, useState, useEffect } from 'react';
import { GalleryItem } from '../../types';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  X, 
  Upload, 
  Loader2, 
  FileVideo, 
  Star, 
  Link as LinkIcon, 
  GripHorizontal,
  Move,
  LayoutGrid
} from 'lucide-react';
import { api } from '../../services/firebaseService';

interface MediaGalleryProps {
  items: GalleryItem[];
  currentCover: string;
  onChange: (items: GalleryItem[]) => void;
  onSetCover: (url: string) => void;
}

const MediaItem = ({ 
  item, 
  idx, 
  isCover, 
  onRemove, 
  onSetCover, 
  onDragStart,
  onDragUpdate, 
  onDragEnd,
  draggingId
}: any) => {
  const dragControls = useDragControls();
  
  const isThisDragging = draggingId === item.url;

  return (
    <motion.div
      layout
      drag
      dragControls={dragControls}
      dragListener={false}
      dragSnapToOrigin
      onDragStart={() => onDragStart(item.url)}
      onDragEnd={() => onDragEnd()}
      onDrag={(e, info) => onDragUpdate(idx, info)}
      className={`relative group aspect-square rounded-xl overflow-hidden border transition-shadow bg-obsidian-bg cursor-pointer ${
        isThisDragging 
          ? 'z-50 border-neon-cyan shadow-[0_20px_50px_rgba(0,0,0,0.7)] ring-2 ring-neon-cyan/50' 
          : 'z-10 border-obsidian-border hover:border-neon-cyan/40 shadow-md'
      }`}
      onClick={() => !isThisDragging && onSetCover(item.url)}
    >
      {item.type === 'image' ? (
        <img 
          src={item.url} 
          alt="" 
          className={`w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${isCover ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} 
        />
      ) : (
        <div className="relative w-full h-full bg-obsidian-surface pointer-events-none">
           <video src={item.url} className={`w-full h-full object-cover transition-opacity ${isCover ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} muted loop autoPlay playsInline />
           <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded backdrop-blur-md">
              <FileVideo size={12} className="text-neon-purple" />
           </div>
        </div>
      )}
      
      {/* Interaction Layer */}
      <div 
        onPointerDown={(e) => {
          e.preventDefault();
          dragControls.start(e);
        }}
        className="absolute top-2 left-2 p-2 bg-black/80 text-white rounded-lg cursor-grab active:cursor-grabbing opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-30 border border-white/10 shadow-lg"
      >
        <GripHorizontal size={14} />
      </div>

      {isCover && (
        <div className="absolute bottom-2 left-2 bg-neon-cyan text-black px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 z-20 shadow-lg border border-white/20">
           <Star size={8} className="fill-current" /> Cover
        </div>
      )}

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-30">
         <button 
          onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
          className="p-2 bg-red-600/90 text-white rounded-lg hover:bg-red-500 transition-colors shadow-lg border border-red-400/20"
        >
          <X size={12} />
        </button>
      </div>
      
      {!isCover && !isThisDragging && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black/40 backdrop-blur-[2px]">
           <span className="bg-neon-cyan/90 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-xl">
              Focus Asset
           </span>
        </div>
      )}
    </motion.div>
  );
};

const MediaGallery: React.FC<MediaGalleryProps> = ({ items, currentCover, onChange, onSetCover }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [localItems, setLocalItems] = useState<GalleryItem[]>(items);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading'>('idle');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video'>('image');

  // Keep local state in sync when external items change, but NOT while dragging
  useEffect(() => {
    if (!draggingId) {
      setLocalItems(items);
    }
  }, [items, draggingId]);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragUpdate = (fromIndex: number, info: any) => {
    if (!containerRef.current) return;
    
    const gridItems = Array.from(containerRef.current.children) as HTMLElement[];
    const cursorX = info.point.x;
    const cursorY = info.point.y;

    let toIndex = fromIndex;
    
    // Optimized 2D grid distance calculation
    for (let i = 0; i < gridItems.length; i++) {
      if (i === fromIndex) continue;
      // Skip the action buttons at the end
      if (i >= localItems.length) continue;

      const rect = gridItems[i].getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.hypot(cursorX - centerX, cursorY - centerY);

      // Tighter threshold for grid swapping to avoid oscillation
      if (distance < 50) {
        toIndex = i;
        break;
      }
    }

    if (toIndex !== fromIndex) {
      const newItems = [...localItems];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      setLocalItems(newItems);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    // Commit the local reorder to parent state
    onChange(localItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...localItems];
    newItems.splice(index, 1);
    setLocalItems(newItems);
    onChange(newItems);
  };

  const processFiles = async (files: File[]) => {
    const newItems: GalleryItem[] = [];
    setUploadStatus('uploading');
    try {
      for (const file of files) {
        const url = await api.uploadMedia(file);
        newItems.push({ type: file.type.startsWith('video/') ? 'video' : 'image', url });
      }
      const updated = [...localItems, ...newItems];
      setLocalItems(updated);
      onChange(updated);
    } finally {
      setUploadStatus('idle');
    }
  };

  const handleAddFromUrl = () => {
    if (!urlInput.trim()) return;
    const updated = [...localItems, { type: urlType, url: urlInput.trim() }];
    setLocalItems(updated);
    onChange(updated);
    setUrlInput('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        multiple 
        accept="image/*,video/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))} 
      />
      
      <div 
        ref={containerRef}
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative min-h-[160px] p-1 transition-all ${isDraggingFile ? 'scale-[0.98]' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); if(e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files)); }}
      >
        <AnimatePresence mode="popLayout">
          {localItems.map((item, idx) => (
            <MediaItem 
              key={item.url}
              item={item} 
              idx={idx} 
              isCover={item.url === currentCover}
              onRemove={removeItem}
              onSetCover={onSetCover}
              onDragStart={handleDragStart}
              onDragUpdate={handleDragUpdate}
              onDragEnd={handleDragEnd}
              draggingId={draggingId}
            />
          ))}
        </AnimatePresence>
        
        {/* Dynamic Action Zone */}
        {!draggingId && (
          <div className="col-span-1 grid grid-rows-2 gap-3 h-full">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus !== 'idle'}
              className="group relative border-2 border-dashed border-obsidian-border rounded-xl flex flex-col items-center justify-center hover:border-neon-cyan hover:bg-neon-cyan/5 transition-all overflow-hidden"
            >
              {uploadStatus !== 'idle' ? (
                <Loader2 className="animate-spin text-neon-cyan" size={20} />
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="text-obsidian-textMuted group-hover:text-neon-cyan group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-[9px] font-black mt-2 uppercase text-obsidian-textMuted group-hover:text-white">Upload</span>
                </div>
              )}
            </button>
            <button 
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`group border-2 border-dashed border-obsidian-border rounded-xl flex flex-col items-center justify-center transition-all ${
                showUrlInput ? 'bg-neon-purple/10 border-neon-purple' : 'hover:border-neon-purple hover:bg-neon-purple/5'
              }`}
            >
              <LinkIcon className={`transition-colors ${showUrlInput ? 'text-neon-purple' : 'text-obsidian-textMuted group-hover:text-neon-purple'}`} size={18} />
              <span className={`text-[9px] font-black mt-2 uppercase transition-colors ${showUrlInput ? 'text-white' : 'text-obsidian-textMuted group-hover:text-white'}`}>External</span>
            </button>
          </div>
        )}

        {isDraggingFile && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neon-cyan/5 backdrop-blur-md rounded-2xl border-2 border-dashed border-neon-cyan animate-pulse pointer-events-none">
            <Move size={48} className="text-neon-cyan mb-2" />
            <p className="text-neon-cyan font-black text-xs uppercase tracking-widest">Release to Cloud Storage</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showUrlInput && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -10 }} 
            animate={{ height: 'auto', opacity: 1, y: 0 }} 
            exit={{ height: 0, opacity: 0, y: -10 }} 
            className="bg-obsidian-surface border border-obsidian-border p-5 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <LinkIcon size={40} className="text-neon-purple" />
            </div>
            
            <div className="flex gap-2 relative z-10">
              <button 
                onClick={() => setUrlType('image')} 
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border-2 transition-all ${
                  urlType === 'image' ? 'bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'border-obsidian-border text-obsidian-textMuted hover:border-obsidian-textMuted/50'
                }`}
              >
                Static Image
              </button>
              <button 
                onClick={() => setUrlType('video')} 
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border-2 transition-all ${
                  urlType === 'video' ? 'bg-neon-purple text-white border-neon-purple shadow-[0_0_15px_rgba(176,38,255,0.3)]' : 'border-obsidian-border text-obsidian-textMuted hover:border-obsidian-textMuted/50'
                }`}
              >
                Motion Asset
              </button>
            </div>
            
            <div className="flex gap-2 relative z-10">
              <div className="flex-1 relative">
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={14} />
                <input 
                  value={urlInput} 
                  onChange={(e) => setUrlInput(e.target.value)} 
                  placeholder="https://images.unsplash.com/..." 
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-9 pr-4 py-3 text-xs text-white outline-none focus:border-neon-purple transition-colors" 
                />
              </div>
              <button 
                onClick={handleAddFromUrl} 
                disabled={!urlInput.trim()}
                className="px-6 bg-neon-purple text-white rounded-xl font-black text-[10px] uppercase hover:bg-white hover:text-black transition-all disabled:opacity-50"
              >
                Register URL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;
