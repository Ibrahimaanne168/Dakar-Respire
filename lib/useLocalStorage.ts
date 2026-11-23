// ==============================================================================
// PROJET DAKAR RESPIRE - HOOK LOCALSTORAGE SÉCURISÉ & CLIENT-SIDE ONLY
// ==============================================================================
import { useState, useEffect } from "react";

const PREFIX = "dakarrespire:v1:";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const fullKey = PREFIX + key;

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  // Initialisation sécurisée uniquement côté client après le montage
  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(fullKey);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      }
    } catch (error) {
      console.warn(`Erreur lors de la lecture de localStorage pour "${fullKey}":`, error);
    }
  }, [fullKey]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(fullKey, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Erreur lors de l'écriture dans localStorage pour "${fullKey}":`, error);
    }
  };

  const removeValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(fullKey);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Erreur suppression localStorage "${fullKey}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

export function clearAllDakarStorage() {
  if (typeof window !== "undefined") {
    try {
      Object.keys(window.localStorage).forEach((k) => {
        if (k.startsWith(PREFIX)) {
          window.localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.error("Erreur nettoyage localStorage:", e);
    }
  }
}
