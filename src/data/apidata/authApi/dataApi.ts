import axiosInstance from "../../../components/ApiInterceptor";

import { getActiveTaskData } from "../../localstorage/taskUtils";
import { getCurrentLocation } from "../../providers/GeoLocationProvider";

const apiUrl: any = import.meta.env.VITE_API_URL;

/////Get User Data from session Storage///////////
const getUserData = () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    throw new Error("User Data Not available");
  }
  return JSON.parse(userDataString);
};

export const userCheckIn = async () => {
  const userData = getUserData();

  // Get current location
  const pos = await getCurrentLocation();
  console.log(pos);
  if (!pos) {
    console.error("Error fetching Location");
    return;
  }
  try {
    const requestBody = {
      type: 1, // 1-CHECK_IN, 2-CHECK_OUT
      user_id: userData.user_id,
      location: `${pos.coords.latitude},${pos.coords.longitude}`,
    };
    const response = await axiosInstance.post(`${apiUrl}/user-attendance`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const postDataToLocationTracking = async (latitude: number,longitude: number,actTaskId: String) => {

  const userData = getUserData();
  const actTaskData = getActiveTaskData();
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  try {
    const requestBody = [{
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      track_date: new Date().toISOString().slice(0, 10),
      track_time: formattedTime,
      visit_id: actTaskId,
    }];
    const response = await axiosInstance.post(`${apiUrl}/technician-location-tracking`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const handleCheckOut = async () => {
  const userData = getUserData();
  const pos = await getCurrentLocation();
  if (!pos) {
    console.error("Error fetching Location");
    const response = {ok : false};
    const data = {message : 'Failed to fetch Location'}
    return { response, data };
  }
  try {
    const requestBody = {
      type: 2, // 1-CHECK_IN, 2-CHECK_OUT
      user_id: userData.user_id,
      location: `${pos.coords.latitude},${pos.coords.longitude}`,
    };
    const response = await axiosInstance.post(`${apiUrl}/user-attendance`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

///////////////////////change password API///////////////////////////////////////////////////
export const changePasswordApi = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/change-password`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const userCheckIns = async (userData: any) => {
  const pos = await getCurrentLocation();
  if (!pos) {
    console.error("Error fetching Location");
    throw new Error("Failed to fetch Location");
  }
  try {
    const requestBody = {
      type: 1, // 1-CHECK_IN, 2-CHECK_OUT
      user_id: userData.user_id,
      location: `${pos.coords.latitude},${pos.coords.longitude}`,
    };
    const response = await axiosInstance.post(`${apiUrl}/user-attendance`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
