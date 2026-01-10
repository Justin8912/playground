import React, {FC, useState} from 'react';
import { Team } from '../gql/graphql';
import { Role } from '../types/user';
import { useUser } from './Providers/UserProvider';
import {Box, Button, colors, Typography} from "@mui/material";
import {Ruleset} from "../gql/graphql";
import { defaultColors } from '../util/constants';

type TeamSelectorProps = {
    ruleset: Ruleset
};

const selectedTeamToColor = (team: Team) => {
    switch(team) {
        case Team.Blue:
            return defaultColors.blue;
        case Team.Red:
            return defaultColors.red;
        case Team.Green1:
            return defaultColors.green1;
        case Team.Green2:
            return defaultColors.green2;
        default:
            return colors.grey[500];
    }
}

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
    <Box>
      <Typography color={'red'}>{error}</Typography>
      <h3>Select Your Team</h3>
      <Box sx={{display: 'flex', justifyContent: 'center', gap: 1}}>
        {teams.map((t) => (
          <Button
            key={t}
            onClick={() => setSelectedTeam(t)}
            style={{
              backgroundColor: selectedTeam === t ? selectedTeamToColor(selectedTeam) : '#f0f0f0',
              color: selectedTeam === t ? 'white' : 'black'
            }}
            sx={{textTransform: 'capitalize'}}
          >
            {t}
          </Button>
        ))}
      </Box>

      <h3>Select Your Role</h3>
      <Box sx={{display: 'flex', justifyContent: 'center', gap: 1}}>
        {roles.map((r) => (
          <Button
            key={r}
            onClick={() => setSelectedRole(r)}
            style={{
              backgroundColor: selectedRole === r ? selectedTeamToColor(selectedTeam) : '#f0f0f0',
              color: selectedRole === r ? 'white' : 'black',
            }}
            sx={{textTransform: 'capitalize'}}
          >
            {r}
          </Button>
        ))}
      </Box>

    <Button
        variant='contained'
        onClick={nextButton}
        sx={{marginTop: 2}}
    >View Board</Button>
    </Box>
  );
};
