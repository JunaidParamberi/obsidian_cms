
import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, Save, Loader2, Globe, Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import { SecuritySettings } from '../../types';
import { api } from '../../services/firebaseService';
import { UIContext } from '../../services/uiContext';

const ToggleSwitch: React.FC<{ 
  isOn: boolean; 
  onToggle: () => void; 
  activeColor: string;
}> = ({ isOn, onToggle, activeColor }) => (
  <button
    onClick={onToggle}
    className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none"
    style={{ backgroundColor: isOn ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.05)' }}
  >
    <div 
      className={`absolute inset-0 rounded-full border transition-colors duration-300 ${
        isOn ? `border-${activeColor}/50` : 'border-obsidian-border'
      }`} 
    />
    <motion.div
      animate={{ x: isOn ? 28 : 4 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`absolute top-1 w-5 h-5 rounded-full shadow-lg flex items-center justify-center ${
        isOn ? `bg-neon-${activeColor}` : 'bg-obsidian-textMuted'
      }`}
      style={{ 
        boxShadow: isOn ? `0 0 15px var(--neon-${activeColor})` : 'none' 
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
    </motion.div>
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        --neon-cyan: #00F0FF;
        --neon-purple: #B026FF;
        --neon-lime: #E0FF00;
      }
    `}} />
  </button>
);

const SecuritySettingsView: React.FC = () => {
  const ui = useContext(UIContext);
  const [settings, setSettings] = useState<SecuritySettings>({
    allowSignUp: true,
    maintenanceMode: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSecuritySettings();
        setSettings(data);
      } catch (e) {
        console.error("Failed to fetch settings", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (field: keyof SecuritySettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateSecuritySettings(settings);
      ui?.notify("Security Protocols Updated");
    } catch (e: any) {
      ui?.notify(`Update Failed: ${e.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-purple" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="bg-obsidian-surface border border-obsidian-border p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Shield size={120} className="text-neon-purple" />
        </div>

        <div className="flex items-center justify-between mb-10 border-b border-obsidian-border pb-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-neon-purple/10 border border-neon-purple/30 rounded-2xl">
                <ShieldCheck size={28} className="text-neon-purple" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Security Vault</h2>
                <p className="text-[10px] text-obsidian-textMuted font-mono uppercase tracking-widest mt-1">Access & Identity Control</p>
             </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-neon-purple text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Commit changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allow Sign-up Toggle */}
          <div className="bg-obsidian-bg/50 border border-obsidian-border p-6 rounded-2xl">
            <div className="flex items-start justify-between mb-6">
               <div className="flex-1 pr-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    {settings.allowSignUp ? <Globe size={14} className="text-neon-cyan" /> : <Lock size={14} className="text-red-500" />}
                    Public Registration
                  </h3>
                  <p className="text-[11px] text-obsidian-textMuted mt-2 leading-relaxed">
                    Toggle the visibility of the "Create Admin" option on the login portal. Disable this to prevent unauthorized registrations.
                  </p>
               </div>
               <ToggleSwitch 
                isOn={settings.allowSignUp} 
                onToggle={() => handleToggle('allowSignUp')} 
                activeColor="cyan" 
               />
            </div>
            <div className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-md border w-fit ${
              settings.allowSignUp ? 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5' : 'text-red-500 border-red-500/20 bg-red-500/5'
            }`}>
              Status: {settings.allowSignUp ? 'Open for Deployment' : 'System Locked'}
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="bg-obsidian-bg/50 border border-obsidian-border p-6 rounded-2xl">
            <div className="flex items-start justify-between mb-6">
               <div className="flex-1 pr-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    <AlertCircle size={14} className={settings.maintenanceMode ? 'text-neon-lime' : 'text-obsidian-textMuted'} />
                    Maintenance Mode
                  </h3>
                  <p className="text-[11px] text-obsidian-textMuted mt-2 leading-relaxed">
                    When active, the public portfolio site will display a maintenance placeholder. Admin access remains active.
                  </p>
               </div>
               <ToggleSwitch 
                isOn={settings.maintenanceMode} 
                onToggle={() => handleToggle('maintenanceMode')} 
                activeColor="lime" 
               />
            </div>
            <div className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-md border w-fit ${
              settings.maintenanceMode ? 'text-neon-lime border-neon-lime/20 bg-neon-lime/5' : 'text-obsidian-textMuted border-obsidian-border bg-obsidian-surface'
            }`}>
              Status: {settings.maintenanceMode ? 'Active Overlay' : 'Public Facing'}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-obsidian-bg/80 border border-obsidian-border rounded-2xl flex items-start gap-3">
          <ShieldAlert size={18} className="text-neon-cyan mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-neon-cyan uppercase tracking-wider block mb-1">Security Protocol</span>
            <p className="text-[10px] text-obsidian-textMuted leading-relaxed">
              For maximum data protection, ensure "Public Registration" is switched <span className="text-white">OFF</span> once your primary account is active. This creates an air-gap for identity creation in the portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsView;
