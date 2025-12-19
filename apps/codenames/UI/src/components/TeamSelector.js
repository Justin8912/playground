import React from 'react';
import { Team } from '../gql/graphql';
import { Role } from '../types/user';
import { useUser } from './Providers/UserProvider';
export const TeamSelector = ({ nextScreen }) => {
    const { team, role, setTeam, setRole } = useUser();
    const teams = [Team.Blue, Team.Red, Team.Green1, Team.Green2];
    const roles = [Role.Owner, Role.Player];
    return (React.createElement("div", null,
        React.createElement("h3", null, "Select Your Team"),
        React.createElement("div", null, teams.map((t) => (React.createElement("button", { key: t, onClick: () => setTeam(t), style: {
                margin: '5px',
                padding: '10px 20px',
                backgroundColor: team === t ? '#4CAF50' : '#f0f0f0',
                color: team === t ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            } }, t)))),
        React.createElement("h3", null, "Select Your Role"),
        React.createElement("div", null, roles.map((r) => (React.createElement("button", { key: r, onClick: () => setRole(r), style: {
                margin: '5px',
                padding: '10px 20px',
                backgroundColor: role === r ? '#2196F3' : '#f0f0f0',
                color: role === r ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            } }, r)))),
        (team || role) && (React.createElement("div", { style: { marginTop: '20px' } },
            team && React.createElement("p", null,
                "Current Team: ",
                team),
            role && React.createElement("p", null,
                "Current Role: ",
                role))),
        React.createElement("button", { onClick: nextScreen }, "View Board")));
};
