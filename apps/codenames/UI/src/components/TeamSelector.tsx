import React, {FC} from 'react';
import { Team } from '../gql/graphql';
import { Role } from '../types/user';
import { useUser } from './Providers/UserProvider';


export const TeamSelector: FC<{nextScreen: Function}> = ({nextScreen}) => {
  const { team, role, setTeam, setRole } = useUser();

  const teams = [Team.Blue, Team.Red, Team.Green1, Team.Green2];
  const roles = [Role.Owner, Role.Player];

  return (
    <div>
      <h3>Select Your Team</h3>
      <div>
        {teams.map((t) => (
          <button
            key={t}
            onClick={() => setTeam(t)}
            style={{
              margin: '5px',
              padding: '10px 20px',
              backgroundColor: team === t ? '#4CAF50' : '#f0f0f0',
              color: team === t ? 'white' : 'black',
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
            onClick={() => setRole(r)}
            style={{
              margin: '5px',
              padding: '10px 20px',
              backgroundColor: role === r ? '#2196F3' : '#f0f0f0',
              color: role === r ? 'white' : 'black',
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

    <button onClick={nextScreen}>View Board</button>
    </div>
  );
};

