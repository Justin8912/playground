import React, { createContext, useContext, ReactNode } from 'react';
import { Team, Ruleset } from '../../gql/graphql';
import { Role } from '../../types/user';
import Cookies from 'js-cookie'

interface CookieProviderType {
    team: Team | null;
    role: Role | null;
    gameId: string | null;
    ruleset: Ruleset | null;
    setTeam: (team: Team) => void;
    setRole: (role: Role) => void;
    setGame: (gameId: string) => void;
    setRuleset: (ruleset: Ruleset) => void;
    clearTeam: () => void;
    clearRole: () => void;
    clearGame: () => void;
    clearRuleset: () => void;
    clearAllCookies: () => void;
}

const CookieContext = createContext<CookieProviderType | undefined>(undefined);

interface CookieProviderProps {
    children: ReactNode;
}

const getCookie = (key: string): string | null => {
    const value = Cookies.get(`codenames-${key}`);
    return value ? value : null;
};

const setCookie = (key: string, value: string) => {
    Cookies.set(`codenames-${key}`, value);
};

const removeCookie = (key: string) => {
    Cookies.remove(`codenames-${key}`);
}

export const CookieProvider = ({ children }: CookieProviderProps) => {
    const team = getCookie('team');
    const role = getCookie('role');
    const gameId = getCookie('gameId');
    const ruleset = getCookie('ruleset');

    const setTeam = (newTeam: Team) => {
        setCookie('team', newTeam);
    };

    const setRole = (newRole: Role) => {
        setCookie('role', newRole);
    };

    const setGame = (newGameId: string) => {
        setCookie('gameId', newGameId);
    };

    const setRuleset = (ruleset: Ruleset) => {
        setCookie('ruleset', ruleset);
    }

    const clearTeam = () => {
        console.log("removing")
        removeCookie('team');
    };

    const clearRole = () => {
        console.log("removing")
        removeCookie('role');
    };

    const clearGame = () => {
        console.log("removing")
        removeCookie('gameId');
    };

    const clearRuleset = () => {
        console.log("removing")
        removeCookie('ruleset');
    }

    const clearAllCookies = () => {
        clearTeam();
        clearRole();
        clearGame();
        clearRuleset();
    }

    return (
        <CookieContext.Provider value={{
            team, role, gameId, ruleset, setTeam, setRole, setGame,
            setRuleset, clearTeam, clearRole, clearGame, clearRuleset,
            clearAllCookies
        }}>
            {children}
        </CookieContext.Provider>
    );
};

export const useCookies = () => {
    const context = useContext(CookieContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};


