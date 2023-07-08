import Head from 'next/head';
import Map from '@components/Map';
import styles from '@styles/Home.module.scss';
import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useState } from 'react';

const DEFAULT_CENTER =[51.505, -0.09]


export default function Home() {
  let polygonIdArray = [];
  let polygonIdToRemove = [];
  let polygon = [];

  const [markers, setMarkers] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');

  //event handler for DDL
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  }

  //add markers from new polygon
  const addMarkers = (newMarkers) => {
    setMarkers((prevMarkers) => [...prevMarkers, ...newMarkers]);
  };

  //remove markers from deleted polygon
  const removeMarkers = (idsToRemove) => {
    setMarkers((prevMarkers) =>
      prevMarkers.filter((marker) => !idsToRemove.includes(marker.polygonId)));
      polygonIdArray = polygonIdArray.filter((id) => !idsToRemove.includes(id));
  };

  //event handler for creating polygon
  const createPolygon = (e) =>{
    polygon = [];
    for(let i=0; i<e.layer._latlngs[0].length; i++){
      polygon[i] = e.layer._latlngs[0][i]
    }
    polygonIdArray.push(e.layer._leaflet_id);
    if(!(polygon.length === 0)){
      handleCreatedExportPolygon()
    }
  }

  //server call to get list of all cars inside polygon
  const handleCreatedExportPolygon = async function(){
    const res  = await fetch("/api/get-cars-in-polygon",{
    method:"POST",
      headers: {
        "Content-Type": "application/json"
      },
      body:JSON.stringify(polygon),
  }) 
  if(res.ok){
  const responseJson  = await res.json()
  const { items } = responseJson;
  const newMarkers = items.map(({id, location}) => ({
    id: id,
    location: {
      lat: location.lat,
      lng: location.lng,
    },
    polygonId: polygonIdArray[polygonIdArray.length - 1]
  }));
    addMarkers(newMarkers);
  }else {
      console.error("Error occurred while fetching data:", res.status);
    }
  }

  // server call to get list of all cars, not used from my understanding of the assignment
  // const getAllCars = async function(){
  //   const res  = await fetch(import.meta.env.VITE_GET_ALL_CARS_SERVER_URL,{ 
  //     method:"GET",
  // })  
  // const {} = await res.json()
  // }

  //event handler for deleting polygon
  const deletePolygon = (e) => {
    var lengthOfArray = Object.keys(e.layers._layers).length
    for(let i=0; i<lengthOfArray; i++){
      const key = Object.keys(e.layers._layers)[i];
      const polygonId = parseInt(key, 10);
      polygonIdToRemove.push(polygonId);
    }
    removeMarkers(polygonIdToRemove);
  }


  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginTop: '10px',
        padding: '2px',
        paddingTop: '10px',
        top: '5%',
        left: '50%',
        transform: 'translate(-50%, -65%)',
        alignItems: 'center', 
        position:'absolute', 
        zIndex: 999,
        }}>
          <span style={{ marginRight: '10px', marginTop: '-11px' }}>List of available cars: </span>
          <Select
            style={{
              display: 'flex',
              alignItems: 'left',
              paddingLeft: '50px',
              height: '25px',
              width: '400px',
              marginBottom: '10px',
            }}
            value={selectedValue}
            onChange={handleChange}
            >
            {markers.length === 0 && (
            <MenuItem disabled>
              No cars available...
            </MenuItem>
            )}
            {markers.length > 0 && selectedValue === '' && (
              <MenuItem disabled>
                Please select a car
              </MenuItem>
            )}
            {markers.map((item, index) => (
              <MenuItem key={index} value={item.id}>
                {item.id}
              </MenuItem>
            ))}
          </Select>
       </div>
       <div className={styles.mapContainer}>
          <Map className={styles.homeMap} 
          style = {{width: "80vw", height: "80vh" }}
          center={DEFAULT_CENTER} zoom={13}>
            {({  TileLayer, FeatureGroup, Marker, Popup  },{EditControl}) => (
            <>
          <TileLayer
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.location.lat, marker.location.lng]}>
              <Popup>{marker.id}</Popup>
            </Marker>
          ))}
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={createPolygon}
              onDeleted={deletePolygon}
              edit={{edit: false, remove: true}}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false
              }}
            />
          </FeatureGroup>
      </>
       )}
      </Map>
      </div>
    </>
  )
}
