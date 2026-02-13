
import { createContext } from 'react';

export interface UIContextType {
  confirm: (options: { title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' }) => void;
  notify: (msg: string, type?: 'success' | 'loading' | 'error') => void;
}

export const UIContext = createContext<UIContextType | null>(null);
