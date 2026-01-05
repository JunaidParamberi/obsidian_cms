
import { Experience, Project, Client } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'the-year-of-handcrafts',
    title: 'Ministry of Culture Saudi Arabia',
    category: 'UI/UX Design, Graphic Design',
    filterCategory: 'graphic',
    featured: true,
    image: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2000&auto=format&fit=crop',
    description: 'The Year of Handcrafts Event Program UI/UX Design focusing on cultural heritage.',
    tags: ['UI/UX', 'Graphic Design', 'Event'],
    specs: {
      typography: 'Effra, TheYearofHandicrafts',
      colors: ['#243c21', '#bcb833', '#ffffff'],
      grid: 'Responsive 12-Col'
    },
    narrative: {
      challenge: 'Creating UI/UX designs for event game and activity screens while adhering to strict brand guidelines that balance modern tech with traditional motifs.',
      execution: 'Collaborated closely with the Ministry of Culture to ensure all designs reflected the cultural significance of handcrafts, utilizing custom icon sets and textured backgrounds.',
      result: 'Successfully launched the event program with positive feedback on user experience and visual appeal, serving over 50,000 visitors.'
    },
    gallery: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=2000&auto=format&fit=crop' },
      { type: 'video', url: 'https://player.vimeo.com/external/494252666.sd.mp4?s=721526361a8600d8985172777f98e8557948303f&profile_id=164&oauth2_token_id=57447761' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2000&auto=format&fit=crop' },
      { type: 'video', url: 'https://player.vimeo.com/external/370331493.sd.mp4?s=7b3469146f4e857476e3d7b322f99d55ec13e9a5&profile_id=139&oauth2_token_id=57447761' },
    ],
    gridArea: 'md:col-span-8 md:row-span-2'
  },
  {
    id: 'ayursain',
    title: 'Ayursain Logo Creation & Branding',
    category: 'Brand Identity',
    filterCategory: 'graphic',
    featured: true,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2000&auto=format&fit=crop',
    description: 'Broadcast graphics and event branding for a leading wellness media house.',
    tags: ['Logo Design', 'Branding', 'Identity'],
    specs: {
      typography: 'Pacifico / Inter',
      colors: ['#23a9b9', '#558135', '#ffffff'],
      grid: 'Modular 6-Col'
    },
    narrative: {
      challenge: 'Developed a cohesive visual system for an Ayurvedic brand that needed to appeal to both traditional users and a younger, health-conscious demographic.',
      execution: 'Created versatile logo variations and a organic color palette inspired by medicinal herbs, applied across digital and print media.',
      result: 'A strong brand identity that enhanced market presence by 40% and improved audience recognition across social platforms.'
    },
    gallery: [
       { type: 'image', url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2000&auto=format&fit=crop' },
       { type: 'image', url: 'https://images.unsplash.com/photo-1614850523296-e8c041df43a0?q=80&w=2000&auto=format&fit=crop' },
       { type: 'image', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000&auto=format&fit=crop' }
    ],
    gridArea: 'md:col-span-4 md:row-span-1'
  },
  {
    id: '3s-media-solutions',
    title: '3S Media & Lighting Solutions',
    category: 'Digital Signage & Architectural Lighting',
    filterCategory: 'graphic',
    featured: true,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2000&auto=format&fit=crop',
    description: 'A comprehensive digital ecosystem integrating cutting-edge LED technology with architectural artistry for global markets.',
    tags: ['LED Tech', 'Wayfinding', 'Media Façade'],
    specs: {
      typography: 'Montserrat / Helvetica',
      colors: ['#201b51', '#407cbf', '#00cfb4', '#ffc600'],
      grid: 'Bento Grid / Case Study'
    },
    narrative: {
      challenge: 'Visualizing complex, large-scale digital installations across diverse international environments from retail interiors to urban skyscrapers.',
      execution: 'Created high-fidelity 3D mockups and social media simulations to demonstrate real-world application, visibility, and brand cohesion.',
      result: 'Developed a unified visual identity for 3S Media across three continents, showcasing expertise in 3D anamorphic displays.'
    },
     gallery: [
       { type: 'video', url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=231da6ab57f9157022602c62681021bc36709890&profile_id=139&oauth2_token_id=57447761' },
       { type: 'image', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop' },
       { type: 'image', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop' },
       { type: 'video', url: 'https://player.vimeo.com/external/459389137.sd.mp4?s=91081395b00f3f20d6f289669528d25f77839352&profile_id=164&oauth2_token_id=57447761' }
    ],
    gridArea: 'md:col-span-4 md:row-span-1'
  },
  {
    id: 'boehringeringelheim',
    title: 'Boehringer Ingelheim',
    category: 'Website & Motion Design',
    filterCategory: 'coding',
    featured: true,
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2000&auto=format&fit=crop',
    description: 'Interactive pharmaceutical platform designed for healthcare professionals.',
    tags: ['React', 'Electron', 'Motion Design', 'UI/UX'],
    specs: {
      typography: 'BoehringerForwardHead',
      colors: ['#08312A', '#00E47C', '#E5E3DE', '#F6F5F3'],
      grid: 'Responsive 12-Col'
    },
    narrative: {
      challenge: 'Simplifying complex medical data into intuitive, interactive visualizations for clinicians.',
      execution: 'Built a high-performance React application with custom SVG animations and a robust state management system for real-time data filtering.',
      result: 'Reduced data access time for practitioners by 35% during clinical trials.'
    },
    gallery: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1551288049-bbbda5366991?q=80&w=2000&auto=format&fit=crop' },
      { type: 'video', url: 'https://player.vimeo.com/external/434045526.sd.mp4?s=c49e79435b0d3936a29777592cfdf754024344e6&profile_id=164&oauth2_token_id=57447761' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1504868584819-f8eec0421682?q=80&w=2000&auto=format&fit=crop' }
    ],
    gridArea: 'md:col-span-12 md:row-span-1'
  },
  {
    id: 'crypto-dashboard',
    title: 'Nexus Trade',
    category: 'UI/UX Engineering',
    filterCategory: 'coding',
    featured: true,
    link: 'https://example.com/nexus-trade',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000&auto=format&fit=crop',
    description: 'Real-time cryptocurrency trading interface built with React and WebGL data visualization.',
    tags: ['React', 'TypeScript', 'WebGL'],
    specs: {
      typography: 'JetBrains Mono / Inter',
      colors: ['#111111', '#00FF9D', '#FF0055'],
      grid: 'Dashboard 12-Col'
    },
    narrative: {
      challenge: 'Visualizing high-frequency data streams without performance lag in a browser environment.',
      execution: 'Implemented a custom WebGL renderer for charts and used WebSockets for live data updates. optimized React re-renders.',
      result: 'A sub-100ms latency dashboard used by over 500 active traders.'
    },
    gallery: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2000&auto=format&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1611974714851-48240ad42928?q=80&w=2000&auto=format&fit=crop' },
      { type: 'video', url: 'https://player.vimeo.com/external/403429391.sd.mp4?s=d76f8279f045239e24699f7d084f7b2e847c1b2c&profile_id=164&oauth2_token_id=57447761' }
    ],
    gridArea: 'md:col-span-6 md:row-span-1'
  },
  {
    id: 'fashion-shoot',
    title: 'Vogue Arabia Editorial',
    category: 'Photography',
    filterCategory: 'photo-video',
    featured: true,
    image: 'https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=2000&auto=format&fit=crop',
    description: 'High-fashion editorial shoot focusing on traditional textiles in modern settings.',
    tags: ['Photography', 'Editorial', 'Lighting'],
    specs: {
      typography: 'Didot',
      colors: ['#C0C0C0', '#000000', '#FF0000'],
      grid: 'Golden Ratio'
    },
    narrative: {
      challenge: 'Capturing the texture of intricate fabrics under harsh desert sunlight.',
      execution: 'Used diffusers and reflectors to soften natural light, combined with high-speed sync flash for drama.',
      result: 'Featured as the cover story for the September issue.'
    },
    gallery: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop' },
      { type: 'video', url: 'https://player.vimeo.com/external/414167098.sd.mp4?s=d9472620847849e75107954e7f33089d813735b5&profile_id=164&oauth2_token_id=57447761' }
    ],
    gridArea: 'md:col-span-6 md:row-span-1'
  }
];

export const EXPERIENCE: Experience[] = [
  {
    id: '35lighting',
    role: 'Graphic Designer & Photographer',
    company: '35 Lighting Solutions LLC',
    period: '2023 - Present',
    description: 'Leading visual documentation and graphic collateral for corporate/commercial lighting projects including ADNOC HQ.',
    type: 'work'
  },
  {
    id: 'pinkapple',
    role: 'Designer, Videographer & Editor',
    company: 'Pink Apple Events',
    period: '2018 - 2023',
    description: 'Managed full-cycle creative production for Gulf Vaartha and major regional events.',
    type: 'work'
  },
  {
    id: 'itpc',
    role: 'Diploma in Media',
    company: 'ITPC',
    period: 'Graduated',
    description: 'Foundational training in media production, editing, and graphic design principles.',
    type: 'education'
  },
  {
    id: 'ignou',
    role: 'Bachelor of Arts (BA)',
    company: 'IGNOU',
    period: 'Graduated',
    description: 'Humanities and creative arts focus, developing a strong theoretical framework for visual storytelling.',
    type: 'education'
  }
];

export const SKILLS = [
  "Adobe Creative Suite",
  "FCPX (Final Cut Pro)",
  "DaVinci Resolve",
  "UI/UX Design",
  "Photography",
  "Motion Graphics"
];

export const LANGUAGES = [
  "English", "Malayalam", "Hindi", "Arabic", "Tamil"
];

export const CONTACT = {
  phone: "+971 58 197 6818",
  email: "junaidparamberi@gmail.com",
  location: "Abu Dhabi - UAE"
};

export const CLIENTS: Client[] = [
  { 
    id: 'adnoc', 
    name: "ADNOC HQ", 
    role: "Brand Identity", 
    year: "2023",
    description: "Corporate wayfinding & visual systems."
  },
  { 
    id: 'vogue', 
    name: "Vogue Arabia", 
    role: "Editorial", 
    year: "2022",
    description: "High-fashion photography assistance."
  },
  { 
    id: 'gulf', 
    name: "Gulf Vaartha", 
    role: "Broadcast Design", 
    year: "2019",
    description: "On-air graphics package overhaul."
  },
  { 
    id: '35lighting', 
    name: "35 Lighting", 
    role: "Visual Direction", 
    year: "2023",
    description: "Architectural lighting visualization."
  },
  { 
    id: 'pinkapple', 
    name: "Pink Apple", 
    role: "Event Branding", 
    year: "2020",
    description: "Large-scale event collateral systems."
  },
  { 
    id: 'nexus', 
    name: "Nexus Trade", 
    role: "UI Engineering", 
    year: "2021",
    description: "High-frequency trading dashboard."
  }
];
