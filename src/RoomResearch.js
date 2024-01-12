import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';

import Rooms from './Rooms.js';
import API_URL from './config.js';

export default function RoomResearch({ callbackRoomSelected }) {
    const [currentRequest, setCurrentRequest] = React.useState("");
    const [rooms, setRooms] = React.useState([]);
  
    const startResearch = (event) => {
      fetch(API_URL + "find_place_by_name/" + currentRequest)
        .then(response => response.json())
        .then(data => {
          setRooms(data);
        });
    };
  
    return <>
      <div style={{ padding: '24px' }}>
        <Typography component="h2" variant="h5" gutterBottom>
          Rechercher une salle
        </Typography>
        <TextField
          label="Nom, code, occupants, ..."
          value={currentRequest}
          onChange={(event) => { setCurrentRequest(event.target.value) }}
          variant="outlined"
          fullWidth
        />
        <Box
          marginTop={1}
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-end"
        >
          <Button startIcon={<SearchIcon />} variant="contained" onClick={startResearch}>
            Rechercher
          </Button>
        </Box>
        <Rooms rooms={rooms} callbackRoomSelected={callbackRoomSelected} />
      </div>
    </>
  }