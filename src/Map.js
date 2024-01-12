import { MapContainer } from 'react-leaflet/MapContainer';
import { Marker } from 'react-leaflet/Marker';
import { Popup } from 'react-leaflet/Popup';
import { Polygon } from 'react-leaflet/Polygon';
import { Tooltip } from 'react-leaflet/Tooltip';
import { useState, useEffect } from "react";
import React from 'react';
import L from 'leaflet';
import stairs from "./stairs.png";
import lift from "./lift.png";
import toilet from "./toilet.png"
import { useMapEvent, useMap } from 'react-leaflet/hooks';
import API_URL from './config';

function Stairs({ position, size, body }) {
  // React class (in function form) to represent stairs, takes the position where to put the stairs logo
  // and the body of the popup of the stairs (list of floors accessible from that staircase)
  const map = useMap();
  const [markerIcon, setMarkerIcon] = useState(new L.Icon({ iconUrl: stairs, iconSize: size }));
  useMapEvent('zoomend', () => {
    setMarkerIcon(new L.Icon({
      iconUrl: stairs,
      iconSize: [40 * Math.pow(2, map.getZoom() - 4), 40 * Math.pow(2, map.getZoom() - 4)]
    }))
  });
  return <Marker position={position} icon={markerIcon}>
    {body}
  </Marker>
}

function Lift({ position, size, body }) {
  // React class (in function form) to represent lifts, takes the position where to put the lift logo
  // and the body of the popup of the lift (list of floors accessible from that lift)
  const map = useMap();
  const [markerIcon, setMarkerIcon] = useState(new L.Icon({ iconUrl: lift, iconSize: size }));
  useMapEvent('zoomend', () => {
    setMarkerIcon(new L.Icon({
      iconUrl: lift,
      iconSize: [20 * Math.pow(2, map.getZoom() - 4), 20 * Math.pow(2, map.getZoom() - 4)]
    }))
  });
  return <Marker position={position} icon={markerIcon}>
    {body}
  </Marker>
}

function Toilet({ position, size }) {
  // React class (in function form) to represent lifts, takes the position where to put the lift logo
  // and the body of the popup of the lift (list of floors accessible from that lift)
  const map = useMap();
  const [markerIcon, setMarkerIcon] = useState(new L.Icon({ iconUrl: toilet, iconSize: size }));
  useMapEvent('zoomend', () => {
    setMarkerIcon(new L.Icon({
      iconUrl: toilet,
      iconSize: [20 * Math.pow(2, map.getZoom() - 4), 20 * Math.pow(2, map.getZoom() - 4)]
    }))
  });
  return <Marker position={position} icon={markerIcon} />
}

function polygonCenter(polygon) {
  // Function to calculate the central point of a given polygon
  let minX = -1;
  let minY = -1;
  let maxX = -1;
  let maxY = -1;
  // We get the extremal coordinates
  for (const ind in polygon) {
    const pt = polygon[ind];
    if (minX === -1 || minX > pt[0]) {
      minX = pt[0];
    }
    if (minY === -1 || minY > pt[1]) {
      minY = pt[1];
    }
    if (maxY === -1 || maxY < pt[1]) {
      maxY = pt[1];
    }
    if (maxX === -1 || maxX < pt[0]) {
      maxX = pt[0];
    }
  }
  // Then return the average
  return [(minX + maxX) / 2, (maxY + minY) / 2];
}

function logoSize(polygon) {
  // function to calculate the size of a logo to display
  // on a room which edges are in polygon
  let minX = -1;
  let minY = -1;
  let maxX = -1;
  let maxY = -1;
  // We first calculate the maximal coordinates to then output
  // 75% the size of the room
  for (const ind in polygon) {
    const pt = polygon[ind];
    if (minX === -1 || minX > pt[0]) {
      minX = pt[0];
    }
    if (minY === -1 || minY > pt[1]) {
      minY = pt[1];
    }
    if (maxY === -1 || maxY < pt[1]) {
      maxY = pt[1];
    }
    if (maxX === -1 || maxX < pt[0]) {
      maxX = pt[0];
    }
  }
  // For some unknown reason we have to multiply by 10 otherwise
  // it's almost invisible
  const x = 30 * (maxX - minX) / 4;
  const y = 30 * (maxY - minY) / 4;
  // We return a square size to make it better looking so we
  // take the minimal size of border
  if (x < y) {
    return [x, x];
  }
  return [y, y];
}

function min_max(request) {
  // Function to calculate the minimal and maximal coordinates of all the points in a request
  // (it being a list of polygons, a polygon being a list of points, a point being a list of 2 coordinates)
  let minX = -1;
  let minY = -1;
  let maxX = -1;
  let maxY = -1;
  for (const ind in request) {
    const element = request[ind];
    for (const index in element["surface"]) {
      const pt = element["surface"][index];
      if (minX === -1 || minX > pt["x"]) {
        minX = pt["x"];
      }
      if (minY === -1 || minY > pt["y"]) {
        minY = pt["y"];
      }
      if (maxY === -1 || maxY < pt["y"]) {
        maxY = pt["y"];
      }
      if (maxX === -1 || maxX < pt["x"]) {
        maxX = pt["x"];
      }
    }
  }
  return [minX, maxX, minY, maxY];
}

function floorList(connectedFloors, callbackChangeFloor) {
  // Returns under html format a list of floors connected
  // listed in connectedFloors
  // Auxiliary function used when creating a Lift/Stairs component
  let htmlFloorList = [];
  const style = {cursor : "pointer"};
  for (const floor in connectedFloors) {
    htmlFloorList = [
      ...htmlFloorList,
      <li key={floor} onClick={() => {callbackChangeFloor(connectedFloors[floor]["id"]); }} style={style}>
        {connectedFloors[floor]["name"]}
      </li>
    ];
  }
  return htmlFloorList;
}

