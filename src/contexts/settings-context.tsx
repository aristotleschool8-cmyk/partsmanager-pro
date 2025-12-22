"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SettingsContextType {
  isDegradedMode: boolean;
  toggleDegradedMode: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isDegradedMode, setIsDegradedMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const toggleDegradedMode = () => {
    setIsDegradedMode((prev) => !prev);
  };

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <SettingsContext.Provider value={{ isDegradedMode, toggleDegradedMode, refreshKey, triggerRefresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
