import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

type UserMode = 'student' | 'recruiter';

interface UserModeContextType {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => Promise<void>;
  isRecruiter: boolean;
  isStudent: boolean;
  loading: boolean;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [userMode, setUserModeState] = useState<UserMode>('student');
  const [loading, setLoading] = useState(true);

  // Load mode from SecureStore on mount
  useEffect(() => {
    loadMode();
  }, []);

  const loadMode = async () => {
    try {
      const savedMode = await SecureStore.getItemAsync('userMode');
      if (savedMode === 'student' || savedMode === 'recruiter') {
        setUserModeState(savedMode);
      }
    } catch (error) {
      console.error('Error loading user mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserMode = async (mode: UserMode) => {
    try {
      await SecureStore.setItemAsync('userMode', mode);
      setUserModeState(mode);
    } catch (error) {
      console.error('Error saving user mode:', error);
    }
  };

  const isRecruiter = userMode === 'recruiter';
  const isStudent = userMode === 'student';

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode, isRecruiter, isStudent, loading }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
}
