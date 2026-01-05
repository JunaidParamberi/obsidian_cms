import { db, storage } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Project, Experience } from '../types';

const COLLECTIONS = {
  PROJECTS: 'projects',
  EXPERIENCE: 'experience',
  SETTINGS: 'settings'
};

export const api = {
  // --- PROJECT ENDPOINTS ---

  getProjects: async (): Promise<Project[]> => {
    const q = query(collection(db, COLLECTIONS.PROJECTS));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Project);
  },

  createProject: async (project: Project): Promise<Project> => {
    await setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), project);
    return project;
  },

  updateProject: async (project: Project): Promise<Project> => {
    await updateDoc(doc(db, COLLECTIONS.PROJECTS, project.id), { ...project });
    return project;
  },

  deleteProject: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.PROJECTS, id));
  },

  // --- EXPERIENCE ENDPOINTS ---

  getExperience: async (): Promise<Experience[]> => {
    const q = query(collection(db, COLLECTIONS.EXPERIENCE));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Experience);
  },

  saveExperience: async (experiences: Experience[]): Promise<Experience[]> => {
    for (const exp of experiences) {
      await setDoc(doc(db, COLLECTIONS.EXPERIENCE, exp.id), exp);
    }
    return experiences;
  },

  // --- MEDIA UPLOAD ---
  uploadMedia: async (file: File): Promise<string> => {
    const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  // --- DEPLOYMENT LOGIC ---
  triggerDeploy: async (): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Check for a configured webhook in Firestore
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'deployment');
      const settingsSnap = await getDoc(settingsRef);
      
      if (!settingsSnap.exists()) {
        return { 
          success: false, 
          message: "No Deployment Webhook configured in 'settings/deployment' document." 
        };
      }

      const { webhookUrl } = settingsSnap.data();

      if (!webhookUrl) {
        return { success: false, message: "Webhook URL is empty." };
      }

      // 2. Fire the webhook (GitHub Dispatch or Vercel/Firebase Hook)
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ref: 'main',
          event_type: 'cms_deploy_trigger',
          client_payload: {
            user: 'Junaid.CMS',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        return { success: true, message: "Build triggered successfully on Google Cloud." };
      } else {
        return { success: false, message: `Build server returned error: ${response.statusText}` };
      }
    } catch (error) {
      console.error("Deploy Trigger Error:", error);
      return { success: false, message: "Network error triggering build." };
    }
  }
};