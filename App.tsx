
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  History, 
  Rocket, 
  Menu, 
  X,
  Search,
  Loader2,
  LogOut,
  AlertTriangle,
  Info,
  CheckCircle2,
  Users,
  UserCircle,
  Save,
  Trash2,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';
import { Project, Experience, Client, ViewState, Overview } from './types';
import { api } from './services/firebaseService';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { UIContext } from './services/uiContext';
import DashboardOverview from './components/Dashboard/Overview';
import ProjectEditor from './components/Project/ProjectEditor';
import ExperienceManager from './components/Experience/ExperienceManager';
import ClientsManager from './components/Client/ClientsManager';
import OverviewEditor from './components/Profile/OverviewEditor';
import SecuritySettingsView from './components/Settings/SecuritySettings';
import DeployStatus from './components/Deploy/DeployStatus';
import Login from './components/Auth/Login';
import ResetPassword from './components/Auth/ResetPassword';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('obsidian_auth_session') === 'active';
  });
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isDirty, setIsDirty] = useState(false);
  const [pendingView, setPendingView] = useState<ViewState | null>(null);

  // Auth Action Handler (For Reset Password Links)
  const [authActionCode, setAuthActionCode] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'loading' | 'error'} | null>(null);
  const [modalConfig, setModalConfig] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    type: 'danger' | 'info';
    onConfirm: () => void; 
  } | null>(null);

  const reorderTimeoutRef = useRef<any>(null);

  // Check for Auth Action Links (Reset Password)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    if (mode === 'resetPassword' && oobCode) {
      setAuthActionCode(oobCode);
    }
  }, []);

  // Sync with Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('obsidian_auth_session', 'active');
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('obsidian_auth_session');
      }
      setIsAuthInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [p, e, c, o] = await Promise.all([
          api.getProjects(),
          api.getExperience(),
          api.getClients(),
          api.getOverview()
        ]);
        setProjects(p);
        setExperience(e);
        setClients(c);
        setOverview(o);
      } catch (error) {
        console.error("Initial data fetch failed:", error);
        showNotification("Cloud Sync Failed", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const showNotification = useCallback((msg: string, type: 'success' | 'loading' | 'error' = 'success') => {
    setNotification({ msg, type });
    if (type !== 'loading') setTimeout(() => setNotification(null), 4000);
  }, []);

  const triggerConfirm = useCallback((options: { title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' }) => {
    setModalConfig({ isOpen: true, title: options.title, message: options.message, type: options.type || 'danger', onConfirm: options.onConfirm });
  }, []);

  // --- Handlers ---

  const handleSaveOverview = async (data: Overview) => {
    try {
      showNotification("Saving Profile...", "loading");
      await api.saveOverview(data);
      setOverview(data);
      showNotification("Profile Synced");
      setIsDirty(false);
    } catch (e: any) {
      console.error("Overview Save Error:", e);
      showNotification(`Save Failed: ${e.message || "Network Error"}`, "error");
    }
  };

  const handleCreateProject = async (p: Project) => {
    try {
      showNotification("Creating Project...", "loading");
      const newProj = await api.createProject(p);
      setProjects(prev => [...prev, newProj]);
      showNotification("Draft Created");
      return newProj;
    } catch (e: any) {
      console.error("Project Creation Error:", e);
      showNotification(`Creation Failed: ${e.message}`, "error");
      throw e;
    }
  };

  const handleSaveProject = async (p: Project) => {
    try {
      showNotification("Saving Project...", "loading");
      await api.updateProject(p);
      setProjects(prev => prev.map(old => old.id === p.id ? p : old));
      showNotification("Project Saved");
      setIsDirty(false);
    } catch (e: any) {
      console.error("Project Save Error:", e);
      if (e.message.includes('permissions')) {
        showNotification("Security Error: Insufficient Firestore Permissions.", "error");
      } else {
        showNotification(`Save Failed: ${e.message}`, "error");
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      showNotification("Deleting Project...", "loading");
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      showNotification("Project Deleted");
    } catch (e: any) {
      console.error("Project Delete Error:", e);
      showNotification(`Delete Failed: ${e.message}`, "error");
    }
  };

  const handleSaveExperience = async (updated: Experience[]) => {
    try {
      showNotification("Updating Journey...", "loading");
      await api.saveExperience(updated);
      setExperience(updated);
      showNotification("Journey Updated");
      setIsDirty(false);
    } catch (e: any) {
      console.error("Experience Save Error:", e);
      showNotification(`Save Failed: ${e.message}`, "error");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      showNotification("Removing Event...", "loading");
      await api.deleteExperience(id);
      setExperience(prev => prev.filter(e => e.id !== id));
      showNotification("Event Removed");
    } catch (e: any) {
      console.error("Experience Removal Error:", e);
      showNotification(`Removal Failed: ${e.message}`, "error");
    }
  };

  const handleSaveClient = async (client: Client) => {
    try {
      showNotification("Syncing Partner...", "loading");
      await api.saveClient(client);
      setClients(prev => {
        const exists = prev.some(c => c.id === client.id);
        if (exists) return prev.map(c => c.id === client.id ? client : c);
        return [client, ...prev];
      });
      showNotification("Partner Record Synced");
      setIsDirty(false);
    } catch (e: any) {
      console.error("Client Save Error:", e);
      showNotification(`Save Failed: ${e.message}`, "error");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      showNotification("Removing Partner...", "loading");
      await api.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      showNotification("Partner Removed");
    } catch (e: any) {
      console.error("Client Removal Error:", e);
      showNotification(`Removal Failed: ${e.message}`, "error");
    }
  };

  const handleReorderProjects = (p: Project[]) => {
    setProjects(p);
    if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current);
    reorderTimeoutRef.current = setTimeout(async () => {
      try {
        await api.updateProjectOrders(p.map((item, idx) => ({ id: item.id, order: idx })));
        showNotification("Sequence Updated");
      } catch (e: any) {
        console.error("Reorder Error:", e);
        showNotification(`Reorder Sync Failed: ${e.message}`, "error");
      }
    }, 2000);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('obsidian_auth_session');
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  const requestNav = (view: ViewState) => {
    if (isDirty) {
      setPendingView(view);
      triggerConfirm({
        title: "Unsaved Progress",
        message: "You have unsaved changes. Leaving now will discard your progress. Continue?",
        type: 'danger',
        onConfirm: () => {
          setIsDirty(false);
          setCurrentView(view);
          setMobileMenuOpen(false);
          setPendingView(null);
        }
      });
    } else {
      setCurrentView(view);
      setMobileMenuOpen(false);
    }
  };

  // Render Auth Action Handler (Reset Password)
  if (authActionCode) {
    return (
      <ResetPassword 
        oobCode={authActionCode} 
        onComplete={() => {
          // Reset the code and return to login
          setAuthActionCode(null);
          window.history.replaceState({}, document.title, window.location.pathname);
        }} 
      />
    );
  }

  if (isAuthInitializing) {
    return (
      <div className="h-screen bg-obsidian-bg flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="animate-spin text-neon-purple" size={40} />
        <p className="font-mono text-xs text-obsidian-textMuted uppercase tracking-widest">Verifying Identity Stream...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <UIContext.Provider value={{ confirm: triggerConfirm, notify: showNotification }}>
      <div className="flex h-screen bg-obsidian-bg text-obsidian-text overflow-hidden">
        <aside className={`fixed md:relative z-50 w-64 h-full bg-obsidian-bg border-r border-obsidian-border transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex flex-col h-full p-6">
            <h1 className="text-xl font-bold text-neon-cyan mb-10 flex items-center gap-2">
              <Rocket size={20} /> OBSIDIAN.CMS
            </h1>
            <nav className="flex-1 space-y-2">
              <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={requestNav} />
              <NavItem view="overview" icon={UserCircle} label="Global Profile" active={currentView === 'overview'} onClick={requestNav} />
              <NavItem view="projects" icon={FolderKanban} label="Projects" active={currentView === 'projects'} onClick={requestNav} />
              <NavItem view="experience" icon={History} label="Journey" active={currentView === 'experience'} onClick={requestNav} />
              <NavItem view="clients" icon={Users} label="Partners" active={currentView === 'clients'} onClick={requestNav} />
              <NavItem view="settings" icon={Settings} label="App Settings" active={currentView === 'settings'} onClick={requestNav} />
            </nav>
            <div className="mt-10 pt-10 border-t border-obsidian-border space-y-2">
              <button onClick={() => setIsDeploying(true)} className="w-full flex items-center gap-3 p-3 rounded-lg text-neon-purple hover:bg-neon-purple/10 transition-colors"><Rocket size={18} /> Deploy Site</button>
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><LogOut size={18} /> Log Out</button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-obsidian-bg">
          <header className="h-16 border-b border-obsidian-border flex items-center justify-between px-6 bg-obsidian-surface/30 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu /></button>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-obsidian-border">
                {isOnline ? (
                  <Wifi size={12} className="text-green-400" />
                ) : (
                  <WifiOff size={12} className="text-red-500" />
                )}
                <span className={`text-[10px] font-mono uppercase tracking-widest ${isOnline ? 'text-green-400' : 'text-red-500'}`}>
                  {isOnline ? 'Cloud Linked' : 'Offline Mode'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isDirty && <span className="text-[10px] font-mono text-neon-purple animate-pulse uppercase border border-neon-purple/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(176,38,255,0.2)]">Unsaved Edits</span>}
              <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-[10px] font-bold text-neon-cyan">JP</div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="animate-spin text-neon-cyan" size={40} />
                <p className="font-mono text-xs text-obsidian-textMuted uppercase tracking-widest">Hydrating Cloud Context...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  {currentView === 'dashboard' && <DashboardOverview projects={projects} experience={experience} />}
                  {currentView === 'projects' && <ProjectEditor projects={projects} onSave={handleSaveProject} onAdd={handleCreateProject} onDelete={handleDeleteProject} onReorder={handleReorderProjects} onDirtyChange={setIsDirty} />}
                  {currentView === 'experience' && <ExperienceManager experience={experience} onUpdate={handleSaveExperience} onDelete={handleDeleteExperience} onDirtyChange={setIsDirty} />}
                  {currentView === 'clients' && <ClientsManager clients={clients} onSave={handleSaveClient} onDelete={handleDeleteClient} />}
                  {currentView === 'overview' && <OverviewEditor initialData={overview} onSave={handleSaveOverview} onDirtyChange={setIsDirty} />}
                  {currentView === 'settings' && <SecuritySettingsView />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>

        <AnimatePresence>
          {modalConfig?.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-obsidian-surface border border-obsidian-border p-6 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className={modalConfig.type === 'danger' ? 'text-red-500' : 'text-neon-cyan'} size={24} />
                    <h3 className="text-white font-bold text-lg">{modalConfig.title}</h3>
                  </div>
                  <p className="text-obsidian-textMuted text-sm mb-6 leading-relaxed">{modalConfig.message}</p>
                  <div className="flex gap-3">
                     <button onClick={() => { modalConfig.onConfirm(); setModalConfig(null); }} className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase transition-all active:scale-95 ${modalConfig.type === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_15px_rgba(239,68,68,0.3)]' : 'bg-neon-cyan text-black hover:bg-white'}`}>Proceed</button>
                     <button onClick={() => setModalConfig(null)} className="flex-1 py-2.5 bg-obsidian-bg border border-obsidian-border text-white rounded-xl font-bold text-xs uppercase hover:bg-obsidian-surface transition-all">Cancel</button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: 300, opacity: 0 }} 
              className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-[100] border ${
                notification.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 
                notification.type === 'loading' ? 'bg-obsidian-surface border-neon-purple text-neon-purple' :
                'bg-obsidian-surface border-neon-cyan text-neon-cyan'
              }`}
            >
              {notification.type === 'loading' ? <Loader2 className="animate-spin" size={18} /> : 
               notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span className="text-sm font-medium pr-4">{notification.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>{isDeploying && <DeployStatus onClose={() => setIsDeploying(false)} />}</AnimatePresence>
      </div>
    </UIContext.Provider>
  );
};

const NavItem = ({ view, icon: Icon, label, active, onClick }: { view: ViewState, icon: any, label: string, active: boolean, onClick: (v: ViewState) => void }) => (
  <button onClick={() => onClick(view)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${active ? 'bg-obsidian-surface text-neon-cyan shadow-[inset_0_0_10px_rgba(0,240,255,0.05)]' : 'text-obsidian-textMuted hover:bg-obsidian-surface/50 hover:text-white'}`}>
    <Icon size={18} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default App;
