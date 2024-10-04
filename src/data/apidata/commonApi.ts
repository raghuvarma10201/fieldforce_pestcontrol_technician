import axios from 'axios';
import axiosInstance from '../../components/ApiInterceptor';



const apiUrl: any = import.meta.env.VITE_API_URL;


export const appSettings = async (payload: any) => {
  try{
    const response = await axiosInstance.post(`${apiUrl}/get-settings`, payload);
    return response;
  }
  catch(error){
    console.error(error);
  }
};
export const getLanguageFile = async (language: any) => {
    try{
      const response = await axios.get(`https://mocki.io/v1/c88ca78a-6557-4e75-ad23-96f3fa6a1327`);
      console.log("Language Response"+JSON.stringify(response));
      return response;
    }
    catch(error){
      console.error(error);
    }
  };