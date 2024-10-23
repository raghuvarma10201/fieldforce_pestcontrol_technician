import { getCurrentLocation } from "../../providers/GeoLocationProvider";
import { formatDateTime, getDateTime } from "../../../utils/dateTimeUtils";
// import useLongitudeLocation from "../../../components/useLongitudeLocation";
/////Get User Data from session Storage///////////

import { toZonedTime, format } from "date-fns-tz";
import axiosInstance from "../../../components/ApiInterceptor";

const apiUrl: any = import.meta.env.VITE_API_URL;

const formatToUaeTime = (dateTime: any) => {
  const uaeTimeZone = "Asia/Dubai";
  const zonedTime = toZonedTime(dateTime, uaeTimeZone);
  // return format(zonedTime, 'yyyy-MM-dd HH:mm:ss.SSS');
  return format(zonedTime, "yyyy-MM-dd HH:mm:ss");
};
export const getUserData = () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    throw new Error("User Data Not available");
  }
  return JSON.parse(userDataString);
};
export const getBusinessId = () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    throw new Error("User Data Not available");
  }
  return (JSON.parse(userDataString)).business_id;
};
export const getActTaskData = () => {
  const userDataString = localStorage.getItem("activeTaskData");
  if (!userDataString) {
    console.error("Active Task data is not available");
    throw new Error("Active Task Data Not available");
  }
  return JSON.parse(userDataString);
};

// 14 - Pending, 17 - in-progress and 18 - complete
// 14 - Pending, 17 - in-progress and 18 - complete

