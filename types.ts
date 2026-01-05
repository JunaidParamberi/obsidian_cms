export interface ProjectSpecs {
  typography: string;
  colors: string[];
  grid: string;
}

export interface ProjectNarrative {
  challenge: string;
  execution: string;
  result: string;
}

export interface GalleryItem {
  type: 'image' | 'video';
  url: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  filterCategory: string;
  image: string;
  description: string;
  tags: string[];
  specs: ProjectSpecs;
  narrative: ProjectNarrative;
  gallery?: GalleryItem[];
  gridArea: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  type: 'work' | 'education';
}

export type ViewState = 'dashboard' | 'projects' | 'experience' | 'settings' | 'deploy';
