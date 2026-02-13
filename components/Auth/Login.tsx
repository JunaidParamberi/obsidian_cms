
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Fingerprint, 
  Loader2, 
  UserPlus, 
  KeyRound, 
  ShieldAlert, 
  ChevronLeft,
  Mail,
  ShieldCheck,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';
import { auth } from '../../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { api } from '../../services/firebaseService';

interface LoginProps {
  onLogin: () => void;
}

type AuthView = 'login' | 'signup' | 'recovery';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('junaidparamberi@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allowSignUp, setAllowSignUp] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSecurity = async () => {
      try {
        const settings = await api.getSecuritySettings();
        setAllowSignUp(settings.allowSignUp);
      } catch (e) {
        setAllowSignUp(false);
      }
    };
    checkSecurity();
  }, []);

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email UID required for recovery.');
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Recovery link successfully dispatched. Please check your encrypted inbox.");
      setTimeout(() => {
        setSuccessMsg('');
        setView('login');
      }, 5000);
    } catch (err: any) {
      setError(`Recovery Failure: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (view === 'signup') {
        if (allowSignUp === false) throw new Error('SIGN_UP_DISABLED');
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      localStorage.setItem('obsidian_auth_session', 'active');
      onLogin();
    } catch (err: any) {
      if (err.message === 'SIGN_UP_DISABLED') {
        setError('Security Restriction: Administrative registration is currently disabled.');
      } else {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError('Authentication Failure: Identity not verified.');
            break;
          default:
            setError(`System Error: ${err.message || 'Unknown protocol failure'}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(176,38,255,0.08),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-lime opacity-50" />
      
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-obsidian-surface border border-obsidian-border p-8 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-neon-purple/20 blur-3xl rounded-full" />

        <div className="flex justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div 
              key={view + (successMsg ? '-success' : '')}
              initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, rotate: 10, opacity: 0 }}
              className="p-5 bg-obsidian-bg border border-obsidian-border rounded-2xl shadow-[0_0_25px_rgba(176,38,255,0.25)] relative"
            >
              {successMsg ? (
                <CheckCircle2 size={32} className="text-neon-lime" />
              ) : view === 'login' ? (
                <Fingerprint size={32} className="text-neon-purple" />
              ) : view === 'signup' ? (
                <UserPlus size={32} className="text-neon-cyan" />
              ) : (
                <RefreshCcw size={32} className="text-neon-lime" />
              )}
              <div className="absolute inset-0 border border-white/5 rounded-2xl animate-pulse" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">
            {successMsg ? 'Protocol Success' : 
             view === 'login' ? 'Admin Portal' : 
             view === 'signup' ? 'New Deployment' : 'Identity Recovery'}
          </h1>
          <p className="text-obsidian-textMuted text-[10px] font-mono uppercase tracking-[0.2em]">
            Obsidian Cloud Management System
          </p>
        </div>

        <AnimatePresence mode="wait">
          {successMsg ? (
            <motion.div 
              key="success-view"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center py-6"
            >
              <div className="bg-neon-lime/10 border border-neon-lime/30 p-6 rounded-2xl">
                <p className="text-neon-lime text-xs font-mono uppercase leading-relaxed">
                  {successMsg}
                </p>
              </div>
              <p className="text-[10px] text-obsidian-textMuted font-mono uppercase tracking-widest">Redirecting to entry point...</p>
            </motion.div>
          ) : view === 'recovery' ? (
            <motion.form 
              key="recovery-form"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRecovery} className="space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-neon-lime uppercase tracking-widest ml-1">Recovery UID (Email)</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl px-5 py-4 text-white text-sm focus:border-neon-lime outline-none transition-all"
                    placeholder="admin@junaid.tech"
                    required
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian-textMuted/20" size={16} />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 text-red-500 text-xs bg-red-500/10 p-4 rounded-xl border border-red-500/20 leading-relaxed">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-neon-lime text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-neon-lime/20 disabled:opacity-30 uppercase text-[11px] tracking-widest"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Recovery <ArrowRight size={18} /></>}
              </button>
              <button 
                type="button" 
                onClick={() => setView('login')}
                className="w-full text-[10px] text-obsidian-textMuted hover:text-white flex items-center justify-center gap-2 uppercase font-mono tracking-widest"
              >
                <ChevronLeft size={14} /> Back to Entry
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="auth-form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit} className="space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-neon-cyan uppercase tracking-widest ml-1">Identity UID</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl px-5 py-4 text-white text-sm focus:border-neon-purple outline-none transition-all"
                  placeholder="admin@junaid.tech"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-mono text-neon-cyan uppercase tracking-widest ml-1">Access Token</label>
                  <button 
                    type="button" 
                    onClick={() => setView('recovery')}
                    className="text-[9px] text-obsidian-textMuted hover:text-neon-lime uppercase tracking-widest transition-colors"
                  >
                    Forgot Key?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl px-5 py-4 text-white text-sm focus:border-neon-purple outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian-textMuted/20" size={16} />
                </div>
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
                disabled={isLoading}
                className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-30 shadow-2xl ${
                  view === 'signup' ? 'bg-neon-cyan text-black hover:bg-white shadow-neon-cyan/20' : 'bg-neon-purple text-white hover:bg-white hover:text-black shadow-neon-purple/20'
                } uppercase text-[11px] tracking-widest`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>{view === 'signup' ? 'Initialize Deployment' : 'Authenticate Access'} <ArrowRight size={18} /></>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {!successMsg && view !== 'recovery' && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {view === 'signup' ? (
                <motion.button 
                  key="back-to-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  type="button" onClick={() => setView('login')}
                  className="text-[10px] text-obsidian-textMuted hover:text-white uppercase font-black tracking-widest transition-colors flex items-center gap-2 group"
                >
                  Access Portal? <span className="text-neon-purple group-hover:underline">Sign In</span>
                </motion.button>
              ) : allowSignUp === true ? (
                <motion.button 
                  key="go-to-signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  type="button" onClick={() => setView('signup')}
                  className="text-[10px] text-obsidian-textMuted hover:text-white uppercase font-black tracking-widest transition-colors flex items-center gap-2 group"
                >
                  New Deployment? <span className="text-neon-cyan group-hover:underline">Create Admin</span>
                </motion.button>
              ) : allowSignUp === false && (
                <motion.div 
                  key="signup-locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-[10px] text-red-500/50 uppercase font-mono tracking-widest"
                >
                  <ShieldAlert size={12} /> External Registry Locked
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6 border-t border-obsidian-border w-full text-center">
              <div className="flex items-center justify-center gap-2 text-[9px] text-obsidian-textMuted font-mono uppercase">
                <Lock size={12} className="text-neon-lime" />
                <span>AES-256 Quantum Encryption Active</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
