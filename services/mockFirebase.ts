import { Project, Experience } from '../types';
import { PROJECTS as INITIAL_PROJECTS, EXPERIENCE as INITIAL_EXPERIENCE } from '../constants';

// CONSTANTS
const DELAY = 600; // Simulated network latency in ms
const STORAGE_KEYS = {
  PROJECTS: 'obsidian_projects_v1',
  EXPERIENCE: 'obsidian_experience_v1'
};

// Helper to simulate async network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Internal helper for direct sync access (skipping delay for internal ops)
const getStoredProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  return INITIAL_PROJECTS;
};

export const api = {
  // --- PROJECT ENDPOINTS ---

  getProjects: async (): Promise<Project[]> => {
    await delay(DELAY);
    return getStoredProjects();
  },

  createProject: async (project: Project): Promise<Project> => {
    await delay(DELAY);
    const current = getStoredProjects();
    const updated = [project, ...current];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    return project;
  },

  updateProject: async (project: Project): Promise<Project> => {
    await delay(DELAY);
    const current = getStoredProjects();
    const updated = current.map(p => p.id === project.id ? project : p);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    return project;
  },

  deleteProject: async (id: string): Promise<void> => {
    await delay(DELAY);
    const current = getStoredProjects();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  },

  // --- EXPERIENCE ENDPOINTS ---

  getExperience: async (): Promise<Experience[]> => {
    await delay(DELAY);
    const stored = localStorage.getItem(STORAGE_KEYS.EXPERIENCE);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(INITIAL_EXPERIENCE));
    return INITIAL_EXPERIENCE;
  },

  saveExperience: async (experience: Experience[]): Promise<Experience[]> => {
    await delay(DELAY);
    localStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(experience));
    return experience;
  }
};