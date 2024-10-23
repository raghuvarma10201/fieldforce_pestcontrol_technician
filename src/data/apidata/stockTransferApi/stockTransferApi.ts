import axiosInstance from "../../../components/ApiInterceptor";
import { getBusinessId } from "../taskApi/taskDataApi";

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
    const response = await axiosInstance.post(`${apiUrl}/get-technician-stock`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
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
    const response = await axiosInstance.post(`${apiUrl}/get-ideal-technicians`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
export const transferStock = async (toId: any, materials: any) => {
  try {
    const requestBody = {
      "to_technician_id": toId,
      "business_id" : await getBusinessId(),
      "item_details": materials
    };
    const response = await axiosInstance.post(`${apiUrl}/transfer-stock-by-technician`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
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
        "search": "",
        "tbl_stock_transfer.business_id" : await getBusinessId()
      },
      "custom-filters": {
        "operation_type": "TRANSFERRED"
      },
      "pagination": {
        "limit": "100",
        "page": "0"
      }
    };
    const response = await axiosInstance.post(`${apiUrl}/get-technicians-stock-transferred`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const techniciansStockRecieved = async (page: any) => {
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
        "search": "",
        "tbl_stock_transfer.business_id" : await getBusinessId()
      },
      "custom-filters": {
        "operation_type": "RECEIVED"
      },
      "pagination": {
        "limit": "100",
        "page": "0"
      }
    };
    const response = await axiosInstance.post(`${apiUrl}/get-technicians-stock-received`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const transferedRecievedDetail = async (id: any, segment: any) => {
  try {
    const requestBody = {
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
        "tbl_status.status_name",
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
        "tbl_stock_item_transfer.stock_transfer_id": id,
        "tbl_stock_transfer.business_id" : await getBusinessId()
      },
      "custom-filters": {
        "operation_type": segment
      },
      "pagination": {
        "limit": "10",
        "page": "0"
      }
    };
    const response = await axiosInstance.post(`${apiUrl}/get-received-transferred-stock-details`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const stockApproveRejected = async (id: any, status: any, reason: any) => {
  try {
    const requestBody = {
      "stock_id": id,
      "status": status,
      "reason": reason
    };
    const response = await axiosInstance.post(`${apiUrl}/accept-reject-received-stock`, requestBody);
    console.log(response);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
