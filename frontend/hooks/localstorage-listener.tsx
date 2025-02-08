"use client";

import { useState, useEffect } from "react";

// Create a custom event for same-tab updates
const localStorageChangeEvent = "localStorageChange";

// Function to dispatch the custom event
export const dispatchLocalStorageEvent = (key: string, newValue: string | null) => {
  window.dispatchEvent(new CustomEvent(localStorageChangeEvent, { detail: { key, newValue } }));
};

export default function useLocalStorageListener(key: string) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateValue = () => {
      setValue(localStorage.getItem(key));
    };

    // Initial value update
    updateValue();

    // Listen for localStorage changes (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        updateValue();
      }
    };

    // Listen for custom event (same-tab)
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.key === key) {
        updateValue();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(localStorageChangeEvent, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(localStorageChangeEvent, handleCustomEvent as EventListener);
    };
  }, [key]);

  return value;
}
