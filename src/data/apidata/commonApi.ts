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
export const getLanguages = async () => {
  try{

    const response = await axios.get(`${apiUrl}/get-languages-list`);
    console.log("Language Response"+JSON.stringify(response));
    return response.data;
  }
  catch(error){
    console.error(error);
  }
};
export const getLanguageFile = async (language: any) => {
  try{
    const payload = {
      "language_id" : language
    }
    const response = await axios.post(`${apiUrl}/get-language-labels`, payload);
    console.log("Language Response"+JSON.stringify(response));
    return response.data;
  }
  catch(error){
    console.error(error);
  }
};