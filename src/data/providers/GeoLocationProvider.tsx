import { Capacitor } from "@capacitor/core";
import { Geolocation, PositionOptions } from "@capacitor/geolocation";
import { Diagnostic } from '@ionic-native/diagnostic';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

export const getCurrentLocation = async () => {
try {
    const isLocationEnabled = await Diagnostic.isLocationEnabled();
    if(!isLocationEnabled){
      if (Capacitor.getPlatform() === 'android') {
        confirmAlert({
          message: 'Please enable location services!',
          buttons: [
            {
              label: 'Enable',
              onClick: async () => {
                await Diagnostic.switchToLocationSettings();
              }
            },
            {
              label: 'Cancel',
              onClick: () => {
                console.log('cancelled');
              }
            }
          ]
        });
        // swal("Please enable location services!",'error').then(async ()=>{
        //   await Diagnostic.switchToLocationSettings();
        // });
         
      } else {
        // For iOS or other platforms, guide the user to enable location services manually
        alert('Please enable location services in your device settings.');
      }
    }else{
      const position = await Geolocation.getCurrentPosition({enableHighAccuracy:false, maximumAge: 30000}); // cached location till 30 seconds 
      console.log("geoLocation ", position.coords);
      return position;
    }
    
  } catch (e) {
    console.log("Geolocation Error or user not logged in.");
    return null;
  }
}