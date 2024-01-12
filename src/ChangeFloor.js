import React from 'react';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import API_URL from './config.js';

export default function ChangeFloor({ currentFloor, callbackFloorChanged }) {
    const [sites, setSites] = React.useState([]);
    const handleFloorChanged = (event) => {
      callbackFloorChanged(event.target.value);
    };
  
    React.useEffect(() => {
      fetch(API_URL + "get_all_floors/")
        .then(response => response.json())
        .then(data => {
          setSites(data);
  
          // Display a floor
          callbackFloorChanged(data[0].buildings[0].floors[0].id)
        });
    }, [callbackFloorChanged]);
  
    if (currentFloor === undefined) return;
  
    var items = [];
  
    sites.forEach(site => {
      site.buildings.forEach(building => {
        building.floors.forEach(floor => {
          items.push(
            <MenuItem value={floor.id} key={floor.id}>
              {site.name} / {building.name} / {floor.name}
            </MenuItem>
          )
        })
      })
  
    });
  
    return <>
      <div style={{ padding: '24px' }}>
        <Typography component="h2" variant="h5" gutterBottom>
          Changer d'étage
        </Typography>
        <Select
          value={currentFloor}
          label="Étage"
          onChange={handleFloorChanged}
          fullWidth
        >
          {items}
        </Select>
      </div>
    </>
  }