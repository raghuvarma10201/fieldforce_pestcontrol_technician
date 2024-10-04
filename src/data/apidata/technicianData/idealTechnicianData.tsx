import axiosInstance from "../../../components/ApiInterceptor";
import useLongitudeLocation from "../../../components/useLongitudeLocation";
import { getBusinessId } from "../taskApi/taskDataApi";

const apiUrl: any = import.meta.env.VITE_API_URL;

interface Technician {
  first_name: string;
  last_name: string;
  mobile_no: string;
  avatar?: string;
  user_id: string;
}
//////////////Fetch Ideal Technician List//////////////////

export const fetchIdealTechnicians = async (): Promise<Technician[]> => {
  try {
    const requestBody = {
      columns: [
        "user_id",
        "first_name",
        "last_name",
        "email_id",
        "mobile_no",
        "avatar",
      ],
      order_by: {
        created_on: "asc",
      },
      filters: {
        last_action: "1",
        work_status: "idle",
        business_id: await getBusinessId()
      },
      pagination: {
        limit: "10",
        page: "0",
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/get-ideal-technicians`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
////////////////////Submit Technician Data////////////////
export const submitTechnicianData = async (baseImage: any,selectedTechnicianData: Technician[],latitude: number,longitude: number): Promise<void> => {
  localStorage.setItem("selectedTechnicianData", JSON.stringify(selectedTechnicianData));
  //Fetch Active Task ID
  const activeTaskStr = localStorage.getItem("activeTaskData");
  if (!activeTaskStr) {
    throw new Error("Task Data not available");
  }
  const activeTaskData = JSON.parse(activeTaskStr);
  const visit_id = activeTaskData.id;
  const visit_team = selectedTechnicianData.map((technician) => ({
    user_id: technician.user_id,
    user_image: technician.avatar || "",
  }));
  try {
    const requestBody = [
      {
        business_id : await getBusinessId(),
        visit_id, //Required
        team_count: selectedTechnicianData.length.toString(), //Required
        latitude,
        longitude,
        team_photo: baseImage ? baseImage : "",
        visit_team,
      }
    ];
    const response = await axiosInstance.post(`${apiUrl}/add-team-attendance`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};


