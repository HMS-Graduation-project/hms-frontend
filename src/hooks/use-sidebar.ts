import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'hms-sidebar-open';

function getInitialState(): boolean {
  if (typeof window === 'undefined') return true;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'true';

  // Default: open on desktop, closed on mobile
  return window.innerWidth >= 1024;
}

export function useSidebar() {
  const [isOpen, setIsOpen] = useState<boolean>(getInitialState);

  // Persist to localStorage whenever the value changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isOpen));
  }, [isOpen]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, setIsOpen, toggle };
}
