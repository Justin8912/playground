import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team } from '../../gql/graphql';
import { Role } from '../../types/user';

interface UserContextType {
  team: Team | null;
  role: Role | null;
  setTeam: (team: Team) => void;
  setRole: (role: Role) => void;
  setUser: (team: Team, role: Role) => void;
  clearTeam: () => void;
  clearRole: () => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [team, setTeamState] = useState<Team | null>(null);
  const [role, setRoleState] = useState<Role | null>(null);

  const setTeam = (newTeam: Team) => {
    setTeamState(newTeam);
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
  };

  const setUser = (newTeam: Team, newRole: Role) => {
    setTeamState(newTeam);
    setRoleState(newRole);
  };

  const clearTeam = () => {
    setTeamState(null);
  };

  const clearRole = () => {
    setRoleState(null);
  };

  const clearUser = () => {
    setTeamState(null);
    setRoleState(null);
  };

  return (
    <UserContext.Provider value={{ team, role, setTeam, setRole, setUser, clearTeam, clearRole, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};


