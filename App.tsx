import React, { useState, useEffect } from 'react';
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
  LogOut
} from 'lucide-react';
import { Project, Experience, ViewState } from './types';
import { api } from './services/firebaseService'; // REAL FIREBASE
import DashboardOverview from './components/Dashboard/Overview';
import ProjectEditor from './components/Project/ProjectEditor';
import ExperienceManager from './components/Experience/ExperienceManager';
import DeployStatus from './components/Deploy/DeployStatus';
import Login from './components/Auth/Login';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProjects, fetchedExperience] = await Promise.all([
          api.getProjects(),
          api.getExperience()
        ]);
        setProjects(fetchedProjects);
        setExperience(fetchedExperience);
      } catch (error) {
        console.error("Firebase connection error:", error);
        showNotification("Firebase Sync Error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateProject = async (newProject: Project) => {
    try {
      await api.createProject(newProject);
      setProjects(prev => [newProject, ...prev]);
      showNotification(`"${newProject.title}" Sync Complete`);
    } catch (e) {
      showNotification("Firebase Write Error");
    }
  };

  const handleSaveProject = async (updatedProject: Project) => {
    try {
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      await api.updateProject(updatedProject);
      showNotification("Database Updated Successfully");
    } catch (e) {
      showNotification("Sync Failed");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const previousProjects = [...projects];
    setProjects(prev => prev.filter(p => p.id !== projectId));
    showNotification("Project Removed");

    try {
      await api.deleteProject(projectId);
    } catch (e) {
      console.error("Firestore delete error:", e);
      setProjects(previousProjects);
      showNotification("Delete Failed - Server Busy");
    }
  };

  const handleSaveExperience = async (updatedExp: Experience[]) => {
    try {
      setExperience(updatedExp);
      await api.saveExperience(updatedExp);
      showNotification("Timeline Saved to Cloud");
    } catch (e) {
      showNotification("Timeline Sync Failed");
    }
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
      <Icon size={20} className={`transition-colors ${currentView === view ? 'text-neon-cyan' : 'group-hover:text-white'}`} />
      <span className="font-medium tracking-wide">{label}</span>
      {currentView === view && (
        <motion.div layoutId="active-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_#00F0FF]" />
      )}
    </button>
  );

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-obsidian-bg text-obsidian-text font-sans selection:bg-neon-cyan selection:text-black cursor-auto">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-obsidian-bg border-r border-obsidian-border transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
              <p className="text-xs text-obsidian-textMuted font-mono">Backend: Google Cloud</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <div className="text-xs font-mono text-obsidian-textMuted uppercase tracking-wider mb-4 px-2">Collections</div>
            <NavItem view="dashboard" icon={LayoutDashboard} label="Overview" />
            <NavItem view="projects" icon={FolderKanban} label="Projects" />
            <NavItem view="experience" icon={History} label="Experience" />
            
            <div className="mt-8 text-xs font-mono text-obsidian-textMuted uppercase tracking-wider mb-4 px-2">System</div>
            <button
               onClick={() => setIsDeploying(true)}
               className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/30 transition-all group"
            >
              <Rocket size={20} />
              <span className="font-medium">Deploy Prod</span>
            </button>
            <div className="px-4 py-3 flex items-center gap-2 text-obsidian-textMuted text-sm">
               <Database size={16} />
               <span>Status: <span className="text-green-500">Cloud Connected</span></span>
            </div>
          </nav>

          <div className="mt-auto pt-4 border-t border-obsidian-border">
             <button 
               onClick={() => setIsAuthenticated(false)}
               className="w-full flex items-center gap-2 px-4 py-2 text-obsidian-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
             >
               <LogOut size={16} />
               <span className="text-sm font-medium">Sign Out</span>
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-16 border-b border-obsidian-border bg-obsidian-bg/50 backdrop-blur-md flex items-center justify-between px-6 z-40">
          <button 
            className="md:hidden text-obsidian-text hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-textMuted" size={16} />
               <input 
                  type="text" 
                  placeholder="Query live cloud database..." 
                  className="w-full bg-obsidian-surface border border-obsidian-border rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-neon-purple transition-colors text-white font-mono"
               />
             </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
             <button className="relative p-2 text-obsidian-text hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full shadow-[0_0_8px_#FF0055]"></span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-obsidian-bg p-6 scroll-smooth">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 size={48} className="animate-spin text-neon-cyan" />
                <p className="font-mono text-sm text-neon-cyan animate-pulse">Syncing with Google Cloud...</p>
             </div>
          ) : (
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <DashboardOverview key="dashboard" projects={projects} experience={experience} />
              )}
              {currentView === 'projects' && (
                <ProjectEditor 
                  key="projects" 
                  projects={projects} 
                  onSave={handleSaveProject} 
                  onAdd={handleCreateProject}
                  onDelete={handleDeleteProject}
                />
              )}
              {currentView === 'experience' && (
                <ExperienceManager key="experience" experience={experience} setExperience={handleSaveExperience} />
              )}
            </AnimatePresence>
          )}
        </div>
        
        <AnimatePresence>
          {notification && (
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 50 }}
               className="fixed bottom-6 right-6 bg-obsidian-surface border border-neon-cyan text-white px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.2)] z-50 flex items-center gap-3"
            >
               <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
               <span className="font-mono text-sm">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isDeploying && <DeployStatus onClose={() => setIsDeploying(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;