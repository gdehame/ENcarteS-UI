import React from 'react';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import { ThemeProvider, createTheme } from '@mui/material/styles';

import './App.css'

import ChangeFloor from './ChangeFloor';
import EditDialog from './EditDialog';
import Map from './Map.js';
import RoomInformation from './RoomInformation';
import RoomResearch from './RoomResearch';

function TopBar({ toggleTheme }) {
  const [openAboutModal, setOpenAboutModal] = React.useState(false);

  const handleOpenAboutModal = () => {
    setOpenAboutModal(true);
  };

  const handleCloseAboutModal = () => {
    setOpenAboutModal(false);
  };

  return <>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ENcarteS
        </Typography>
        <IconButton onClick={toggleTheme} size="large">
          <SettingsBrightnessIcon fontSize="inherit" />
        </IconButton>
        <Button color="inherit" onClick={handleOpenAboutModal}>À propos</Button>
      </Toolbar>
    </AppBar>

    <Dialog
      open={openAboutModal}
      onClose={handleCloseAboutModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"À propos d'ENcarteS"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          ENcarteS permet de rechercher les salles de l'ENS !
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseAboutModal}>Ok</Button>
      </DialogActions>
    </Dialog>
  </>
}

function App({ toggleTheme }) {
  const [currentFloor, setCurrentFloor] = React.useState(undefined);
  const [selectedRoom, setSelectedRoom] = React.useState(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  return <>
    <EditDialog
      isOpen={isEditDialogOpen}
      setIsOpen={setIsEditDialogOpen}
      room={selectedRoom}
    />
    <TopBar toggleTheme={toggleTheme} />
    <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'line', flexWrap: 'nowrap' }}>
      {currentFloor !== undefined ? <Map
        selectedRoom={selectedRoom}
        callbackRoomSelected={setSelectedRoom}
        floorID={currentFloor}
        callbackChangeFloor={setCurrentFloor}
      /> : <></>}
      <div>
        <ChangeFloor currentFloor={currentFloor} callbackFloorChanged={setCurrentFloor} />
        <Divider />
        <RoomResearch callbackRoomSelected={(floor, room) => {
          setCurrentFloor(floor);
          setSelectedRoom(room);
        }} />
        <Divider />
        <RoomInformation
          roomId={selectedRoom}
          setIsEditDialogOpen={setIsEditDialogOpen}
        />
      </div>
    </div>
  </>
}

export default function ThemedApp() {
  const [themeMode, setThemeMode] = React.useState('light');

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setThemeMode('dark')
    } else {
      setThemeMode('light')
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App toggleTheme={toggleTheme} />
    </ThemeProvider>
  );
}
