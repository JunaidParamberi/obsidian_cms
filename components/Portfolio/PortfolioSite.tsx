
import React, { useState, useRef, useEffect } from 'react';
import { Project, Experience } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Mail, MapPin, Smartphone, MoveUpRight, X, Play, Palette, Layers, Cpu } from 'lucide-react';

interface PortfolioProps {
  projects: Project[];
  experience: Experience[];
}

const PortfolioSite: React.FC<PortfolioProps> = ({ projects, experience }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const scrollRef = useRef(null);
  
  // Custom Cursor Logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, []);

  const variants = {
    default: { x: mousePosition.x - 8, y: mousePosition.y - 8, height: 16, width: 16, backgroundColor: "#E0E0FF" },
    text: { x: mousePosition.x - 32, y: mousePosition.y - 32, height: 64, width: 64, backgroundColor: "#00F0FF", mixBlendMode: "difference" as const },
    project: { x: mousePosition.x - 40, y: mousePosition.y - 40, height: 80, width: 80, backgroundColor: "#B026FF", mixBlendMode: "difference" as const }
  };

  const navItems = ['hero', 'about', 'journey', 'archive', 'contact'];

  return (
    <div className="bg-obsidian-bg min-h-screen text-neon-ice font-sans no-cursor" ref={scrollRef}>
      
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[1000] mix-blend-difference hidden md:block"
        variants={variants as any}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-white rounded-sm flex items-center justify-center">
               <div className="w-1 h-4 bg-white transform rotate-45" />
               <div className="w-1 h-4 bg-white transform -rotate-45" />
            </div>
            <span className="font-bold tracking-widest text-xl">J—P</span>
         </div>
         <div className="hidden md:flex gap-8">
           {navItems.map(item => (
             <a 
               key={item} 
               href={`#${item}`} 
               className="uppercase text-xs tracking-[0.2em] hover:text-neon-cyan transition-colors"
               onMouseEnter={() => setCursorVariant('text')}
               onMouseLeave={() => setCursorVariant('default')}
             >
               {item}
             </a>
           ))}
         </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col justify-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(176,38,255,0.1),transparent_50%)]" />
        <div className="grid grid-cols-12 gap-4">
           <div className="col-span-12 md:col-span-10">
              <motion.h1 
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-[12vw] leading-[0.85] font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-neon-ice to-neon-purple/50 tracking-tighter"
              >
                JUNAID<br/>PARAMBERI
              </motion.h1>
           </div>
           <div className="col-span-12 md:col-span-2 flex flex-col justify-end pb-4 border-l border-obsidian-border pl-8">
              <p className="text-neon-cyan text-sm font-mono mb-8">Role: Creative Technologist</p>
              <ul className="space-y-2 text-obsidian-textMuted text-sm">
                <li>Graphic Designer</li>
                <li>Photographer</li>
                <li>Motion Designer</li>
                <li>Full Stack Dev</li>
              </ul>
           </div>
        </div>
        <motion.div 
           className="absolute bottom-12 left-8"
           animate={{ y: [0, 10, 0] }}
           transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="text-neon-cyan" />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center px-8 border-t border-obsidian-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-7xl mx-auto">
          <div>
            <h2 className="text-4xl font-display italic text-neon-purple mb-8">The Architect of Aesthetics</h2>
            <p className="text-xl leading-relaxed text-obsidian-text mb-8">
              A 6+ year creative professional specializing in branding, photography, and motion graphics. 
              My work sits at the intersection of technical precision and artistic fluidity.
            </p>
            <p className="text-lg text-obsidian-textMuted mb-12">
              Delivering end-to-end visual solutions from concept to post-production.
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border border-obsidian-border bg-obsidian-surface">
                 <Palette className="mb-2 text-neon-cyan" />
                 <div className="text-sm font-bold">Brand Identity</div>
              </div>
              <div className="p-4 border border-obsidian-border bg-obsidian-surface">
                 <Layers className="mb-2 text-neon-purple" />
                 <div className="text-sm font-bold">Motion GFX</div>
              </div>
              <div className="p-4 border border-obsidian-border bg-obsidian-surface">
                 <Cpu className="mb-2 text-neon-lime" />
                 <div className="text-sm font-bold">Dev/Code</div>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-[3/4] bg-obsidian-surface border border-obsidian-border p-2">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Portrait" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
             </div>
             <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-iridescent rounded-full blur-[80px] opacity-30" />
          </div>
        </div>
      </section>

      {/* Journey (Experience) */}
      <section id="journey" className="min-h-screen py-32 px-8 bg-obsidian-surface relative">
         <div className="max-w-4xl mx-auto">
           <h2 className="text-6xl font-bold mb-20 text-center">TIMELINE</h2>
           
           <div className="space-y-12 relative">
             <div className="absolute left-0 top-0 bottom-0 w-px bg-obsidian-border md:left-1/2" />
             
             {experience.map((exp, idx) => (
               <motion.div 
                 key={exp.id}
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className={`flex flex-col md:flex-row gap-8 relative ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
               >
                 <div className="flex-1 p-6 border border-obsidian-border bg-obsidian-bg hover:border-neon-cyan/50 transition-colors group">
                    <span className="text-xs font-mono text-neon-purple mb-2 block">{exp.period}</span>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-neon-cyan transition-colors">{exp.role}</h3>
                    <h4 className="text-obsidian-textMuted mb-4">{exp.company}</h4>
                    <p className="text-sm text-gray-400">{exp.description}</p>
                 </div>
                 
                 <div className="w-4 h-4 bg-obsidian-bg border-2 border-neon-cyan rounded-full absolute left-[-8.5px] top-8 md:left-1/2 md:-ml-2 z-10" />
                 
                 <div className="flex-1 hidden md:block" />
               </motion.div>
             ))}
           </div>
         </div>
      </section>

      {/* Visual Vault (Project Archive) */}
      <section id="archive" className="min-h-screen py-32 px-4 md:px-16 overflow-hidden">
        <h2 className="text-6xl font-bold mb-20 text-center">VISUAL VAULT</h2>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedProject(project)}
              className="group cursor-none"
              onMouseEnter={() => setCursorVariant('project')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-obsidian-surface border border-obsidian-border">
                 <img 
                   src={project.image} 
                   alt={project.title} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                 <div className="absolute bottom-6 left-6 right-6">
                    <span className="text-xs font-mono text-neon-lime mb-2 block uppercase tracking-wider">{project.category}</span>
                    <h3 className="text-2xl font-bold text-white group-hover:text-neon-cyan transition-colors">{project.title}</h3>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer / Contact */}
      <section id="contact" className="min-h-[50vh] flex flex-col justify-center px-8 bg-obsidian-bg border-t border-obsidian-border">
         <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-5xl font-bold mb-8">LET'S BUILD<br/>THE FUTURE</h2>
              <a href="mailto:junaidparamberi@gmail.com" className="text-2xl text-neon-cyan hover:text-white transition-colors flex items-center gap-4">
                junaidparamberi@gmail.com <MoveUpRight />
              </a>
            </div>
            <div className="space-y-6 text-lg text-obsidian-textMuted">
               <div className="flex items-center gap-4">
                 <Smartphone className="text-neon-purple" /> +971 58 197 6818
               </div>
               <div className="flex items-center gap-4">
                 <MapPin className="text-neon-lime" /> Abu Dhabi, UAE
               </div>
            </div>
         </div>
      </section>

      {/* Project Modal Intercept */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-xl overflow-y-auto"
          >
            <button 
              onClick={() => setSelectedProject(null)}
              className="fixed top-8 right-8 text-white hover:text-neon-pink z-50 p-2 border border-white/20 rounded-full"
            >
               <X size={32} />
            </button>

            <div className="min-h-screen">
               <div className="h-[60vh] w-full relative">
                  <img src={selectedProject.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute bottom-12 left-8 md:left-20">
                     <h2 className="text-5xl md:text-7xl font-bold text-white mb-4">{selectedProject.title}</h2>
                     <div className="flex gap-4">
                       {selectedProject.tags.map(tag => (
                         <span key={tag} className="px-3 py-1 border border-neon-cyan text-neon-cyan text-xs font-mono uppercase rounded-full">
                           {tag}
                         </span>
                       ))}
                     </div>
                  </div>
               </div>

               <div className="max-w-5xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-16">
                  <div className="md:col-span-2 space-y-12">
                     <div>
                       <h3 className="text-neon-lime font-mono text-sm uppercase mb-4">The Challenge</h3>
                       <p className="text-xl leading-relaxed text-gray-300">{selectedProject.narrative.challenge}</p>
                     </div>
                     <div>
                       <h3 className="text-neon-lime font-mono text-sm uppercase mb-4">Execution</h3>
                       <p className="text-xl leading-relaxed text-gray-300">{selectedProject.narrative.execution}</p>
                     </div>
                     <div>
                       <h3 className="text-neon-lime font-mono text-sm uppercase mb-4">Result</h3>
                       <p className="text-xl leading-relaxed text-gray-300">{selectedProject.narrative.result}</p>
                     </div>

                     {/* Gallery */}
                     <div className="grid grid-cols-1 gap-8 mt-12">
                        {selectedProject.gallery?.map((item, i) => (
                           <div key={i} className="w-full">
                              {item.type === 'image' ? (
                                <img src={item.url} className="w-full rounded-lg border border-obsidian-border" />
                              ) : (
                                <div className="aspect-video bg-obsidian-surface border border-obsidian-border flex items-center justify-center">
                                   <Play size={48} className="text-white" />
                                </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-8 h-fit sticky top-20">
                     <div className="p-6 border border-obsidian-border bg-obsidian-surface rounded-xl">
                        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                           <Cpu size={18} className="text-neon-purple" /> Design DNA
                        </h4>
                        
                        <div className="space-y-6">
                           <div>
                              <label className="text-xs text-obsidian-textMuted uppercase block mb-2">Typography</label>
                              <p className="font-mono text-sm text-white">{selectedProject.specs.typography}</p>
                           </div>
                           <div>
                              <label className="text-xs text-obsidian-textMuted uppercase block mb-2">Color Palette</label>
                              <div className="flex gap-2">
                                 {selectedProject.specs.colors.map(c => (
                                    <div key={c} className="w-8 h-8 rounded border border-white/20" style={{ backgroundColor: c }} title={c} />
                                 ))}
                              </div>
                           </div>
                           <div>
                              <label className="text-xs text-obsidian-textMuted uppercase block mb-2">Grid System</label>
                              <p className="font-mono text-sm text-white">{selectedProject.specs.grid}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioSite;
