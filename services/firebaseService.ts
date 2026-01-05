
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
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Project, Experience, Client, Overview } from '../types';

const COLLECTIONS = {
  PROJECTS: 'projects',
  EXPERIENCE: 'experience',
  CLIENTS: 'clients',
  SETTINGS: 'settings'
};

export const api = {
  // PROFILE OVERVIEW API
  getOverview: async (): Promise<Overview | null> => {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'profile');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Overview;
    }
    return null;
  },

  saveOverview: async (overview: Overview): Promise<void> => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'profile'), overview);
  },

  getProjects: async (): Promise<Project[]> => {
    const q = query(collection(db, COLLECTIONS.PROJECTS));
    const querySnapshot = await getDocs(q);
    
    const projects = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Project));

    return projects.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
  },

  createProject: async (project: Project): Promise<Project> => {
    const projects = await api.getProjects();
    const maxOrder = projects.reduce((max, p) => Math.max(max, p.order || 0), -1);
    const projectWithOrder = { ...project, order: maxOrder + 1 };
    
    await setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), projectWithOrder);
    return projectWithOrder;
  },

  updateProject: async (project: Project): Promise<Project> => {
    const docRef = doc(db, COLLECTIONS.PROJECTS, project.id);
    await updateDoc(docRef, { ...project });
    return project;
  },

  updateProjectOrders: async (updates: { id: string, order: number }[]): Promise<void> => {
    const batch = writeBatch(db);
    updates.forEach(upd => {
      const docRef = doc(db, COLLECTIONS.PROJECTS, upd.id);
      batch.update(docRef, { order: upd.order });
    });
    await batch.commit();
  },

  deleteProject: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    await deleteDoc(docRef);
  },

  getExperience: async (): Promise<Experience[]> => {
    const q = query(collection(db, COLLECTIONS.EXPERIENCE));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Experience));
  },

  saveExperience: async (experiences: Experience[]): Promise<Experience[]> => {
    for (const exp of experiences) {
      await setDoc(doc(db, COLLECTIONS.EXPERIENCE, exp.id), exp);
    }
    return experiences;
  },

  deleteExperience: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.EXPERIENCE, id);
    await deleteDoc(docRef);
  },

  getClients: async (): Promise<Client[]> => {
    const q = query(collection(db, COLLECTIONS.CLIENTS));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Client));
  },

  saveClient: async (client: Client): Promise<Client> => {
    await setDoc(doc(db, COLLECTIONS.CLIENTS, client.id), client);
    return client;
  },

  deleteClient: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.CLIENTS, id);
    await deleteDoc(docRef);
  },

  uploadMedia: async (file: File): Promise<string> => {
    const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  triggerDeploy: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'deployment');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) return { success: false, message: "No Deployment Webhook configured." };
      const { webhookUrl } = settingsSnap.data();
      if (!webhookUrl) return { success: false, message: "Webhook URL is empty." };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'cms_deploy_trigger' })
      });

      return response.ok 
        ? { success: true, message: "Build triggered successfully." }
        : { success: false, message: `Build server error: ${response.statusText}` };
    } catch (error) {
      return { success: false, message: "Network error triggering build." };
    }
  }
};
