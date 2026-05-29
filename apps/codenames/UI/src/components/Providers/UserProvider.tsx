import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team } from '../../gql/graphql';
import { Role } from '../../types/user';
import {useCookies} from "./CookieProvider";

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
  const cookies = useCookies();
  const [team, setTeamState] = useState<Team | null>(cookies.team);
  const [role, setRoleState] = useState<Role | null>(cookies.role);

  const setTeam = (newTeam: Team) => {
    setTeamState(newTeam);
    cookies.setTeam(newTeam);
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    cookies.setRole(newRole);
  };

  const setUser = (newTeam: Team, newRole: Role) => {
    setTeamState(newTeam);
    cookies.setTeam(newTeam);
    setRoleState(newRole);
    cookies.setRole(newRole);
  };

  const clearTeam = () => {
    setTeamState(null);
    cookies.clearTeam();
  };

  const clearRole = () => {
    setRoleState(null);
    cookies.clearRole();
  };

  const clearUser = () => {
    setTeamState(null);
    cookies.clearTeam();
    setRoleState(null);
    cookies.clearRole();
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


