// src/context/user-context.tsx
import React, { createContext, useContext, useState } from 'react';

export interface UserProfile {
  name: string;
  email: string;
}

interface UserContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: 'Mischi Jeda Jacinto Elumba',
    email: 'jade@gmail.com',
  });

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};