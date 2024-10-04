import axiosInstance from "../../../components/ApiInterceptor";
import { getBusinessId } from "../taskApi/taskDataApi";

const apiUrl: any = import.meta.env.VITE_API_URL;


export const fetchNotifications = async () => {
  try {
    const requestBody = {
      columns: [
        "tbl_push_notifications.id",
        "tbl_push_notifications.title",
        "tbl_push_notifications.description",
        "tbl_status.status_name",
        "tbl_push_notifications.created_on",
      ],
      order_by: {
        "tbl_push_notifications.created_on": "desc",
      },
      filters: {
        "tbl_push_notifications.status": "28",
        "tbl_push_notifications.business_id" : await getBusinessId()
      },
      pagination: {
        limit: "10",
        page: "0",
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/get-notifications`,requestBody);
    console.log(response);
    return response.data;
  }
  catch(error){
      console.error(error);
  }   
};

export const updateNotificationStatus = async (id: number,updateData: { read: boolean }) => {
  try {
    const requestBody = {
      notification_id: id, // use the passed id
      read: updateData.read, // include the read status
    };
    const response = await axiosInstance.post(`${apiUrl}/update-push-notification-status`,requestBody);
    console.log(response);
    return response.data;
  }
  catch(error){
      console.error(error);
  }   
};
