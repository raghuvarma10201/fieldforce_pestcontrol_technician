import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonAlert,
  IonBadge,
  IonLabel,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import { ellipse, sync, time } from "ionicons/icons";

import { getVisitExecutionDetails, visitStatusCount } from "../data/apidata/taskApi/taskDataApi";
import { handleCheckOut } from "../data/apidata/authApi/dataApi";
import { retrieveNetworkTasks } from "../data/offline/entity/DataRetriever";
import MenuAction from "../components/MenuAction";
import NetworkCheckTime from "./NetworkCheckTime";
import Db from "../data/offline/entity/Db";
import { syncPush } from "../data/offline/entity/sync-push";
import { toast } from "react-toastify";
import { fetchNotifications } from "../data/apidata/notificationsApi/notificationsApi";
import NotificationLength from "../components/NotificationLength";
import useLongitudeLocation from "../components/useLongitudeLocation";
import {
  retrieveNetworkTasksDetails,
  retrieveNetworkTasksExecutionDetails,
} from "../data/offline/entity/DataRetriever";
import TaskProgress, { saveTaskProgress, setStartStatus, updateTaskProgressStatusFromExecDetails } from "../data/localstorage/taskStatusStorage";
import { getDateTime } from "../utils/dateTimeUtils";
import { submitTaskStart } from "../data/offline/entity/DataTransfer";

const isProd: any = import.meta.env.PROD;

