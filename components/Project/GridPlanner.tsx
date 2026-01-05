import React from 'react';

interface GridPlannerProps {
  value: string;
  onChange: (value: string) => void;
}

const GridPlanner: React.FC<GridPlannerProps> = ({ value, onChange }) => {
  // Parse current grid area from string like 'md:col-span-8 md:row-span-2'
  const getColSpan = (str: string) => {
    const match = str.match(/col-span-(\d+)/);
    return match ? parseInt(match[1]) : 12;
  };

  const getRowSpan = (str: string) => {
    const match = str.match(/row-span-(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const currentCols = getColSpan(value);
  const currentRows = getRowSpan(value);

  const handleGridClick = (cols: number) => {
    // Simply update cols for this demo, keeping rows constant unless specific logic needed
    const newValue = `md:col-span-${cols} md:row-span-${currentRows}`;
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-2">
         <div className="font-mono text-xs text-neon-cyan">
           {value}
         </div>
         <div className="flex gap-2">
            {[1, 2].map(rows => (
              <button 
                key={rows}
                onClick={() => onChange(`md:col-span-${currentCols} md:row-span-${rows}`)}
                className={`px-2 py-1 text-xs font-mono border rounded ${currentRows === rows ? 'bg-neon-cyan text-black border-neon-cyan' : 'text-obsidian-textMuted border-obsidian-border'}`}
              >
                Row-{rows}
              </button>
            ))}
         </div>
      </div>

      {/* Visual Grid 12 Columns */}
      <div className="grid grid-cols-12 gap-1 h-24 p-2 bg-obsidian-bg rounded border border-obsidian-border border-dashed">
        {Array.from({ length: 12 }).map((_, i) => {
           const isActive = i < currentCols;
           return (
             <div 
               key={i}
               onClick={() => handleGridClick(i + 1)}
               className={`
                  rounded-sm cursor-pointer transition-all duration-200
                  ${isActive ? 'bg-neon-cyan/20 border border-neon-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'bg-obsidian-card hover:bg-white/5'}
               `}
             />
           );
        })}
      </div>
      <p className="text-xs text-obsidian-textMuted">
        Click a column to set width. Toggle buttons for height.
      </p>
    </div>
  );
};

export default GridPlanner;