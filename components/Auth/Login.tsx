
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, Fingerprint } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('junaidparamberi@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock Authentication Logic
    setTimeout(() => {
      if (email === 'junaidparamberi@gmail.com' && password === 'admin') {
        onLogin();
      } else {
        setError('Invalid credentials. Access denied.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-obsidian-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(176,38,255,0.05),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-lime opacity-50" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-obsidian-surface border border-obsidian-border p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-obsidian-bg border border-obsidian-border rounded-full shadow-[0_0_15px_rgba(176,38,255,0.2)]">
            <Fingerprint size={32} className="text-neon-purple" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Secure CMS Access</h1>
          <p className="text-obsidian-textMuted text-sm font-mono">Mock Auth Mode Active.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-wider">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg px-4 py-3 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-wider">Passkey</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-lg px-4 py-3 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
              placeholder="admin"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span className="truncate">{error}</span>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-neon-purple/90 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 shadow-[0_0_20px_rgba(176,38,255,0.3)]"
          >
            {isLoading ? (
              <span className="animate-pulse">Validating Identity...</span>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-obsidian-border text-center">
           <div className="flex items-center justify-center gap-2 text-[10px] text-obsidian-textMuted font-mono uppercase">
             <Lock size={12} />
             <span>Local Session Persistence Active</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
