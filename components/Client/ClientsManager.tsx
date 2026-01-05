
import React, { useState, useContext, useMemo } from 'react';
import { Client } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Edit2, Building2, UserCircle, Calendar, Save, X, Loader2, Sparkles } from 'lucide-react';
import { UIContext } from '../../App';

interface ClientsManagerProps {
  clients: Client[];
  onSave: (client: Client) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ClientsManager: React.FC<ClientsManagerProps> = ({ clients, onSave, onDelete }) => {
  const ui = useContext(UIContext);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localClient, setLocalClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check if we are currently creating a completely new client
  const isCreatingNew = useMemo(() => {
    if (!editingId) return false;
    return !clients.some(c => c.id === editingId);
  }, [editingId, clients]);

  const startEdit = (client: Client) => {
    setLocalClient({ ...client });
    setEditingId(client.id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setLocalClient(null);
  };

  const handleSave = async () => {
    if (!localClient) return;
    setIsSaving(true);
    try {
      await onSave(localClient);
      setEditingId(null);
      setLocalClient(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrigger = (client: Client) => {
    ui?.confirm({
      title: "Purge Partnership Record?",
      message: `Warning: This will permanently remove ${client.name} from your global client roster.`,
      type: 'danger',
      onConfirm: async () => {
        await onDelete(client.id);
      }
    });
  };

  const updateLocal = (field: keyof Client, value: string) => {
    if (localClient) setLocalClient({ ...localClient, [field]: value });
  };

  // Combine existing clients with the new one being created if applicable
  const displayList = useMemo(() => {
    if (isCreatingNew && localClient) {
      return [localClient, ...clients];
    }
    return clients;
  }, [clients, isCreatingNew, localClient]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32">
      <div className="flex justify-between items-center bg-obsidian-surface/50 p-6 rounded-2xl border border-obsidian-border backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-neon-cyan" /> Partnerships
          </h2>
          <p className="text-xs text-obsidian-textMuted font-mono mt-1 uppercase tracking-widest">Global Client Roster</p>
        </div>
        <button 
          onClick={() => startEdit({ id: `client_${Date.now()}`, name: '', role: '', year: new Date().getFullYear().toString(), description: '' })} 
          disabled={editingId !== null}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-lg active:scale-95 ${
            editingId ? 'bg-obsidian-surface text-obsidian-textMuted cursor-not-allowed border border-obsidian-border' : 'bg-neon-cyan text-black hover:bg-neon-cyan/90'
          }`}
        >
          <Plus size={20} />
          <span>New Partner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayList.map((client) => {
            const isEditing = editingId === client.id;
            const display = isEditing && localClient ? localClient : client;
            const isPhantom = isEditing && isCreatingNew;

            return (
              <motion.div 
                key={client.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative bg-obsidian-card border p-6 rounded-2xl transition-all duration-300 ${
                  isEditing 
                    ? 'border-neon-cyan ring-1 ring-neon-cyan/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]' 
                    : 'border-obsidian-border hover:border-neon-cyan/30 shadow-xl'
                }`}
              >
                {isPhantom && (
                  <div className="absolute -top-3 left-4 bg-neon-cyan text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                    <Sparkles size={8} /> New Record
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1.5 flex-1 pr-4">
                    <label className="text-[9px] text-obsidian-textMuted uppercase font-mono tracking-tighter flex items-center gap-1">
                      <Building2 size={8} /> Brand Name
                    </label>
                    {isEditing ? (
                      <input 
                        autoFocus
                        value={display.name} 
                        onChange={(e) => updateLocal('name', e.target.value)} 
                        placeholder="e.g. ADNOC HQ"
                        className="bg-obsidian-bg border border-obsidian-border rounded px-3 py-1.5 text-sm text-white w-full focus:border-neon-cyan outline-none transition-colors" 
                      />
                    ) : (
                      <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors truncate">{display.name}</h3>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <button 
                          onClick={handleSave} 
                          className="p-2 bg-neon-cyan/10 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-all"
                          title="Commit to Cloud"
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                        <button 
                          onClick={handleCancel} 
                          className="p-2 text-obsidian-textMuted hover:bg-white/5 rounded-lg transition-all"
                          title="Discard Changes"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEdit(client)} 
                          className="p-2 text-obsidian-textMuted hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTrigger(client)} 
                          className="p-2 text-obsidian-textMuted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="space-y-1.5">
                      <label className="text-[9px] text-obsidian-textMuted uppercase font-mono tracking-tighter flex items-center gap-1">
                        <UserCircle size={8} /> Role
                      </label>
                      {isEditing ? (
                        <input 
                          value={display.role} 
                          onChange={(e) => updateLocal('role', e.target.value)} 
                          placeholder="Project Lead"
                          className="bg-obsidian-bg border border-obsidian-border rounded px-3 py-1.5 text-xs text-white w-full focus:border-neon-cyan outline-none" 
                        />
                      ) : (
                        <p className="text-xs text-neon-ice font-medium truncate">{display.role}</p>
                      )}
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] text-obsidian-textMuted uppercase font-mono tracking-tighter flex items-center gap-1">
                        <Calendar size={8} /> Year
                      </label>
                      {isEditing ? (
                        <input 
                          value={display.year} 
                          onChange={(e) => updateLocal('year', e.target.value)} 
                          className="bg-obsidian-bg border border-obsidian-border rounded px-3 py-1.5 text-xs text-white w-full focus:border-neon-cyan outline-none font-mono" 
                        />
                      ) : (
                        <p className="text-xs font-mono text-obsidian-textMuted">{display.year}</p>
                      )}
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[9px] text-obsidian-textMuted uppercase font-mono tracking-tighter">Impact Summary</label>
                   {isEditing ? (
                     <textarea 
                        value={display.description} 
                        onChange={(e) => updateLocal('description', e.target.value)} 
                        placeholder="What was your key contribution to this partnership?"
                        className="bg-obsidian-bg border border-obsidian-border rounded px-3 py-2 text-xs text-white w-full h-24 resize-none focus:border-neon-cyan outline-none leading-relaxed transition-colors" 
                      />
                   ) : (
                     <p className="text-xs text-obsidian-text/80 italic leading-relaxed border-l-2 border-obsidian-border pl-3">
                       "{display.description || 'No impact summary provided.'}"
                     </p>
                   )}
                </div>
                
                {isEditing && (
                  <div className="mt-6 pt-4 border-t border-obsidian-border flex justify-end">
                    <button 
                      onClick={handleSave} 
                      className="text-[10px] bg-neon-cyan text-black px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                    >
                      Sync Record
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {displayList.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-obsidian-border rounded-3xl">
             <Users size={48} className="mx-auto text-obsidian-textMuted mb-4 opacity-20" />
             <p className="text-obsidian-textMuted font-mono text-sm">No partnerships found in cloud storage.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsManager;
