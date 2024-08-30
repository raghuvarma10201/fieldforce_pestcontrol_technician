import React, {createContext, useState, useContext, useEffect} from 'react'
import { useHistory } from 'react-router';
import axios from 'axios';
// import { FCM } from '@capacitor-community/fcm';
import { Geolocation } from '@capacitor/geolocation';
import axiosInstance from './ApiInterceptor';
import { registerPushHandlers } from '../utils/pushNotiications';

const AuthContext = createContext<any>({}); 

export const AuthProvider: React.FC<any> = ({ children }) => {
    const history = useHistory();
    const apiUrl: any = import.meta.env.VITE_API_URL;
    const initialLoggedInState = !!localStorage.getItem('token');
    const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedInState);
    const [deviceInfo, setDeviceInfo] = useState('');
    const [lat, setLat] = useState<number>();
    const [long, setLong] = useState<number>();
    const [treatmentID,setTreatmentID] = useState<any>('');


    useEffect(()=>{
    registerPushHandlers();
    // const deviceToken: any = localStorage.getItem('device_token')
    // setDeviceInfo(deviceToken);
    // console.log(deviceInfo, "Device Token-------->");
    },[]);

    useEffect(()=>{
        console.log("latlong", lat, long);
    },[lat,long]);
      

  
    const login = async (username: any, password : any) => {
        const deviceToken: any = localStorage.getItem('device_token')
        console.log("apiUrl",apiUrl);
        console.log("loginFormValue", username);
        try {
            if(deviceToken == null) {
                registerPushHandlers();
            }
            let payload = {
                "username": username,
                "password":password,
                "device_id":deviceToken
            }
            const response = await axios.post(apiUrl + '/login', payload, { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });
            console.log('API Response:', response.data);
            localStorage.setItem('token', response.data.data[0].api_token);
            localStorage.setItem('userData', JSON.stringify(response.data.data[0]));
            //localStorage.setItem('userPermissions',JSON.stringify(response.data.data.permission_types));
            setIsLoggedIn(true);
            return response;
        }
        catch (error: any) {
            return error.response
            // console.log(error);
        }
    };

    // const getToken = async () => {
    //     FCM.getToken()
    //       .then(r => {
    //         console.log("tokennnnn",r)
    //         setDeviceInfo(r.token);
    //         console.log(r.token)
    //         console.log("ytgruyhtuhgiuy6gui")
    //         })
    //        .catch(err => console.log(err));
    // }

    const clearLocalStorageExceptKey = (keyToKeep: any) => {
        const valueToKeep = localStorage.getItem(keyToKeep);
        localStorage.clear();
        if (valueToKeep !== null) {
            localStorage.setItem(keyToKeep, valueToKeep);
        }
      };
       
    const logout = async () => {
        try {
            alert('ddd');
            const response = await axiosInstance.post(apiUrl + '/logout', {}, { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });
            console.log('API Response:', response.data);
            const keysToKeep = ['device_token', 'username', 'password','rememberMe'];
            const savedValues = keysToKeep.map(key => ({ key, value: localStorage.getItem(key) }));
            localStorage.clear();
            savedValues.forEach(({ key, value }) => {
              if (value !== null) {
                localStorage.setItem(key, value);
              }
            });
            setIsLoggedIn(false);
            return response;
        }
        catch (error: any) {
            return error.response
            // console.log(error);
        }
    };

    const checkInOut = async (values: any) =>{
        const coordinates = await Geolocation.getCurrentPosition();
        console.log('Current position:', coordinates);
        setLat(coordinates.coords.latitude);
        setLong(coordinates.coords.longitude);
        let payload = {
            "type" : values,
            "location": `${coordinates.coords.latitude},${coordinates.coords.longitude}`
        }
        try {
            const response =await axiosInstance.post(apiUrl+'api/v1/mosquito-control-checkin-checkout', payload, { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } } );
            console.log(response);
            return response;
        }
        catch (error: any){
            console.log("error", error);
        }
    }

    const getCurrentLocation = async () => {
        try {
            const position = await Geolocation.getCurrentPosition({enableHighAccuracy:false, maximumAge: 30000}); // cached location till 30 seconds 
            console.log("geoLocation ", position.coords);
            setLat(position.coords.latitude);
            setLong(position.coords.longitude);
            return position;
          } catch (e) {
            console.log("Geolocation Error or user not logged in.");
            return null;
          }
        }

        

  
    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, deviceInfo, checkInOut, getCurrentLocation, lat, long, treatmentID}}>
            {children}
        </AuthContext.Provider>
    )
  
  }
  
  export const useAuth = () => useContext(AuthContext);



