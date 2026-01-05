
import React, { useRef, useState } from 'react';
import { GalleryItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, FileVideo, FileImage, Check, Star, Zap, Link as LinkIcon, Plus } from 'lucide-react';
import { api } from '../../services/firebaseService';

interface MediaGalleryProps {
  items: GalleryItem[];
  currentCover: string;
  onChange: (items: GalleryItem[]) => void;
  onSetCover: (url: string) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ items, currentCover, onChange, onSetCover }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading'>('idle');
  
  // URL Input State
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video'>('image');

  // Client-side image compression utility
  const compressImage = (file: File): Promise<Blob | File> => {
    return new Promise((resolve) => {
      // Don't compress very small files or non-images
      if (file.size < 200 * 1024 || !file.type.startsWith('image/')) {
        return resolve(file);
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8
          );
        };
      };
    });
  };

  const removeItem = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    const newItems: GalleryItem[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) continue;

      try {
        let processedFile: File | Blob = file;
        
        if (isImage) {
          setUploadStatus('compressing');
          processedFile = await compressImage(file);
        }

        setUploadStatus('uploading');
        const firebaseUrl = await api.uploadMedia(processedFile as File);
        
        newItems.push({
          type: isVideo ? 'video' : 'image',
          url: firebaseUrl
        });
        
        if (!currentCover && newItems.length === 1) {
          onSetCover(firebaseUrl);
        }
      } catch (error) {
        console.error("Cloud Asset Sync Error:", error);
      }
    }

    onChange([...items, ...newItems]);
    setUploadStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddFromUrl = () => {
    if (!urlInput.trim()) return;
    
    const newItem: GalleryItem = {
      type: urlType,
      url: urlInput.trim()
    };
    
    onChange([...items, newItem]);
    if (!currentCover) onSetCover(newItem.url);
    
    setUrlInput('');
    setShowUrlInput(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        multiple 
        accept="image/*,video/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <div 
        className={`relative min-h-[150px] transition-all duration-300 rounded-xl ${
          isDragging 
            ? 'bg-neon-lime/5 border-2 border-dashed border-neon-lime' 
            : 'border border-transparent'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {items.map((item, idx) => {
              const isCover = item.url === currentCover;
              return (
                <motion.div
                  key={`${idx}-${item.url.substring(item.url.length - 20)}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`relative group aspect-square rounded-lg overflow-hidden border transition-all bg-black shadow-lg cursor-pointer ${
                    isCover ? 'border-neon-cyan ring-2 ring-neon-cyan/20' : 'border-obsidian-border hover:border-neon-cyan/40'
                  }`}
                  onClick={() => onSetCover(item.url)}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt="" className={`w-full h-full object-cover transition-opacity duration-500 ${isCover ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                  ) : (
                    <div className="relative w-full h-full bg-obsidian-surface">
                       <video src={item.url} className={`w-full h-full object-cover transition-opacity ${isCover ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} muted loop autoPlay playsInline />
                       <div className="absolute top-1 right-1 p-1 bg-black/60 rounded backdrop-blur-sm">
                          <FileVideo size={10} className="text-neon-purple" />
                       </div>
                    </div>
                  )}
                  
                  {isCover && (
                    <div className="absolute top-2 left-2 bg-neon-cyan text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 z-10 shadow-lg">
                       <Star size={10} className="fill-current" /> Cover
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                     <button 
                      onClick={(e) => removeItem(e, idx)}
                      className="p-1.5 bg-red-600/90 text-white rounded-md hover:bg-red-500 transition-colors shadow-lg"
                      title="Purge Asset"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  {!isCover && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                       <span className="bg-neon-cyan/90 text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                          Set Cover
                       </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus !== 'idle'}
              className={`aspect-square border-2 border-dashed rounded-lg flex flex-col gap-2 items-center justify-center transition-all group w-full
                ${uploadStatus !== 'idle'
                  ? 'border-neon-lime/50 bg-neon-lime/5 cursor-wait' 
                  : 'border-obsidian-border hover:border-neon-cyan hover:bg-obsidian-surface'
                }`}
            >
               {uploadStatus !== 'idle' ? (
                 <div className="flex flex-col items-center gap-1 text-neon-lime px-2 text-center">
                   <Loader2 size={24} className="animate-spin" />
                   <span className="block text-[8px] font-mono uppercase">
                     {uploadStatus === 'compressing' ? 'Optimizing' : 'Syncing'}
                   </span>
                 </div>
               ) : (
                 <>
                   <Upload size={18} className="text-obsidian-textMuted group-hover:text-neon-cyan" />
                   <span className="block text-[10px] font-bold text-white group-hover:text-neon-cyan uppercase">Upload</span>
                 </>
               )}
            </button>
            <button 
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="aspect-square border-2 border-dashed border-obsidian-border rounded-lg flex flex-col gap-2 items-center justify-center hover:border-neon-purple hover:bg-obsidian-surface transition-all group w-full"
            >
              <LinkIcon size={18} className="text-obsidian-textMuted group-hover:text-neon-purple" />
              <span className="block text-[10px] font-bold text-white group-hover:text-neon-purple uppercase">Link</span>
            </button>
          </div>
        </div>
        
        {isDragging && (
          <div className="absolute inset-0 bg-neon-cyan/10 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 border-2 border-neon-cyan border-dashed">
             <div className="flex flex-col items-center gap-4 text-neon-cyan">
                <div className="p-6 rounded-full bg-obsidian-bg/80 border border-neon-cyan">
                   <Upload size={48} className="animate-bounce" />
                </div>
                <span className="text-xl font-bold tracking-widest uppercase text-center px-6 font-mono">Release Assets</span>
             </div>
          </div>
        )}
      </div>

      {/* URL Input Form */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-obsidian-card border border-obsidian-border rounded-xl p-4 space-y-4"
          >
             <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-neon-purple uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon size={12} /> External Media Link
                </h4>
                <button onClick={() => setShowUrlInput(false)} className="text-obsidian-textMuted hover:text-white">
                  <X size={14} />
                </button>
             </div>
             <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setUrlType('image')} 
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border transition-all ${urlType === 'image' ? 'bg-neon-cyan text-black border-neon-cyan' : 'bg-obsidian-bg text-obsidian-textMuted border-obsidian-border'}`}
                >
                  Image
                </button>
                <button 
                  onClick={() => setUrlType('video')} 
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border transition-all ${urlType === 'video' ? 'bg-neon-purple text-white border-neon-purple' : 'bg-obsidian-bg text-obsidian-textMuted border-obsidian-border'}`}
                >
                  Video
                </button>
             </div>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..." 
                  className="flex-1 bg-obsidian-bg border border-obsidian-border rounded p-2 text-xs text-white focus:border-neon-purple outline-none"
                />
                <button 
                  onClick={handleAddFromUrl}
                  className="px-4 bg-neon-purple text-white rounded font-bold text-[10px] uppercase hover:bg-neon-purple/90"
                >
                  Add
                </button>
             </div>
             <p className="text-[9px] text-obsidian-textMuted font-mono">Supports direct links to JPG, PNG, MP4, and Vimeo/YouTube direct streams.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;
