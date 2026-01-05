import React, { useRef, useState } from 'react';
import { GalleryItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, FileVideo, FileImage } from 'lucide-react';
import { api } from '../../services/firebaseService';

interface MediaGalleryProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ items, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const removeItem = (index: number) => {
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
    setIsUploading(true);
    const newItems: GalleryItem[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) continue;

      try {
        // REAL FIREBASE STORAGE UPLOAD
        const firebaseUrl = await api.uploadMedia(file);
        newItems.push({
          type: isVideo ? 'video' : 'image',
          url: firebaseUrl
        });
      } catch (error) {
        console.error("Firebase Storage Upload Error:", error);
      }
    }

    onChange([...items, ...newItems]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={`${idx}-${item.url.substring(item.url.length - 15)}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="relative group aspect-square rounded-lg overflow-hidden border border-obsidian-border bg-black shadow-lg"
              >
                {item.type === 'image' ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                   <div className="p-1.5 bg-black/50 backdrop-blur rounded-md text-white/70">
                      {item.type === 'image' ? <FileImage size={14} /> : <FileVideo size={14} />}
                   </div>
                   <button 
                    onClick={() => removeItem(idx)}
                    className="p-1.5 bg-red-500/80 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col gap-3 items-center justify-center transition-all group
              ${isUploading 
                ? 'border-neon-lime/50 bg-neon-lime/5 cursor-wait' 
                : 'border-obsidian-border hover:border-neon-purple hover:bg-obsidian-surface'
              }`}
          >
             {isUploading ? (
               <div className="flex flex-col items-center gap-2 text-neon-lime">
                 <Loader2 size={32} className="animate-spin" />
                 <span className="text-xs font-mono animate-pulse">Uploading to Cloud...</span>
               </div>
             ) : (
               <>
                 <div className="p-4 rounded-full bg-obsidian-card border border-obsidian-border group-hover:scale-110 group-hover:border-neon-purple/50 transition-all">
                   <Upload size={24} className="text-obsidian-textMuted group-hover:text-neon-purple" />
                 </div>
                 <div className="text-center px-2">
                   <span className="block text-sm font-medium text-white group-hover:text-neon-purple">Persistent Storage</span>
                   <span className="text-[10px] text-obsidian-textMuted font-mono uppercase mt-1">S3-Compatible Cloud</span>
                 </div>
               </>
             )}
          </button>
        </div>
        
        {isDragging && (
          <div className="absolute inset-0 bg-neon-lime/10 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 border-2 border-neon-lime">
             <div className="flex flex-col items-center gap-4 text-neon-lime">
                <Upload size={48} className="animate-bounce" />
                <span className="text-xl font-bold tracking-widest uppercase text-center px-6">Upload to Google Cloud Storage</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;