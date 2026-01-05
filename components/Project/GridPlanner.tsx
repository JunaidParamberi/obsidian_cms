
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Maximize2, 
  Layout, 
  Columns, 
  Square, 
  GalleryVertical, 
  StretchHorizontal,
  BoxSelect,
  Monitor,
  Sparkles,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface GridPlannerProps {
  value: string;
  onChange: (value: string) => void;
}

const PRESETS = [
  { id: 'standard', label: 'Standard', cols: 4, rows: 1, icon: Square, desc: '3 per row' },
  { id: 'medium', label: 'Portrait', cols: 6, rows: 1, icon: Columns, desc: '2 per row' },
  { id: 'hero', label: 'Hero Feature', cols: 8, rows: 2, icon: Maximize2, desc: 'Main focus' },
  { id: 'tall', label: 'Vertical Tall', cols: 4, rows: 3, icon: GalleryVertical, desc: 'High aspect' },
  { id: 'panoramic', label: 'Full Strip', cols: 12, rows: 1, icon: StretchHorizontal, desc: 'Break-out' },
  { id: 'cinema', label: 'Cinematic', cols: 12, rows: 3, icon: Layout, desc: 'Max impact' }
];

const GridPlanner: React.FC<GridPlannerProps> = ({ value, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState<'width' | 'height' | 'both' | null>(null);

  // Parse current grid area from string like 'md:col-span-8 md:row-span-2'
  const dims = useMemo(() => {
    const colMatch = value.match(/col-span-(\d+)/);
    const rowMatch = value.match(/row-span-(\d+)/);
    return {
      cols: colMatch ? parseInt(colMatch[1]) : 4,
      rows: rowMatch ? parseInt(rowMatch[1]) : 1
    };
  }, [value]);

  const updateGrid = (cols: number, rows: number) => {
    const safeCols = Math.min(12, Math.max(1, cols));
    const safeRows = Math.min(4, Math.max(1, rows));
    onChange(`md:col-span-${safeCols} md:row-span-${safeRows}`);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = rect.width / 12;
    const cellHeight = rect.height / 4;

    const newCols = Math.round(x / cellWidth);
    const newRows = Math.round(y / cellHeight);

    if (isResizing === 'width') {
      updateGrid(newCols, dims.rows);
    } else if (isResizing === 'height') {
      updateGrid(dims.cols, newRows);
    } else if (isResizing === 'both') {
      updateGrid(newCols, newRows);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, dims]);

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-neon-purple/10 rounded-lg">
              <BoxSelect size={18} className="text-neon-purple" />
           </div>
           <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Bento Architecture</h4>
              <p className="text-[10px] text-obsidian-textMuted font-mono">Size: {dims.cols}x{dims.rows} Units</p>
           </div>
        </div>
        <div className="text-[10px] font-mono bg-obsidian-bg px-2 py-1 rounded border border-obsidian-border text-neon-cyan">
          {value}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const isActive = dims.cols === preset.cols && dims.rows === preset.rows;
          return (
            <button
              key={preset.id}
              onClick={() => updateGrid(preset.cols, preset.rows)}
              className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left group relative overflow-hidden ${
                isActive 
                  ? 'bg-neon-purple/10 border-neon-purple shadow-[0_0_15px_rgba(176,38,255,0.1)]' 
                  : 'bg-obsidian-bg border-obsidian-border hover:border-obsidian-textMuted'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <preset.icon size={16} className={isActive ? 'text-neon-purple' : 'text-obsidian-textMuted'} />
                <span className="text-[9px] font-mono text-obsidian-textMuted">{preset.cols}x{preset.rows}</span>
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wide mb-0.5 ${isActive ? 'text-white' : 'text-obsidian-textMuted'}`}>
                {preset.label}
              </span>
              <span className="text-[9px] text-obsidian-textMuted group-hover:text-white/50 transition-colors">
                {preset.desc}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-preset" 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-purple"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Visual Perspective Preview */}
      <div className="bg-obsidian-bg rounded-2xl border border-obsidian-border p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
              <Monitor size={12} className="text-obsidian-textMuted" />
              <span className="text-[10px] uppercase font-mono text-obsidian-textMuted">Interactive Grid Simulation (12x4)</span>
           </div>
           {isResizing && (
             <span className="text-[10px] text-neon-purple font-mono animate-pulse uppercase">Resizing...</span>
           )}
        </div>
        
        <div 
          ref={containerRef}
          className="relative aspect-[21/11] bg-black/40 rounded-lg border border-obsidian-border/50 border-dashed p-4 overflow-hidden"
        >
          {/* Background Grid Lines (12 cols, 4 rows) */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-4 gap-1 p-4 pointer-events-none opacity-20">
             {Array.from({ length: 48 }).map((_, i) => (
               <div key={i} className="border border-obsidian-border rounded-sm" />
             ))}
          </div>

          {/* Interaction Grid */}
          <div className="grid grid-cols-12 grid-rows-4 gap-2 h-full relative z-10">
            {/* The Selected Card Preview */}
            <motion.div 
              layout
              initial={false}
              className={`bg-neon-purple/20 border-2 border-neon-purple rounded-lg shadow-[0_0_30px_rgba(176,38,255,0.2)] flex items-center justify-center relative group select-none transition-shadow ${isResizing ? 'shadow-[0_0_40px_rgba(176,38,255,0.4)]' : ''}`}
              style={{
                gridColumn: `span ${dims.cols}`,
                gridRow: `span ${dims.rows}`
              }}
            >
              <div className="text-[10px] font-black text-neon-purple uppercase tracking-widest flex flex-col items-center">
                 <span className={isResizing === 'width' || isResizing === 'both' ? 'scale-125 transition-transform' : ''}>{dims.cols}</span>
                 <div className="w-4 h-px bg-neon-purple/50 my-1" />
                 <span className={isResizing === 'height' || isResizing === 'both' ? 'scale-125 transition-transform' : ''}>{dims.rows}</span>
              </div>
              
              {/* Resize Handles */}
              {/* Width Handle */}
              <div 
                onMouseDown={(e) => { e.stopPropagation(); setIsResizing('width'); }}
                className="absolute -right-1 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-end group/handle"
              >
                <div className="w-1 h-8 bg-neon-purple/40 group-hover/handle:bg-neon-purple rounded-full mr-0.5 transition-colors" />
              </div>

              {/* Height Handle */}
              <div 
                onMouseDown={(e) => { e.stopPropagation(); setIsResizing('height'); }}
                className="absolute -bottom-1 left-0 right-0 h-3 cursor-row-resize flex items-center justify-center group/handle"
              >
                <div className="w-8 h-1 bg-neon-purple/40 group-hover/handle:bg-neon-purple rounded-full mb-0.5 transition-colors" />
              </div>

              {/* Corner Handle */}
              <div 
                onMouseDown={(e) => { e.stopPropagation(); setIsResizing('both'); }}
                className="absolute -bottom-1 -right-1 w-4 h-4 cursor-nwse-resize flex items-center justify-center group/handle z-20"
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-neon-purple/60 group-hover/handle:border-neon-purple rounded-br-sm transition-colors" />
              </div>
            </motion.div>

            {/* Ghost Fillers to show context in 4 rows */}
            {Array.from({ length: 48 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-obsidian-surface/10 border border-obsidian-border/10 rounded-lg hidden md:block" 
                style={{ gridColumn: 'span 1', gridRow: 'span 1' }}
              />
            )).slice(0, 48 - (dims.cols * dims.rows))}
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-obsidian-textMuted font-mono">
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><ChevronRight size={10} className="text-neon-cyan" /> Drag edges to resize card</span>
              <span className="flex items-center gap-1"><ChevronDown size={10} className="text-neon-purple" /> Snap-to-grid enabled</span>
           </div>
           <Sparkles size={12} className="text-neon-lime animate-pulse" />
        </div>
      </div>
      
      <p className="text-[10px] text-obsidian-textMuted italic flex items-center gap-2">
        <Sparkles size={10} className="text-neon-lime" />
        Note: The 12-column system is responsive. These settings apply to Desktop layouts.
      </p>
    </div>
  );
};

export default GridPlanner;