const Dashboard: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [ongoingTaskData, setOnGoingTaskData] = useState<any>([]);
  const [userData, setUserData] = useState<any>(null);
  const location = useLongitudeLocation();
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [expiredTasks, setExpiredTasks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false); // State for loading spinner
  const [checkloading, setCheckLoading] = useState<boolean>(false); // State for loading spinner
  const [showAlert, setShowAlert] = useState<boolean>(false); // State for the alert
  const app_version: any = localStorage.getItem('app_version');
  const app_name: any = localStorage.getItem('app_name');
  const history = useHistory();

  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserData(userData);
    }
    visitStatusCount()
      .then((response) => {
        if (response && response.success) {
          const data = response.data;
          setTotalTasks(data.total_visit_count);

          const statusCounts = data.visit_status_count;
          statusCounts.forEach((status: any) => {
            switch (status.status_name.toLowerCase()) {
              case "completed":
                setCompletedTasks(Number(status.status_count));
                break;
              case "expiry":
                setExpiredTasks(Number(status.status_count));
                break;

              default:
                break;
            }
          });
        } else {
          console.error("Failed to fetch visit status counts.");
          // toast.error('Server not responding. Please try again later.');
        }
      })
      .catch((error) => {
        console.error("Error fetching visit status counts:", error);
        toast.error("Server not responding. Please try again later.");
      });
  }, []);

  useEffect(() => {
    getOnGoingNPendingTasks();
  }, [location]);

  const getOnGoingNPendingTasks = async () => {
    if (location?.latitude && location?.longitude) {
      setLoading(true);
      console.log("Fetching Task List from Tasks");

      // Fetch tasks with statuses 14 (pending), 17 (on-going), 33 (new status)
      let rawTaskList = await retrieveNetworkTasks(
        ["14", "17", "33"],
        location.latitude,
        location.longitude
      );

      let ongoingTask = rawTaskList.find((task: any) => task.service_status === "On Going")
      

      setLoading(false);
      setOnGoingTaskData(ongoingTask);
      console.log(ongoingTask);
    }
  };
  const handleCheckOutClick = async () => {
    setCheckLoading(true);
    console.log("In handle check click");
    const result = await handleCheckOut();
    if (result.success) {
      setCheckLoading(false);
      localStorage.removeItem("checkInFlag");
      history.push("/home");
    } else {
      setCheckLoading(false);
      toast.error(result.message);
      console.error("Check out failed:", result.message);
    }
  };

  const handleNotificationClick = () => {
    history.push("/notification");
  };
  const handleSyncClick = async () => {
    setShowAlert(true); // Show the confirmation alert
  };
  const startTask = async () => {
    localStorage.setItem("activeTaskData", JSON.stringify(ongoingTaskData));
    console.log("Start or Continue Task . task data = ", ongoingTaskData);
    try {
      if (
        ongoingTaskData.service_status.toLowerCase() === "on going" ||
        ongoingTaskData.service_status.toLowerCase() === "paused"
      ) {
        console.log("taskData.service_status == On Going ");
        try {
          const { response, data } = await retrieveNetworkTasksExecutionDetails(
            ongoingTaskData.id
          );
          if (response.ok) {
            console.log("Visit Execution Details ::", data.data);
            const updatedTaskProgress: TaskProgress =
              updateTaskProgressStatusFromExecDetails(
                ongoingTaskData.id,
                data.data
              );
            console.log("final progressStatus of task:", updatedTaskProgress);
            if (updatedTaskProgress) saveTaskProgress(updatedTaskProgress);
          } else {
            console.error(data.message);
            // toast.error('Server not responding. Please try again later.');
          }
        } catch (error) {
          console.error("Error:", error);
          // toast.error('Server not responding. Please try again later.');
        }

        history.push("/taskexecution");
      } else if (ongoingTaskData.service_status == "Completed") {
        console.log("taskData.service_status == Completed ");
        try {
          const { response, data } = await getVisitExecutionDetails(
            ongoingTaskData.id
          );
          if (response.ok) {
            console.log("Visit Execution Details ::", data.data);
            const updatedTaskProgress: TaskProgress =
              updateTaskProgressStatusFromExecDetails(
                ongoingTaskData.id,
                data.data
              );
            if (updatedTaskProgress) saveTaskProgress(updatedTaskProgress);
          } else {
            console.error(data.message);
            // toast.error('Server not responding. Please try again later.');
          }
        } catch (error) {
          console.error("Error:", error);
          // toast.error('Server not responding. Please try again later.');
        }
        history.push("/taskexecution");
      } else {
        //pending
        console.log("taskData.service_status == Pending ");
        const formattedDate = getDateTime();

        // const { response, data } = await taskInit(
        //   taskDetails.id,
        //   formattedDate,
        //   "Service Request Start",
        //   "Service Initiated"
        // );
        const { response, data } = await submitTaskStart(
          ongoingTaskData.id,
          formattedDate,
          "Service Request Start",
          "Service Initiated"
        );

        console.log(
          "Response from API:----------------------------------->",
          response
        );
        console.log(
          "Response from API:----------------------------------->",
          data
        );
        if (response.ok) {
          const progressStatus: TaskProgress = setStartStatus("" + taskId);
          console.log("API Response:", data); // Print the response in the console
          if (data.is_chemicals_required) {
            setShowAlert(true);
          } else {
            history.push("/taskexecution");
          }
        } else {
          console.error("Error Checking In ", response);
          //setError(data.message);
          if (data.is_chemicals_required) {
            setShowAlert(true);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      // toast.error('Server not responding. Please try again later.');
    } finally {
    }
  };
  const startTsask = async () => {
    console.log("taskData.service_status == On Going ");
    try {
      const { response, data } = await retrieveNetworkTasksExecutionDetails(
        ongoingTaskData.id
      );
      if (response.ok) {
        console.log("Visit Execution Details ::", data.data);
        const updatedTaskProgress: TaskProgress =
          updateTaskProgressStatusFromExecDetails(
            ongoingTaskData.id,
            data.data
          );
        console.log("final progressStatus of task:", updatedTaskProgress);
        if (updatedTaskProgress) saveTaskProgress(updatedTaskProgress);
      } else {
        console.error(data.message);
        // toast.error('Server not responding. Please try again later.');
      }
    } catch (error) {
      console.error("Error:", error);
      // toast.error('Server not responding. Please try again later.');
    }
    try {
      const taskDetails = await retrieveNetworkTasksDetails(taskId);
      localStorage.setItem("activeTaskData", JSON.stringify(taskDetails));
      history.push("/taskexecution");
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Server not responding. Please try again later.");
    }
    

  };
  const handleConfirmSync = async (confirm: boolean) => {
    if (confirm) {
      setLoading(true);
      try {
        await syncPush();
      } catch (error) {
        console.error("Sync failed:", error);
        toast.error("Server not responding. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    setShowAlert(false); // Hide the alert
  };
  const menuList: any = [
    {
      path: "/site",
      icon: "site-icon.svg",
      title: "Site",
    },
    {
      path: "/tasks",
      icon: "tasks-icon.svg",
      title: "Tasks",
    },
    {
      path: "/createtask",
      icon: "create-task-icon.svg",
      title: "Create Task",
    },
    {
      path: "/stocktransfer",
      icon: "stock-transfer-dashboard-icon.svg",
      title: "Stock Transfer",
    },
    {
      path: "/forms",
      icon: "form-icon.svg",
      title: "Form",
    },
    // {
    //   path: "sync",
    //   icon: "sync-icon.svg",
    //   title: "Sync",
    // },
    // {
    //   // path: "sync",
    //   icon: "sync-icon.svg",
    //   title: "SyncUp",
    //   onClick: handleSyncClick,
    // },
    // {
    //   path: "",
    //   icon: "settings-icon.svg",
    //   title: "Settings",
    // },
    // {
    //   path: "",
    //   icon: "reports-icon.svg",
    //   title: "Reports",
    // },
    {
      path: "/dashboard",
      icon: "checkout-icon.svg",
      title: "Check Out",
      onClick: handleCheckOutClick,
    },
  ];

  return (
    <>
      <IonContent className="dashboardWrapp ionContentColor ">
        <div className="homeHeader">
          <IonItem lines="none">
            <IonImg
              className="logoMd ion-float-start"
              src="assets/images/logo-sm-white.svg"
            />
            <div className="headerBts" slot="end">
              <NotificationLength />
              <IonButton shape="round" routerLink={"/profile"}>
                <IonImg src="assets/images/account-user.svg" />
              </IonButton>
            </div>
          </IonItem>

          <IonText className="welcomeText">
            <h2>Welcome !</h2>
            <h1> {userData?.first_name} {userData?.last_name}</h1>
            <h6>{userData?.role_name}</h6>
          </IonText>

          <div className="totalTasks">
            <IonRow>
              <IonCol size="4" className="ion-borderRightDash">
                <IonCard>
                  <IonText>
                    <h3>{totalTasks}</h3>
                  </IonText>
                  <IonText>
                    <h5>Total Tasks</h5>
                  </IonText>
                </IonCard>
              </IonCol>
              <IonCol size="4" className="ion-borderRightDash">
                <IonCard >
                  <IonText>
                    <h3 className="completedColor">{completedTasks}</h3>
                  </IonText>
                  <IonText>
                    <h5>Completed</h5>
                  </IonText>
                </IonCard>
              </IonCol>
              <IonCol size="4">
                <IonCard>
                  <IonText>
                    <h3 className="expiredcolor">{expiredTasks}</h3>
                  </IonText>
                  <IonText>
                    <h5>Expired</h5>
                  </IonText>
                </IonCard>
              </IonCol>
            </IonRow>
          </div>

        </div>


        <div className="homeList ion-padding-horizontal">

          <IonRow>
            {menuList.length > 0
              ? menuList.map((item: any, index: any) => {
                const { path, icon, title, onClick } = item;
                return path === "sync" ? (
                  <IonCol key={index} size="4">
                    <IonCard>
                      <Db />
                    </IonCard>
                  </IonCol>
                ) : (
                  <MenuAction
                    key={index}
                    path={path}
                    icon={icon}
                    title={title}
                    onClick={onClick}
                  />
                );
              })
              : "No Data"}
          </IonRow>
        </div>

        <div className="checkInFooter">
          <IonItem lines="none">
            {/* <IonImg src="assets/images/time-icon.svg"></IonImg> */}
            <IonIcon icon={time}></IonIcon>
            <IonText>
              <NetworkCheckTime />
            </IonText>
          </IonItem>
        </div>
        <IonText className='loginVersion'>
          <p>App Version &nbsp;{app_version}</p>
        </IonText>
      </IonContent>
      {!loading && ongoingTaskData ? (
        <IonFooter className="ion-footer onGoingTask">
          <IonToolbar>
            <div className="ion-float-start" slot="start">
              <h2>{ongoingTaskData.service_name}</h2>
              <IonLabel>Reference Number <span>{ongoingTaskData.reference_number}</span></IonLabel>
            </div>

            <div className="ion-float-end statusBlock" slot="end" onClick={(e) => startTask()}> 
              <IonLabel>Status  <span>{ongoingTaskData.service_status} <IonImg className="ion-float-right" src="assets/images/arrow-forward-w.svg"></IonImg></span></IonLabel>
            </div>
          </IonToolbar>
        </IonFooter>
      ) : (
        ""
      )}

      <IonLoading
        isOpen={loading}
        message={"Syncing up data to server..."}
        spinner="crescent"
      />
      <IonLoading
        isOpen={checkloading}
        message={"Loading..."}
        spinner="crescent"
      />
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Confirm"}
        message={"Do you want to upload sync data?"}
        buttons={[
          {
            text: "No",
            role: "cancel",
            handler: () => handleConfirmSync(false),
          },
          {
            text: "Yes",
            handler: () => {
              handleConfirmSync(true), setShowAlert(false);
            },
          },
        ]}
      />
    </>
  );
};

export default Dashboard;
