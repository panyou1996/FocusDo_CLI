
import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const DATA_VERSION = 1;

interface StoredData<T> {
  version: number;
  data: T;
}

async function setStorage<T>(key: string, value: T): Promise<void> {
  const storedObject: StoredData<T> = {
    version: DATA_VERSION,
    data: value,
  };
  const jsonString = JSON.stringify(storedObject);

  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key, value: jsonString });
  } else {
    localStorage.setItem(key, jsonString);
  }
}

async function getStorage<T>(key: string): Promise<StoredData<T> | null> {
  let value: string | null;
  if (Capacitor.isNativePlatform()) {
    const ret = await Preferences.get({ key });
    value = ret.value;
  } else {
    value = localStorage.getItem(key);
  }

  if (value === null) {
    return null;
  }

  try {
    const parsed: StoredData<T> = JSON.parse(value);
    // Here you could add migration logic if parsed.version < DATA_VERSION
    return parsed;
  } catch (error) {
    console.error(`Error parsing stored data for key "${key}":`, error);
    return null; // Or handle corruption
  }
}

export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    let isMounted = true;
    async function loadValue() {
      try {
        const fromStorage = await getStorage<T>(key);
        if (isMounted) {
          if (fromStorage && fromStorage.data !== null && fromStorage.data !== undefined) {
            setStoredValue(fromStorage.data);
          } else {
            // If nothing is in storage or data is corrupt, initialize it with the initial value
            setStoredValue(initialValue);
            await setStorage(key, initialValue);
          }
        }
      } catch (error) {
        console.error(`Error loading persistent state for key "${key}":`, error);
        if(isMounted) {
          setStoredValue(initialValue);
        }
      }
    }
    loadValue();
    return () => {
      isMounted = false;
    };
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        setStorage(key, valueToStore);
      } catch (error) {
        console.error(`Error setting persistent state for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
