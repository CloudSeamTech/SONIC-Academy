'use client';
import { createContext, useContext } from 'react';

export const StudioDockContext = createContext<{
  host: HTMLElement | null;
  register: (id: string, active: boolean) => void;
}>({ host: null, register: () => {} });

export const useStudioDock = () => useContext(StudioDockContext);
