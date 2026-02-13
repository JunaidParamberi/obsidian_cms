
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ShieldAlert,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { auth } from '../../services/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';

interface ResetPasswordProps {
  oobCode: string;
  onComplete: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ oobCode, onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'verifying' | 'ready' | 'submitting' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setStatus('ready');
      } catch (err: any) {
        console.error("Code verification failed:", err);
        setError("Invalid or expired security token. Please request a new recovery link.");
        setStatus('error');
      }
    };
    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError("Access tokens do not match.");
    }
    if (newPassword.length < 6) {
      return setError("Token complexity insufficient (min 6 chars).");
    }

    setStatus('submitting');
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setTimeout(() => onComplete(), 3000);
    } catch (err: any) {
      setError(`Override Failed: ${err.message}`);
      setStatus('ready');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(176,38,255,0.08),transparent_70%)]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-obsidian-surface border border-obsidian-border p-8 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-neon-purple/20 blur-3xl rounded-full" />

        <div className="flex justify-center mb-8">
          <div className="p-5 bg-obsidian-bg border border-obsidian-border rounded-2xl shadow-[0_0_25px_rgba(176,38,255,0.25)]">
            {status === 'success' ? (
              <CheckCircle2 size={32} className="text-neon-lime" />
            ) : status === 'error' ? (
              <ShieldAlert size={32} className="text-red-500" />
            ) : (
              <KeyRound size={32} className="text-neon-purple" />
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">
            {status === 'success' ? 'Override Complete' : 'Security Override'}
          </h1>
          <p className="text-obsidian-textMuted text-[10px] font-mono uppercase tracking-[0.2em]">
            Obsidian Access Token Recovery
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'verifying' ? (
            <motion.div 
              key="verifying"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-10"
            >
              <Loader2 size={32} className="animate-spin text-neon-purple mb-4" />
              <p className="text-[10px] text-obsidian-textMuted font-mono uppercase tracking-widest">Validating Security Token...</p>
            </motion.div>
          ) : status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center py-6"
            >
              <div className="bg-neon-lime/10 border border-neon-lime/30 p-6 rounded-2xl">
                <p className="text-neon-lime text-xs font-mono uppercase leading-relaxed">
                  Your identity has been re-authenticated. The portal is initializing for redirection.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-obsidian-textMuted font-mono animate-pulse">
                <Loader2 size={12} className="animate-spin" /> RETURNING TO PORTAL...
              </div>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center">
                <p className="text-red-500 text-xs font-mono uppercase leading-relaxed">
                  {error}
                </p>
              </div>
              <button 
                onClick={onComplete}
                className="w-full bg-obsidian-bg border border-obsidian-border text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Back to Login
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onSubmit={handleSubmit} className="space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-neon-cyan uppercase tracking-widest ml-1">New Access Token</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl px-5 py-4 text-white text-sm focus:border-neon-purple outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-neon-cyan uppercase tracking-widest ml-1">Confirm Token</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl px-5 py-4 text-white text-sm focus:border-neon-purple outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-3 text-red-500 text-xs bg-red-500/10 p-4 rounded-xl border border-red-500/20 leading-relaxed"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full bg-neon-purple text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-30 shadow-2xl hover:bg-white hover:text-black uppercase text-[11px] tracking-widest shadow-neon-purple/20"
              >
                {status === 'submitting' ? <Loader2 className="animate-spin" size={18} /> : <>Commit Override <ShieldCheck size={18} /></>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="pt-8 mt-8 border-t border-obsidian-border">
          <div className="flex items-center justify-center gap-2 text-[9px] text-obsidian-textMuted font-mono uppercase">
            <Lock size={12} className="text-neon-lime" />
            <span>AES-256 Protocol Isolation Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
