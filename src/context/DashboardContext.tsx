"use client";

import React, { createContext, useContext, useState } from "react";

interface DashboardContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <DashboardContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
