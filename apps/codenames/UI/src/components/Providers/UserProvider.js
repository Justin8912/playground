import React, { createContext, useContext, useState } from 'react';
const UserContext = createContext(undefined);
export const UserProvider = ({ children }) => {
    const [team, setTeamState] = useState(null);
    const [role, setRoleState] = useState(null);
    const setTeam = (newTeam) => {
        setTeamState(newTeam);
    };
    const setRole = (newRole) => {
        setRoleState(newRole);
    };
    const setUser = (newTeam, newRole) => {
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
    return (React.createElement(UserContext.Provider, { value: { team, role, setTeam, setRole, setUser, clearTeam, clearRole, clearUser } }, children));
};
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
