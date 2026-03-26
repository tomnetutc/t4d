import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrentClusterCtx {
  currentCluster: string;
  setCurrentCluster: (id: string) => void;
}

const CurrentClusterContext = createContext<CurrentClusterCtx>({
  currentCluster: 'environmental',
  setCurrentCluster: () => {},
});

export const CurrentClusterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCluster, setCurrentCluster] = useState('environmental');
  return (
    <CurrentClusterContext.Provider value={{ currentCluster, setCurrentCluster }}>
      {children}
    </CurrentClusterContext.Provider>
  );
};

export const useCurrentCluster = () => useContext(CurrentClusterContext);
