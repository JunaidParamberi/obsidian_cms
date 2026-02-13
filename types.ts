
// Defining GalleryItem interface for project media assets
export interface GalleryItem {
  type: 'image' | 'video';
  url: string;
}

export interface Project {
  id: string;
  title: string;
  category: string; 
  filterCategory: 'coding' | 'graphic' | 'motion' | 'photo-video'; 
  featured?: boolean;
  image: string;
  description: string;
  link?: string;
  tags: string[];
  specs: {
    typography: string;
    colors: string[];
    grid: string;
  };
  narrative: {
    challenge: string;
    execution: string;
    result: string;
  };
  gallery?: GalleryItem[];
  gridArea?: string; 
  order?: number; // Added for persistent sorting
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  type: 'work' | 'education';
}

export interface Client {
  id: string;
  name: string;
  role: string;
  year: string;
  description: string;
}

export interface Overview {
  title: string;
  subtitle: string;
  description: string;
  stats: {
    label: string;
    value: string;
  }[];
}

export interface SecuritySettings {
  allowSignUp: boolean;
  maintenanceMode: boolean;
  webhookUrl?: string;
}

export interface CursorState {
  hidden: boolean;
  variant: 'default' | 'project' | 'text' | 'button';
}

export type ViewState = 'dashboard' | 'overview' | 'projects' | 'experience' | 'clients' | 'settings' | 'deploy';
