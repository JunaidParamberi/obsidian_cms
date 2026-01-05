
import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  History, 
  Rocket, 
  Menu, 
  X,
  Search,
  Bell,
  Loader2,
  Database,
  LogOut,
  AlertTriangle,
  Info,
  CheckCircle2,
  Users,
  UserCircle,
  RefreshCw
} from 'lucide-react';
import { Project, Experience, Client, ViewState, Overview } from './types';
import { api } from './services/firebaseService';
import DashboardOverview from './components/Dashboard/Overview';
import ProjectEditor from './components/Project/ProjectEditor';
import ExperienceManager from './components/Experience/ExperienceManager';
import ClientsManager from './components/Client/ClientsManager';
import OverviewEditor from './components/Profile/OverviewEditor';
import DeployStatus from './components/Deploy/DeployStatus';
import Login from './components/Auth/Login';
import { AnimatePresence, motion } from 'framer-motion';

interface UIContextType {
  confirm: (options: { title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' }) => void;
  notify: (msg: string, type?: 'success' | 'loading' | 'error') => void;
}
export const UIContext = createContext<UIContextType | null>(null);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'loading' | 'error'} | null>(null);

  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedProjectsRef = useRef<Project[]>([]);

  const [modalConfig, setModalConfig] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    type: 'danger' | 'info';
    onConfirm: () => void; 
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProjects, fetchedExperience, fetchedClients, fetchedOverview] = await Promise.all([
          api.getProjects(),
          api.getExperience(),
          api.getClients(),
          api.getOverview()
        ]);
        setProjects(fetchedProjects);
        lastSyncedProjectsRef.current = JSON.parse(JSON.stringify(fetchedProjects));
        setExperience(fetchedExperience);
        setClients(fetchedClients);
        setOverview(fetchedOverview);
      } catch (error) {
        console.error("Firebase connection error:", error);
        showNotification("Firebase Sync Error", 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const showNotification = useCallback((msg: string, type: 'success' | 'loading' | 'error' = 'success') => {
    setNotification({ msg, type });
    if (type !== 'loading') {
      setTimeout(() => setNotification(null), 3000);
    }
  }, []);

  const triggerConfirm = useCallback((options: { title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' }) => {
    setModalConfig({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'danger',
      onConfirm: options.onConfirm
    });
  }, []);

  const handleSaveOverview = async (updatedOverview: Overview) => {
    try {
      setOverview(updatedOverview);
      await api.saveOverview(updatedOverview);
      showNotification("Profile Cloud Sync Complete");
    } catch (e) {
      showNotification("Profile Sync Failed", 'error');
    }
  };

  const handleCreateProject = async (newProject: Project) => {
    try {
      const created = await api.createProject(newProject);
      setProjects(prev => [created, ...prev]);
      lastSyncedProjectsRef.current = [created, ...lastSyncedProjectsRef.current];
      showNotification(`"${newProject.title}" Sync Complete`);
    } catch (e) {
      showNotification("Firebase Write Error", 'error');
    }
  };

  const handleSaveProject = async (updatedProject: Project) => {
    try {
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      await api.updateProject(updatedProject);
      showNotification("Database Updated Successfully");
    } catch (e) {
      showNotification("Sync Failed", 'error');
    }
  };

  const handleReorderProjects = (reorderedProjects: Project[]) => {
    setProjects(reorderedProjects);
    
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current);
    }

    reorderTimeoutRef.current = setTimeout(async () => {
      showNotification("Syncing sequence to cloud...", 'loading');
      const updates = reorderedProjects.map((p, index) => ({
        id: p.id,
        order: index
      }));

      try {
        await api.updateProjectOrders(updates);
        lastSyncedProjectsRef.current = JSON.parse(JSON.stringify(reorderedProjects));
        setNotification(null);
        setTimeout(() => showNotification("Cloud Database Updated Successfully"), 100);
      } catch (e) {
        console.error("Reorder persistence failed:", e);
        showNotification("Cloud Reorder Sync Failed", 'error');
      }
    }, 2000); 
  };

  const handleDeleteProject = async (projectId: string) => {
    const snapshot = [...projects];
    setProjects(prev => prev.filter(p => p.id !== projectId));
    try {
      await api.deleteProject(projectId);
      showNotification("Cloud synchronization successful");
    } catch (e: any) {
      setProjects(snapshot);
      showNotification(`Delete Failed: ${e.message || 'Permissions Error'}`, 'error');
    }
  };

  const handleSaveExperience = async (updatedExp: Experience[]) => {
    try {
      setExperience(updatedExp);
      await api.saveExperience(updatedExp);
      showNotification("Timeline Sync Successful");
    } catch (e) {
      showNotification("Timeline Sync Failed", 'error');
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    const snapshot = [...experience];
    setExperience(prev => prev.filter(e => e.id !== experienceId));
    try {
      await api.deleteExperience(experienceId);
      showNotification("Milestone removed from cloud");
    } catch (e: any) {
      setExperience(snapshot);
      showNotification(`Delete Failed: ${e.message}`, 'error');
    }
  };

  const handleSaveClient = async (updatedClient: Client) => {
    try {
      setClients(prev => {
        const exists = prev.find(c => c.id === updatedClient.id);
        if (exists) return prev.map(c => c.id === updatedClient.id ? updatedClient : c);
        return [updatedClient, ...prev];
      });
      await api.saveClient(updatedClient);
      showNotification("Client Partnership Updated");
    } catch (e) {
      showNotification("Client Sync Error", 'error');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    const snapshot = [...clients];
    setClients(prev => prev.filter(c => c.id !== clientId));
    try {
      await api.deleteClient(clientId);
      showNotification("Partner record purged");
    } catch (e: any) {
      setClients(snapshot);
      showNotification("Delete Permission Denied", 'error');
    }
  };

  const handleLogout = () => {
    triggerConfirm({
      title: "Confirm Sign Out",
      message: "Are you sure you want to end your current session?",
      type: 'info',
      onConfirm: () => setIsAuthenticated(false)
    });
  };

  const handleDeployRequest = () => {
    triggerConfirm({
      title: "Trigger Production Build",
      message: "This will push your current database state to the live production environment. Proceed?",
      type: 'info',
      onConfirm: () => setIsDeploying(true)
    });
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
        ${currentView === view 
          ? 'bg-obsidian-border text-neon-cyan border border-obsidian-border' 
          : 'text-obsidian-textMuted hover:bg-obsidian-surface hover:text-white'}`}
    >
      <Icon size={20} className={`shrink-0 transition-colors ${currentView === view ? 'text-neon-cyan' : 'group-hover:text-white'}`} />
      <span className="font-medium tracking-wide text-sm">{label}</span>
      {currentView === view && (
        <motion.div layoutId="active-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_#00F0FF]" />
      )}
    </button>
  );

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <UIContext.Provider value={{ confirm: triggerConfirm, notify: showNotification }}>
      <div className="flex h-screen overflow-hidden bg-obsidian-bg text-obsidian-text font-sans">
        {/* Overlay for mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
            />
          )}
        </AnimatePresence>

        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-obsidian-bg border-r border-obsidian-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center gap-3 px-2 mb-10 mt-2">
              <div className="p-2 rounded bg-obsidian-surface border border-obsidian-border relative overflow-hidden">
                <div className="absolute inset-0 bg-iridescent opacity-10" />
                <div className="w-6 h-6 border-2 border-neon-cyan rounded-sm relative">
                    <div className="absolute top-1 right-1 w-2 h-2 bg-neon-purple rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-neon-ice text-lg leading-tight">Junaid.CMS</h1>
                <p className="text-xs text-obsidian-textMuted font-mono">Status: Secure</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
              <div className="text-[10px] font-mono text-obsidian-textMuted uppercase tracking-widest mb-3 px-2">Collections</div>
              <NavItem view="dashboard" icon={LayoutDashboard} label="Overview" />
              <NavItem view="overview" icon={UserCircle} label="Global Profile" />
              <NavItem view="projects" icon={FolderKanban} label="Projects" />
              <NavItem view="experience" icon={History} label="Journey" />
              <NavItem view="clients" icon={Users} label="Partners" />
              
              <div className="mt-8 text-[10px] font-mono text-obsidian-textMuted uppercase tracking-widest mb-3 px-2">System</div>
              <button
                onClick={handleDeployRequest}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/30 transition-all group"
              >
                <Rocket size={20} className="shrink-0" />
                <span className="font-medium text-sm">Deploy Prod</span>
              </button>
              <div className="px-4 py-3 flex items-center gap-2 text-obsidian-textMuted text-[10px] font-mono uppercase">
                <Database size={12} />
                <span>Cloud: <span className="text-green-500">Active</span></span>
              </div>
            </nav>

            <div className="mt-auto pt-4 border-t border-obsidian-border">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-obsidian-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-full relative overflow-hidden">
          <header className="h-16 border-b border-obsidian-border bg-obsidian-bg/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-40">
            <button 
              className="md:hidden text-obsidian-text hover:text-white p-2 -ml-2 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-1 px-4 hidden sm:block">
               <span className="text-[10px] font-mono text-obsidian-textMuted uppercase">Session: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button className="relative p-2 text-obsidian-text hover:text-white transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-neon-pink rounded-full shadow-[0_0_8px_#FF0055]"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-obsidian-surface border border-obsidian-border flex items-center justify-center text-[10px] font-bold text-neon-cyan">
                JP
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-obsidian-bg p-4 md:p-6 scroll-smooth">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <Loader2 size={48} className="animate-spin text-neon-cyan" />
                  <p className="font-mono text-sm text-neon-cyan animate-pulse">Synchronizing Data Streams...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {currentView === 'dashboard' && <DashboardOverview projects={projects} experience={experience} />}
                  {currentView === 'overview' && <OverviewEditor initialData={overview} onSave={handleSaveOverview} />}
                  {currentView === 'projects' && (
                    <ProjectEditor 
                      projects={projects} 
                      onSave={handleSaveProject} 
                      onAdd={handleCreateProject}
                      onDelete={handleDeleteProject}
                      onReorder={handleReorderProjects}
                    />
                  )}
                  {currentView === 'experience' && (
                    <ExperienceManager 
                      experience={experience} 
                      onUpdate={handleSaveExperience} 
                      onDelete={handleDeleteExperience}
                    />
                  )}
                  {currentView === 'clients' && (
                    <ClientsManager 
                      clients={clients}
                      onSave={handleSaveClient}
                      onDelete={handleDeleteClient}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className={`fixed bottom-4 left-4 right-4 md:left-auto md:bottom-6 md:right-6 border px-4 md:px-6 py-3 rounded-lg shadow-2xl z-[100] flex items-center gap-3 ${
                  notification.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' :
                  notification.type === 'loading' ? 'bg-obsidian-surface border-neon-cyan text-neon-cyan' :
                  'bg-obsidian-surface border-neon-cyan text-white shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                }`}
              >
                {notification.type === 'loading' ? (
                  <RefreshCw size={16} className="animate-spin shrink-0" />
                ) : notification.type === 'error' ? (
                  <AlertTriangle size={16} className="shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="text-neon-cyan shrink-0" />
                )}
                <span className="font-mono text-[10px] md:text-sm uppercase tracking-wider truncate">{notification.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {modalConfig && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  onClick={() => setModalConfig(null)}
                />
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className={`relative w-full max-w-md bg-obsidian-surface border p-6 md:p-8 rounded-2xl shadow-2xl ${
                    modalConfig.type === 'danger' ? 'border-red-500/30' : 'border-neon-cyan/30'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-full ${modalConfig.type === 'danger' ? 'bg-red-500/10' : 'bg-neon-cyan/10'}`}>
                        {modalConfig.type === 'danger' ? <AlertTriangle size={32} className="text-red-500" /> : <Info size={32} className="text-neon-cyan" />}
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">{modalConfig.title}</h3>
                        <p className="text-obsidian-textMuted text-xs md:text-sm font-mono mt-3">
                          {modalConfig.message}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full pt-6">
                        <button 
                          onClick={() => setModalConfig(null)}
                          className="order-2 sm:order-1 flex-1 px-4 py-3 rounded-xl bg-obsidian-bg border border-obsidian-border text-white hover:bg-obsidian-border transition-all font-bold text-sm"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            modalConfig.onConfirm();
                            setModalConfig(null);
                          }}
                          className={`order-1 sm:order-2 flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg ${
                            modalConfig.type === 'danger' 
                              ? 'bg-red-600 hover:bg-red-500' 
                              : 'bg-neon-cyan text-black hover:bg-neon-cyan/90'
                          }`}
                        >
                          {modalConfig.type === 'danger' ? 'Purge' : 'Execute'}
                        </button>
                      </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {isDeploying && <DeployStatus onClose={() => setIsDeploying(false)} />}
        </AnimatePresence>
      </div>
    </UIContext.Provider>
  );
};

export default App;
