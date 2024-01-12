import React from 'react';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';

import API_URL from './config.js';

export default function RoomInformation({ roomId, setIsEditDialogOpen }) {
    const [names, setNames] = React.useState([]);
    const [users, setUsers] = React.useState([]);
  
    React.useEffect(() => {
      if (roomId !== undefined) {
        fetch(API_URL + "get_place_info/" + roomId)
          .then(response => response.json())
          .then(data => {
            setNames(data.names);
            setUsers(data.users);
          });
      }
    }, [roomId]);
  
    if (roomId === undefined) {
      return;
    }
  
    return <div style={{ padding: '24px' }}>
      <Typography component="h2" variant="h5" gutterBottom>
        Salle sélectionnée
      </Typography>
  
      <Typography component="h3" variant="h6" gutterBottom>Noms</Typography>
      {
        names.length === 0
          ? <em>Aucun nom défini</em>
          : names.map(name => {
              return <React.Fragment key={name}>
                <Chip label={name} variant="outlined" />
                <br/>
              </React.Fragment>
            })
      }
  
      <Typography component="h3" variant="h6" gutterBottom>Utilisateurs</Typography>
      <div>
      {
        users.length === 0
          ? <em>Aucun utilisateur défini</em>
          : users.map(name => {
              return <React.Fragment key={name}>
                <Chip label={name} variant="outlined" />
                <br/>
              </React.Fragment>
            })
      }
      </div>
  
      <Button startIcon={<EditIcon />} onClick={() => { setIsEditDialogOpen(true) }}>
        Modifier
      </Button>
    </div>
  }