function newPolygon(element, positions, selectedRoom, callbackRoomSelected, callbackChangeFloor) {
  // Auxiliary function to return the appropriate polygon depending
  // on wether it is a room (R), a lift (L), a staircase (S), toilets (T) or corridor (C)
  // For all except corridors we put a Tooltip with the name of the room
  // as well as a callback to display the room informations when the user clicks on the room
  // and for S or L, we add a Popup with the list of connected floors and possibility to load the
  // map of a connected floor
  const color = selectedRoom === element['id'] ? 'red' : 'grey';

  if (element['type'] === 'C') { // Corridor
    return <Polygon positions={positions} key={element['id'] + color} color={'peru'} />
  }

  var content = <></>
  if (element['type'] === 'S') { // Stair
    content = <Stairs
      position={polygonCenter(positions)}
      size={logoSize(positions)}
      body={<Popup>
        {floorList(element['connectedFloors'], callbackChangeFloor)}
      </Popup>}
    />
  } else if (element['type'] === 'L') { // Lift
    content = <Lift
      position={polygonCenter(positions)}
      size={logoSize(positions)}
      body={<Popup>
        {floorList(element['connectedFloors'], callbackChangeFloor)}
      </Popup>}
    />
  } else if (element['type'] === 'T') { // Toilets
    content = <Toilet position={polygonCenter(positions)} size={logoSize(positions)} />
  }
  var tooltip = null;
  if (element["names"][0] != null) {
    tooltip = <Tooltip>{element["names"][0]}</Tooltip>;
  }
  return <Polygon
  positions={positions}
    key={element["id"] + color} 
    color={color}
    eventHandlers={{ click: () => callbackRoomSelected(element["id"]) }}
    >
    {tooltip}
    {content}
  </Polygon>
}

function list_polygons(request, center, callbackRoomSelected, selectedRoom, callbackChangeFloor) {
  // Main function to calculate the list of polygons (React components)
  // Taking the request as parameter, the center of the points of the request
  // and a callback (callback) to interact with the global web interface
  // when a room is clicked (allowing the display of room informations)
  let polygons = [];
  for (const ind in request) {
    const element = request[ind];
    // element can be a room, a lift, a staircase or toilets
    const positions = (element["surface"]).map((pt) => {
      // This function rotates and recenters de the map (should not be necessary once the real data are gathered.
      // It also changes the objects into lists of two coordinates to make it accepted by the "positions" attribute of
      // the "Polygon" react-leaflet component
      return [-(pt["y"] - center[1]) / 6, (pt["x"] - center[0]) / 6];
    });
    const pol = newPolygon(element, positions, selectedRoom, callbackRoomSelected, callbackChangeFloor);
    polygons = [...polygons, pol];
  }
  return polygons;
}

function buildPols(request, callbackRoomSelected, selectedRoom, callbackChangeFloor) {
  // This function just calls the list_polygons one with appropriate parameters (precalculate center)
  const minMaxXY = min_max(request);
  const minX = minMaxXY[0];
  const maxX = minMaxXY[1];
  const minY = minMaxXY[2];
  const maxY = minMaxXY[3];
  const center = [(maxX + minX) / 2, (maxY + minY) / 2];
  const polygons = list_polygons(request, center, callbackRoomSelected, selectedRoom, callbackChangeFloor);
  return polygons;
}

function Map({ callbackRoomSelected, selectedRoom, floorID, callbackChangeFloor }) {
  // When the user selects a room on the map, call callbackRoomSelected.
  // The room that is currently selected is selectedRoom. It is null if no room
  // is selected
  const [loading, setLoading] = useState(true);
  const [floor, setFloor] = useState(null);
  const [error, setError] = useState(null);
  // We use the useEffect hook to fetch the data to build the Map
  useEffect(() => {
    fetch(API_URL + "get_floor/" + floorID)
      .then(response => response.json())
      .then(data => { setLoading(false); setFloor(data) })
      .catch((error) => { setError("API unreachable"); });
  }, [floorID]);
  // We distinguish wether to print an error, a loading message
  // or the map if we got the answer
  const corner1 = L.latLng(-50, -100);
  const corner2 = L.latLng(50, 100);
  const bounds = L.latLngBounds(corner1, corner2);

  if (error != null) {
    return <MapContainer center={[0, 0]} zoom={4} scrollWheelZoom={true} style={{ flexGrow: '1' }} maxBounds={bounds} maxBoundsViscosity={1.0}>
      <Popup position={[0, 0]}>{error}</Popup>
    </MapContainer>;
  }
  else if (loading) {
    return <MapContainer center={[0, 0]} zoom={4} scrollWheelZoom={true} style={{ flexGrow: '1' }} maxBounds={bounds} maxBoundsViscosity={1.0}>
      <Popup position={[0, 0]}>Loading map</Popup>
    </MapContainer>;
  }
  else {
    const request = floor["places"];
    /*const createPolygons = React.useCallback((request, callbackRoomSelected, selectedRoom) => {
      return buildPols(request, callbackRoomSelected, selectedRoom);
    }, [request, callbackRoomSelected, selectedRoom]);
    const polygons = createPolygons(request, callbackRoomSelected, selectedRoom);
    */
    const polygons = buildPols(request, callbackRoomSelected, selectedRoom, callbackChangeFloor);
    return <MapContainer center={[0, 0]} zoom={4} scrollWheelZoom={true} style={{ flexGrow: '1' }} maxBounds={bounds} maxBoundsViscosity={1.0}>
      {polygons}
    </MapContainer>
  }
}

export default Map;
