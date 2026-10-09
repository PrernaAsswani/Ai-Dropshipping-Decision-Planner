import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AnalysisData {
  scores: {
    product: number;
    supplier: number;
    pricing: number;
  };
  workflow: Array<{ stage: string; status: string; date: string }>;
  decision: {
    final: string;
    overallScore: number;
    riskLevel: string;
    confidence: number;
    strengths: string[];
    weaknesses: string[];
    nextSteps: string[];
  };
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

interface DataContextType {
  inputData: any;
  setInputData: (data: any) => void;
  analysisResults: AnalysisData | null;
  setAnalysisResults: (data: AnalysisData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (userData: Pick<UserProfile, 'email'> & Partial<Pick<UserProfile, 'name' | 'role'>>) => void;
  signup: (userData: Pick<UserProfile, 'name' | 'email'>) => void;
  logout: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'decisionintel_user';

const getStoredUser = (): UserProfile | null => {
  try {
    const storedUser = window.localStorage.getItem(STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const getDisplayName = (email: string) => {
  const emailName = email.split('@')[0] || 'User';
  return emailName
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getRole = (email: string): UserProfile['role'] =>
  email.toLowerCase().includes('admin') ? 'Admin' : 'User';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [inputData, setInputData] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());

  const login = (userData: Pick<UserProfile, 'email'> & Partial<Pick<UserProfile, 'name' | 'role'>>) => {
    const nextUser: UserProfile = {
      email: userData.email,
      name: userData.name?.trim() || getDisplayName(userData.email),
      role: userData.role || getRole(userData.email),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const signup = (userData: Pick<UserProfile, 'name' | 'email'>) => {
    login({
      email: userData.email,
      name: userData.name,
      role: getRole(userData.email),
    });
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <DataContext.Provider
      value={{
        inputData,
        setInputData,
        analysisResults,
        setAnalysisResults,
        isLoading,
        setIsLoading,
        isAuthenticated: Boolean(user),
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
