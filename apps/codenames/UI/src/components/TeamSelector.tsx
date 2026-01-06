import React, {FC, MouseEventHandler, useState} from 'react';
import { Team } from '../gql/graphql';
import { Role } from '../types/user';
import { useUser } from './Providers/UserProvider';
import {Typography} from "@mui/material";
import {Ruleset} from "../backend/amplify";

type TeamSelectorProps = {
    ruleset: Ruleset
};

export const TeamSelector: FC<TeamSelectorProps> = ({ruleset}) => {
  const { team, role, setTeam, setRole } = useUser();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(team);
  const [selectedRole, setSelectedRole] = useState<Role | null>(role);
  const [error, setError] = useState<string | null>(null);

  const teams = ruleset === "multiplayer" ? [Team.Blue, Team.Red] : [Team.Green1, Team.Green2];
  const roles = ruleset === "multiplayer" ? [Role.Owner, Role.Player] : [Role.Player];

  const nextButton  = () => {
    if (selectedTeam && selectedRole) {
        setTeam(selectedTeam);
        setRole(selectedRole);
    } else {
        setError("Must select both team and role to proceed.");
    }
  }

  return (
    <div>
      <Typography color={'red'}>{error}</Typography>
      <h3>Select Your Team</h3>
      <div>
        {teams.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTeam(t)}
            style={{
              margin: '5px',
              padding: '10px 20px',
              backgroundColor: selectedTeam === t ? t : '#f0f0f0',
              color: selectedTeam === t ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <h3>Select Your Role</h3>
      <div>
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            style={{
              margin: '5px',
              padding: '10px 20px',
              backgroundColor: selectedRole === r ? selectedTeam : '#f0f0f0',
              color: selectedRole === r ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {(team || role) && (
        <div style={{ marginTop: '20px' }}>
          {team && <p>Current Team: {team}</p>}
          {role && <p>Current Role: {role}</p>}
        </div>
      )}

    <button onClick={nextButton}>View Board</button>
    </div>
  );
};
