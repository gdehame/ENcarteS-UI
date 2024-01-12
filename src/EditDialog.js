import React from 'react';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';

import API_URL from './config.js';

export default function EditDialog({ isOpen, setIsOpen, room }) {
    const [names, setNames] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [pendingUpdates, setPendingUpdates] = React.useState([]);
    const [newPlaceName, setNewPlaceName] = React.useState("");
    const [newUserName, setNewUserName] = React.useState("");
  
    // Used to refresh useEffect
    const [updatesCount, setupdatesCount] = React.useState(0);
  
    React.useEffect(() => {
      if (room !== undefined) {
        fetch(API_URL + "get_place_info/" + room)
          .then(response => response.json())
          .then(data => {
            setNames(data.names);
            setUsers(data.users);
          });
        
        fetch(API_URL + "get_all_editions")
          .then(response => response.json())
          .then(data => {
            var updates = [];

            data.forEach(update => {
              if (update.placeId === room) {
                updates.push({
                  id: update.id,
                  text: (update.mode[10] === 'n' ? 'Nom : ' : 'Utilisateur : ') + update.editorValue,
                  color: update.mode[0] === 'a' ? 'success' : 'error'
                });
              }
            });

            setPendingUpdates(updates);
          });
      }
    }, [room, updatesCount]);
  
    const refresh = () => {
      setupdatesCount(updatesCount + 1);
    };
  
    const addName = () => {
      fetch(API_URL + "create_edition/add_place_name/" + room + "/" + encodeURI(newPlaceName))
        .then(response => refresh());
    };
  
    const removeName = (placeName) => {
      fetch(API_URL + "create_edition/del_place_name/" + room + "/" + encodeURI(placeName))
        .then(response => refresh());
    }
  
    const addUser = () => {
      fetch(API_URL + "create_edition/add_room_user_name/" + room + "/" + encodeURI(newUserName))
        .then(response => refresh());
    };
  
    const removeUser = (userName) => {
      fetch(API_URL + "create_edition/del_room_user_name/" + room + "/" + encodeURI(userName))
        .then(response => refresh());
    }
  
    return <Dialog open={isOpen} onClose={() => { setIsOpen(false) }}>
      <DialogTitle>Salle n°{room}</DialogTitle>
      <DialogContent>
        Modifications en attente :<br/>
        {pendingUpdates.map(update => {
          return <Chip
            label={update.text}
            key={update.id}
            color={update.color}
          />
        })}

        <Divider />

        Noms :<br />
        {names.map(name => {
          return <Chip
            label={name}
            key={name}
            variant="outlined"
            onDelete={() => { removeName(name) }}
          />
        })}
  
        <TextField
          value={newPlaceName}
          onChange={(event) => { setNewPlaceName(event.target.value) }}
          label="Nom de la salle"
          margin="dense"
          fullWidth
        />
        <Button onClick={() => { addName() }}>Ajouter</Button>
  
        <Divider />
  
        Utilisateurs :<br />
        {users.map(name => {
          return <Chip
            label={name}
            key={name}
            variant="outlined"
            onDelete={() => { removeUser(name) }}
          />
        })}
  
        <TextField
          value={newUserName}
          onChange={(event) => { setNewUserName(event.target.value) }}
          label="Nom de l'utilisateur"
          margin="dense"
          fullWidth
        />
        <Button onClick={() => { addUser() }}>Ajouter</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { setIsOpen(false) }}>Fermer</Button>
      </DialogActions>
    </Dialog>
  }