export const fetchTaskData = async (status: string[],latitude: number,longitude: number) => {
  try {
    const requestBody = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_status.status_name as service_status",
        "tbl_visits.visit_type",
        "tbl_visits.reference_number",
        "tbl_visits.priority",
        "tbl_visits.service_id",
      ],
      order_by: {
        "tbl_visits.created_on": "asc",
        "tbl_visits.service_date": "asc",
      },
      filters: {
        "tbl_visits.service_status": status,
        "tbl_visits.business_id": await getBusinessId()
      },
      pagination: {
        limit: "0",
        page: "1",
      },
      coordinates: {
        latitude,
        longitude,
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/task-list`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
export const fetchFilteredTaskData = async (filterCriteria: string[],latitude: number,longitude: number) => {
  try {
    
    const requestBody = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_status.status_name as service_status",
        "tbl_visits.visit_type",
        "tbl_visits.reference_number",
        "tbl_visits.priority",
        "tbl_visits.service_id",
      ],
      order_by: {
        "tbl_visits.created_on": "asc",
        "tbl_visits.service_date": "asc",
      },
      filters: filterCriteria,
      pagination: {
        limit: "0",
        page: "1",
      },
      coordinates: {
        latitude,
        longitude,
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/task-list`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

// To get Completed TaskList
export const completedTaskData = async (latitude: number,longitude: number) => {
  try {
    const requestBody = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_status.status_name as service_status",
        "tbl_visits.visit_type",
        "tbl_visits.reference_number",
        "tbl_visits.priority",
        "tbl_visits.service_id",
      ],
      order_by: {
        // "tbl_visits.created_on": "asc",
        "tbl_visits.service_completed": "desc",
      },
      filters: {
        "tbl_visits.service_status": "18",
      },
      pagination: {
        limit: "0",
        page: "1",
      },
      coordinates: {
        latitude,
        longitude,
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/task-list`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const visitStatusCount = async () => {
  try {
    const response = await axiosInstance.get(`${apiUrl}/visit-status-count`);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

//  "log_type": "Track Travel Time Start",//Service Request Start,Track Travel Time Start,Track Travel Time End
// "tracking_type":"Start",//Service Initiated,Start,Stop

export const taskInit = async (visit_id: string,formattedDate: string,log_type: string,tracking_type: string) => {
  const pos = await getCurrentLocation();
  if (!pos) {
    console.error("Error fetching Location");
    throw new Error("Failed to fetch Location");
  }
  try {
    const requestBody = [
      {
        visit_id: visit_id,
        log_type: log_type, //Service Request Start,Track Travel Time Start,Track Travel Time End
        tracking_type: tracking_type, //Service Initiated,Start,Stop
        date_time: formattedDate,
        latitude: "" + pos.coords.latitude,
        longitude: "" + pos.coords.longitude,
      },
    ];
    const response = await axiosInstance.post(`${apiUrl}/task-initiate`, requestBody);
    console.log(response);
    return response.data[0];
  }
  catch (error) {
    throw error;
  }
};
export const getTaskInitTimes = async (visitId: string) => {

  try {
    const requestBody = {
      visit_id: visitId, //mandatory
    };
    const response = await axiosInstance.post(`${apiUrl}/get-task-initiate`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};


export const fetchTaskDetails = async (id: string) => {
  try {
    const requestBody = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_status.status_name as service_status",
        "tbl_visits.visit_type",
        "tbl_visits.reference_number",
        "tbl_visits.priority",
        "tbl_customers.customer_name",
        "tbl_customers.mobile_no",
        "tbl_visits.service_id",
      ],
      order_by: {
        "tbl_visits.created_on": "asc",
      },
      filters: {
        // "tbl_visits.service_status": "14",
        "tbl_visits.id": id,
        "tbl_visits.business_id" : await getBusinessId()
      },
      pagination: {
        limit: "1",
        page: "0",
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/task-detail`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

//////////////////////////////////////////////////////////////////////////////////

export const followup = async () => {
  try {
    const requestBody = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_visits.visit_type",
        "tbl_visits.service_id",
        "tbl_visit_feedback_follow_up.is_follow_up_required",
        "tbl_visit_feedback_follow_up.next_follow_up",
      ],
      order_by: {
        "tbl_visits.id": "desc",
      },
      filters: { "tbl_visit_feedback_follow_up.is_follow_up_required": "Yes" },
      pagination: {
        limit: "50",
        page: "1",
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/follow-up-reschedule`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    // hour: "numeric",
    // minute: "numeric",
    // hourCycle: "h24",
    // second: "numeric",
    hour12: false, // Ensure 12-hour format
  };
  return date.toLocaleString("en-US", options);
};

// pestSubmission.ts
//////////////////////////pestActivityFound Api////////////////////////////////////////////////

export const fetchPestData = async () => {
  const actTaskData = getActTaskData()[0].service_id;
  try {
    const requestBody = {
      columns: ["id", "sub_service_id", "pest_report_type"],
      order_by: {
        created_on: "asc",
      },
      filters: { sub_service_id: actTaskData },
      pagination: {
        limit: "0",
        page: "1",
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/get-pests-list`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const postPestActivity = async ( formDataArray: any[],latitude: number,longitude: number,visit_id: any): Promise<any> => {

   const pest_found_details = formDataArray.map((item) => ({
      is_pest_found: item.is_pest_found === "Yes" ? "Yes" : "No",
      sub_service_id: item.sub_service_id || "",
      pest_severity: item.pest_severity,
      pest_area: item.pest_area,
      pest_reported_id: item.pest_report_id, // Use the pest_report_id from formDataArray
      pest_photo: item.pest_photo,
    }));
  try {
    const requestBody = [
      {
        pest_found_details: pest_found_details,
        latitude,
        longitude,
        visit_id: visit_id,
      },
    ];
    const response = await axiosInstance.post(`${apiUrl}/add-pest-found-details`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
/////////////////////////////////////chemicals Api///////////////////////////////
// export const fetchGetPestChemicalItems = async () => {
//   const userData = getUserData();
//   try {
//     const requestBody = {
//       service_id: "4",
//     };

//     const response = await fetch(`${API_BASE_URL}/get-items`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${userData?.api_token}`,
//       },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch data");
//     }

//     const data = await response.json();
//     return { response, data };
//   } catch (error) {
//     console.error("Error fetching task data:", error);
//     throw error;
//   }
// };
export const fetchGetPestChemicalItems = async () => {
  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task Data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);

  const service_id= activeTaskData.service_id;
  try {
    const requestBody = {
      columns: [
        "tbl_item_service_mapping.id",
        "tbl_item_service_mapping.item_id",
        "tbl_items.item_name",
        "tbl_item_service_mapping.unit_id",
        "tbl_uoms.name",
      ],
      order_by: {
        "tbl_items.item_name": "asc",
      },
      filters: {
        "tbl_item_service_mapping.service_id": service_id,
      },
      pagination: {
        limit: "0",
        page: "1",
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/get-chemicals-used-for-pest`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const insertChemicalsUsedForPest = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/insert-chemicals-used-for-pest`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

////////////////////////////getvistexecution API///////////////////////////////////////////
export const getVisitExecutionDetails = async (visitId: string) => {
  try {
    const requestBody = {
      visit_id: visitId,
    };
    const response = await axiosInstance.post(`${apiUrl}/get-visit-execution-details-v2`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const createTask = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/create-my-task`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};


export const treatmentTypes = async (serviceId: any) => {
  try {
    const requestBody = {
      service_id: serviceId,
    };
    const response = await axiosInstance.post(`${apiUrl}/get-treatment-types`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const pestReported = async (serviceId: any) => {
  try {
    const requestBody = {
      service_id: serviceId,
      business_id : await getBusinessId()
    };
    const response = await axiosInstance.post(`${apiUrl}/get-services-reported`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};


export const customerList = async () => {
  try {
    const payload = {
      business_id : await getBusinessId()
    }
    const response = await axiosInstance.post(`${apiUrl}/get-customers`,payload);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const customerLocations = async (customerId: any) => {
  try {
    const requestBody = {
      customer: customerId,
      business_id : await getBusinessId()
    };
    const response = await axiosInstance.post(`${apiUrl}/get-customer-location`,requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const serviceList = async () => {
  try {
    const payload = {
      business_id : await getBusinessId()
    }
    const response = await axiosInstance.post(`${apiUrl}/get-services`,payload);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const timeDuration = async () => {
  try {
    const payload = {
      business_id : await getBusinessId()
    }
    const response = await axiosInstance.post(`${apiUrl}/time-duration`,payload);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const customerType = async () => {
  try {
    const payload = {
      business_id : await getBusinessId()
    }
    const response = await axiosInstance.post(`${apiUrl}/get-clienttypes`,payload);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const getAreas = async () => {
  try {
    const payload = {
      business_id : await getBusinessId()
    }
    const response = await axiosInstance.post(`${apiUrl}/get-areas`,payload);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const addCustomer = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/add-customer`,requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
///////////////////////recommendations Apis//////////////////////////////////

export const multiRecommendations = async () => {
  alert();
  try {
    const response = await axiosInstance.get(`${apiUrl}/get-recommendations-list`);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const submitRecommendations = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/add-pest-recommendation`,requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

////////////////////////////////workdoneDetails Apis///////////////////////////

export const fetchQuestionnaire = async () => {
  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);
  const service_id = activeTaskData.service_id;
  try {
    const requestBody = {
      business_id : await getBusinessId(),
      service_id: service_id,
    };
    const response = await axiosInstance.post(`${apiUrl}/get-work-done-questionnaire`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const submitWorkDoneDetail = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/add-work-done-detail`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};


////////////////////////////////////////feedback followup apis/////////////////////////////////////////

export const submitFollowupFeedback = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/add-followup-feedback-details`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const fetchvisitExecutionpreview = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/get-visit-execution-details-v2`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

/////////////////////////formData API call///////////////////////////////////
export const getvistexecutionApi = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/get-visit-execution-details-v2`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
//////////////////////////getvisittraveldetails API-Siteview location//////////////////////////////export const getvistexecutionApi = async (requestBody: any) => {

export const getvisittraveldetails = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/get-visit-travel-data`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

////////////////////////Reschedule Api///////////////////////////////////////////////

// export const taskRescheduleData = async (requestBody: any) => {
//   try {
//     const userData = getUserData();
//     const response = await fetch(`${API_BASE_URL}/reschedule-visit`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${userData.api_token}`,
//       },
//       body: requestBody,
//     });

//     if (response.ok) {
//       const responseData = await response.json();
//       return responseData;
//     } else {
//       throw new Error("Failed   to get reshedule details");
//     }
//   } catch (error) {
//     console.error("Error submitting reshedule data:", error);
//   }
// };
