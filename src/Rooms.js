import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';

/* Displays a list of rooms */
export default function Rooms({ rooms, callbackRoomSelected }) {
  if (rooms.length === 0) {
    return;
  }
  return <TableContainer variant="outlined">
    <Table aria-label="demo table">
      <TableHead>
        <TableRow>
          <TableCell>Salle</TableCell>
          <TableCell>Bâtiment</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rooms.map((room) => {
          return <TableRow
            hover={true}
            onClick={() => callbackRoomSelected(room.floors[0].id, room.idPlace)}
            key={room.idPlace}
          >
            <TableCell>{room.namePlace[0]}</TableCell>
            <TableCell>{room.nameBuilding}</TableCell>
          </TableRow>
        })}
      </TableBody>
    </Table>
  </TableContainer>
}
