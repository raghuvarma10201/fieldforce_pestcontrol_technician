import axiosInstance from "../../../components/ApiInterceptor";
import { getBusinessId } from "../taskApi/taskDataApi";
interface LeaveData {
  available_leaves: string;
}

const apiUrl: any = import.meta.env.VITE_API_URL;

export const fetchLeaveDetails = async () => {
  try {
    const requestBody = {
      pageno: 0,
      page_limit: 5,
    };
    const response = await axiosInstance.post(`${apiUrl}/get-leave-details`,requestBody);
    console.log(response);
    return response.data;
  }
  catch(error){
      console.error(error);
  }   
};

/////////////////// Fetch Leaves Types//////////////
export const fetchLeaveTypes = async () => {
  try {
    const payload = {
      business_id : await getBusinessId()
    }
    const response = await axiosInstance.post(`${apiUrl}/get-leave-types`,payload, {timeout: 1000});
    console.log(response);
    return response.data;
  }
  catch(error){
      console.error(error);
  }   
};

////////////////////Leave Apply/////////////////
export const submitLeaveApply = async (data: any) => {
  const userDataString = localStorage.getItem("userData") || '';

  const userData = JSON.parse(userDataString);
  try {
    const requestBody = {
      leave_id: "",
      user_id: userData.user_id,
      day_type: data.dayType, // Use the dayType from the data object
      leave_type_id: data.leaveTypeId,
      leave_start_date: data.leaveStartDate,
      leave_end_date: data.leaveEndDate,
      reason_for_leave: data.reasonForLeave,
    };
    const response = await axiosInstance.post(`${apiUrl}/leave-apply`,requestBody);
    console.log(response);
    return response.data;
  }
  catch(error){
      console.error(error);
  }   
};
////////////////////get-available leaves api///////////////////
export const fetchAvailableLeaves = async (data: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/get-available-leaves`);
    console.log(response);
    if (response.data) {
      const responseData = response.data;
      const data: LeaveData[] = responseData.data;
      const totalLeaves = data.reduce(
        (total: number, leave: LeaveData) =>
          total + parseFloat(leave.available_leaves),
        0
      );
      return { success: true, data, totalLeaves: totalLeaves ?? 0 };
    } else {
      console.error("Failed to fetch available leaves");
      return { success: false, message: "Failed to fetch available leaves" };
    }
  }
  catch(error){
      console.error(error);
  }   
};