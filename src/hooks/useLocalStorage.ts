
"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect runs only once on the client after hydration
    // It safely reads from localStorage and updates the state.
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
    setIsInitialized(true);
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined' || !isInitialized) {
      // Don't do anything on the server or before initialization.
      // Or queue it up to run after initialization.
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue, isInitialized]);


  // During SSR and initial client render, return the initialValue.
  // After hydration, this will update to the value from localStorage.
  return [storedValue, setValue];
}

export { useLocalStorage };
