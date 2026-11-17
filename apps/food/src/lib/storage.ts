import type { StateStorage } from "zustand/middleware";

/**
 * localStorage con try/catch: in finestra privata o con dati del sito bloccati
 * può lanciare. In quel caso l'app funziona comunque, solo senza persistenza.
 */
export const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage non disponibile: lo stato resta solo in memoria
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // niente da rimuovere
    }
  },
};
