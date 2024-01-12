import React from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import './AppAdmin.css';

// https://encartes.aliens-lyon.fr/api/map/machin

function FormatModeName(mode) {
	if (mode === "add_place_name")
		return "Ajouter un nom de salle"
	else if (mode === "del_place_name")
		return "Retirer un nom de salle"
	else if (mode === "add_room_user_name")
		return "Ajouter un nom d'utilisateur.ice"
	else if (mode === "del_room_user_name")
		return "Retirer un nom d'utilisateur.ice"
	else
		return "Heeeeuh ya un prob la, 42"
}

function RenderRequestList() {
	const [data, setData] = React.useState("");
	
	React.useEffect(() => { // Fetch the list of modifications to be accepted/denied
	// fetch("./propositions.json")
    // .then((response) => response.json())
	// .then((data) => setData(data));
	// }, []);

	fetch('https://encartes.aliens-lyon.fr/api/map/get_all_editions')
    .then((response) => response.json())
	.then((data) => setData(data));
	}, []);

	const removeElement = (index) => { // Removes an element from the displayed modifications (does not remove it from the DB)
		const newData = data.filter((_, i) => i !== index);
		setData(newData);
	};
	
	const acceptRequest = (item) => {
		console.log("Proposition " + item.id + " acceptée.");
		fetch("https://encartes.aliens-lyon.fr/api/map/" + item.mode + "/" + item.placeId + "/" + item.editorValue); // Send the request to the DataBase
		fetch("https://encartes.aliens-lyon.fr/api/map/remove_edition/" + item.id); // Remove the edition
	}

	const denyRequest = (item) => {
		console.log("Proposition " + item.id + " rejetée.")
		fetch("https://encartes.aliens-lyon.fr/api/map/remove_edition/" + item.id); // Remove the edition, don't accept it
	}

	return <Box
		sx={{ width: '100%', height: 680, maxWidth: 1200}}
		>
		<Typography sx={{ mt: 4, mb: 2 }} variant="h5" component="div">
				Requêtes
			</Typography>
		<List>
			{data.length>0 && 
			<div>
				<Grid container spacing={2} columns={10}>
					<Grid item xs={1}>
						Index
					</Grid>
					<Grid item xs={2}>
						Modification
					</Grid>
					<Grid item xs={2}>
						ID de salle
					</Grid>
					<Grid item xs={2}>
						Noms de salle
					</Grid>
					<Grid item xs={3}>
						Valeur à ajouter/supprimer
					</Grid>
				</Grid>
				{data.map((item, index) => {
				return (
				<ListItem
					secondaryAction={
						<>
						<IconButton 
						onClick={(event) => {
							removeElement(index); // Remove the display of this item
							acceptRequest(item); // Send the signal that it has been accepted
						}}
						aria-label="check"
						>
						  	<CheckIcon />
						</IconButton>
						<IconButton 
						onClick={(event) => {
							removeElement(index); // Remove the display of this item
							denyRequest(item); // Send the signal that it has been denied
						}}
						edge="end" 
						aria-label="clear"
						>
						  <ClearIcon />
						</IconButton>
						</>
					}
					key={item.id}
				>
					<Grid container spacing={2} columns={10}>
						<Grid item xs={1}>
							{index+1}
						</Grid>
						<Grid item xs={2}>
							{FormatModeName(item.mode)}
						</Grid>
						<Grid item xs={2}>
							{item.placeId}
						</Grid>
						<Grid item xs={2}>
							{item.placeNames.join(", ")}
						</Grid>
						<Grid item xs={3}>
							{item.editorValue}
						</Grid>
					</Grid>
				</ListItem>
			);
			})}
			</div>}
			{data.length===0 &&
				<div>
					Aucune requête !
				</div>
			}
		</List>
	</Box>
}

function TopBar() {
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
			ENcarteS Admin
			</Typography>
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
			{"À propos de ENcarteS Admin"}
		</DialogTitle>
		<DialogContent>
			<DialogContentText id="alert-dialog-description">
			ENcarteS Admin permet d'accepter ou de refuser les requêtes de modification d'ENcarteS !
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={handleCloseAboutModal}>Ok</Button>
		</DialogActions>
		</Dialog>
	</>
}

export default function AppAdmin() {
	
	return <>
	<TopBar />

	<div style={{ flexGrow: '1', display: 'flex', flexDirection: 'line', flexWrap: 'nowrap' }}>
		<RenderRequestList/>
	</div>
	</>
}
