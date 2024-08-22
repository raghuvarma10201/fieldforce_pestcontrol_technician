import axiosInstance from "../../../components/ApiInterceptor";
import { API_BASE_URL } from "../../baseUrl";


const apiUrl: any = import.meta.env.VITE_API_URL;

const getUserData = () => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.error("User data is not available");
      throw new Error("User Data Not available");
    }
    return JSON.parse(userDataString);
};

export const fetchMaterilData = async (requestBody: any) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}/get-technician-stock`,requestBody);
    console.log(response);
    return response.data;
  }
  catch(error){
    throw error;
  }   
};

export const fetchTechnicians = async () => {
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

      },
      pagination: {
        limit: "10",
        page: "0",
      },
    };
    const response = await axiosInstance.post(`${apiUrl}/get-ideal-technicians`,requestBody);
    console.log(response);
    return response.data;
  }
  catch(error){
    throw error;
  }   
};
export const transferStock = async (toId: any, materials: any) => {
  try {
    const requestBody = {
      "to_technician_id": toId,
      "item_details": materials
    };
    const response = await axiosInstance.post(`${apiUrl}/transfer-stock-by-technician`,requestBody);
    console.log(response);
    return response.data;
  }
  catch(error){
    throw error;
  }   
};
export const techniciansStockTransferred = async (page: any) => {
  try {
    const requestBody = {
      "columns": [
        "tbl_stock_transfer.id",
        "tbl_stock_transfer.from_technician_id",
        "tbl_stock_transfer.to_technician_id",
        "tbl_stock_transfer.status",
        "tbl_stock_transfer.created_on",
        "tbl_user.user_id",
        "tbl_user.employee_code",
        "tbl_user.first_name",
        "tbl_user.last_name",
        "tbl_user.mobile_no",
        "tbl_status.status_name",
        "tbl_stock_transfer.reference_number"
      ],
      "order_by": {
        "tbl_stock_transfer.created_on": "desc"
      },
      "filters": {
        "search":""
      },
      "custom-filters": {
        "operation_type": "TRANSFERRED"
      },
      "pagination": {
        "limit":"100",
        "page":"0"
      }
    };
    const response = await axiosInstance.post(`${apiUrl}/get-technicians-stock-transferred`,requestBody);
    console.log(response);
    return response.data;
  }
  catch(error){
    throw error;
  }   
};
  export const techniciansStockRecieved = async (page: any) => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.error("User data is not available");
      throw new Error("User Data Not available");
    }
    const userData = JSON.parse(userDataString);
    const payload = {
      "columns": [
        "tbl_stock_transfer.id",
        "tbl_stock_transfer.from_technician_id",
        "tbl_stock_transfer.to_technician_id",
        "tbl_stock_transfer.status",
        "tbl_stock_transfer.created_on",
        "tbl_user.user_id",
        "tbl_user.employee_code",
        "tbl_user.first_name",
        "tbl_user.last_name",
        "tbl_user.mobile_no",
        "tbl_status.status_name",
        "tbl_stock_transfer.reference_number"
    ],
    "order_by": {
      "tbl_stock_transfer.created_on": "desc"
    },
    "filters": {
      "search":""
    },
    "custom-filters": {
      "operation_type": "RECEIVED"
    },
    "pagination": {
      "limit":"100",
      "page":"0"
    }
    };
    try {
      const response = await fetch(`${API_BASE_URL}/get-technicians-stock-received`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Response for technicians stock transfer", data);
        return data;
      } else {
        console.error("Error:", response.statusText);
        throw new Error(
          `Error : ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  };

  export const transferedRecievedDetail = async (id : any, segment: any) => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.error("User data is not available");
      throw new Error("User Data Not available");
    }
    const userData = JSON.parse(userDataString);
    const payload = {
      "columns": [
        "tbl_stock_item_transfer.id",
        "tbl_stock_item_transfer.stock_transfer_id",
        "tbl_stock_item_transfer.item_id",
        "tbl_stock_item_transfer.item_quantity",
        "tbl_items.id",
        "tbl_items.item_name",
        "tbl_items.unit_id",
        "tbl_user.user_id",
        "tbl_user.first_name",
        "tbl_user.last_name",
        "tbl_user.mobile_no",
        "tbl_stock_transfer.created_on",
        "tbl_status.status_name" ,
        "tbl_stock_transfer.reason",
        "tbl_stock_transfer.reference_number",
        "tbl_stock_transfer.from_technician_id",
        "tbl_stock_transfer.to_technician_id",
        "tbl_uoms.name as unit_name",
        "tbl_items.packaging_uom"
    ],
    "order_by": {
      "tbl_items.item_name": "asc"
    },
    "filters": {
      "tbl_stock_item_transfer.stock_transfer_id": id
    },
    "custom-filters": {
      "operation_type": segment
    },
    "pagination": {
      "limit":"10",
      "page":"0"
    }
    };
    try {
      const response = await fetch(`${API_BASE_URL}/get-received-transferred-stock-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Response for technicians stock transfer", data);
        return data;
      } else {
        console.error("Error:", response.statusText);
        throw new Error(
          `Error : ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  };

  export const stockApproveRejected = async (id : any, status: any, reason: any) => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.error("User data is not available");
      throw new Error("User Data Not available");
    }
    const userData = JSON.parse(userDataString);
    const payload = {
    "stock_id" : id,
    "status" : status,
    "reason" : reason
    };
    try {
      const response = await fetch(`${API_BASE_URL}/accept-reject-received-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Response for technicians stock transfer", data);
        return data;
      } else {
        console.error("Error:", response.statusText);
        throw new Error(
          `Error : ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  };