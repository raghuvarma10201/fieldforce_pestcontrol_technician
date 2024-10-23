import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonProgressBar,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import TaskDetailItems from "../components/TaskDetailItems";
import { ellipse } from "ionicons/icons";
import {
  fetchTaskDetails,
  getVisitExecutionDetails,
} from "../data/apidata/taskApi/taskDataApi";
import { useParams } from "react-router-dom";
import { taskInit } from "../data/apidata/taskApi/taskDataApi";
import { formatDate, getDate, getDateTime } from "../utils/dateTimeUtils";
import CustomAlert from "../components/CustomAlert";
import {
  retrieveNetworkTasksDetails,
  retrieveNetworkTasksExecutionDetails,
} from "../data/offline/entity/DataRetriever";
import TaskProgress, {
  saveTaskProgress,
  setStartStatus,
  updateTaskProgressStatusFromExecDetails,
} from "../data/localstorage/taskStatusStorage";
import { pencil, arrowBack } from "ionicons/icons";
import { Network } from "@capacitor/network";
import { submitTaskStart } from "../data/offline/entity/DataTransfer";
import { toast } from "react-toastify";
import NotificationLength from "../components/NotificationLength";
import { useTranslation } from "react-i18next";


const TaskDetails: React.FC = () => {
  const params: any = useParams();
  const { t } = useTranslation();
  // const { id } = useParams<{ id: string }>(); // Dynamically fetch taskId from URL
  const [taskDetails, setTaskDetails] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isStartingTask, setIsStartingTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nextButton, setNextButton] = useState<string>(t('start','Start'));
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  // const [taskId, settaskId] =  useState <string >();
  let taskId = "";
  const history = useHistory();

  useEffect(() => {
    
    console.log('ddd');
    loadTaskFromParams();
    fetchTDetails(taskId);
    // fetchTaskDetails(taskId)
  }, []); // Execute useEffect whenever taskId changes

  const fetchTDetails = async (taskId: any) => {
    
    console.log("Going to fetch Task Details for task ID ::::", taskId);
    setLoading(true); // Start loading

    try {
      const response = await retrieveNetworkTasksDetails(taskId);
      console.log(response);
      if (response) {
        console.log("Fetched task details:", response);
        const taskData = response;

        // Set next button based on task status
        if (
          taskData.service_status === "On Going" ||
          taskData.service_status === "Paused"
        ) {
          setNextButton(t('continue','Continue'));
        } else if (taskData.service_status === "Completed") {
          setNextButton(t('close','Close')); // Assuming it should be Close for Completed
        } else {
          setNextButton(t('start','Start')); // Assuming it should be Start for other statuses
        }
        setTaskDetails(taskData);
      } else {
        console.error("Failed to fetch task details. Error:", response.message);
        // toast.error('Server not responding. Please try again later.');
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      // toast.error('Server not responding. Please try again later.');
      // Handle error state if needed
    } finally {
      setLoading(false); // End loading
    }
  };

  const loadTaskFromParams = () => {
    console.log("##########################################");
    console.log("LOADING task ID from params = ", params);
    console.log("params wise task id ", params.taskId);
    // setActiveTaskId(params.id)
    // id = params.taskId
    taskId = params.taskId;
    console.log("active task id ", taskId);
  };
  const taskData: any = [
    {
      key: "1",
      icon: "site-location-icon.svg",
      labelTxt: t('site','Site')+' '+t('location','Location'),
      valueTxt: taskDetails.address || "N/A",
    },
    {
      key: "2",
      icon: "service-icon.svg",
      labelTxt: t('service','Service'),
      valueTxt: taskDetails.service_name || "N/A",
    },
    {
      key: "3",
      icon: "transaction-id-icon.svg",
      labelTxt: t('reference_number','Reference No'),
      valueTxt: taskDetails.reference_number || "N/A",
    },
    {
      key: "4",
      icon: "contact-icon.svg",
      labelTxt: t('contact','Contact')+' '+t('person','Person')+' '+t('name','Name'),
      valueTxt: taskDetails.customer_name || "N/A",
    },
    {
      key: "5",
      icon: "contact-icon.svg",
      labelTxt: t('contact','Contact')+' '+t('mobile','Mobile'),
      valueTxt: taskDetails.mobile_no || "N/A",
    },
    {
      key: "6",
      icon: "appointment-icon.svg",
      labelTxt: t('appointment','Appointment')+' '+t('date','Date'),
      valueTxt: taskDetails.service_date
        ? formatDate(taskDetails.service_date) +
          " " +
          taskDetails.preffered_time
        : "N/A",
    },
    {
      key: "7",
      icon: "treatment-type-icon.svg",
      labelTxt: t('treatment_type','Treatment type'),
      valueTxt: taskDetails.treatment_type
        ? taskDetails.treatment_type
            .map((type: any) => type.treatment)
            .join(", ")
        : "N/A",
    },
    {
      key: "8",
      icon: "pest-covered-icon.svg",
      labelTxt: t('service','Service')+' '+t('activity','Activity'),
      valueTxt: taskDetails.pest_covered
        ? taskDetails.pest_covered.map((pest: any) => pest.pest).join(", ")
        : "N/A",
    },
    {
      key: "9",
      icon: "area-icon.svg",
      labelTxt: t('area','Area'),
      valueTxt: "N/A",
    },
  ];

  const handleNavigateToList = () => {
    history.push({
      pathname: "/MaterialList",
      state: { showAlert: true },
    });
  };
  const startTask = async () => {
    console.log("Start or Continue Task . task data = ", taskDetails);
    try {
      setLoading(true);
      if (
        taskDetails.service_status.toLowerCase() === "on going" ||
        taskDetails.service_status.toLowerCase() === "paused"
      ) {
        console.log("taskData.service_status == On Going ");
        try {
          const { response, data } = await retrieveNetworkTasksExecutionDetails(
            taskDetails.id
          );
          if (response.ok) {
            console.log("Visit Execution Details ::", data.data);
            const updatedTaskProgress: TaskProgress =
              updateTaskProgressStatusFromExecDetails(
                taskDetails.id,
                data.data
              );
            console.log("final progressStatus of task:", updatedTaskProgress);
            if (updatedTaskProgress) saveTaskProgress(updatedTaskProgress);
          } else {
            console.error(data.message);
            // toast.error('Server not responding. Please try again later.');
          }
        } catch (error) {
          setLoading(false);
          console.error("Error:", error);
          // toast.error('Server not responding. Please try again later.');
        }
        setLoading(false);
        history.push("/taskexecution");
      } else if (taskDetails.service_status == "Completed") {
        console.log("taskData.service_status == Completed ");
        try {
          const { response, data } = await getVisitExecutionDetails(
            taskDetails.id
          );
          if (response.ok) {
            console.log("Visit Execution Details ::", data.data);
            const updatedTaskProgress: TaskProgress =
              updateTaskProgressStatusFromExecDetails(
                taskDetails.id,
                data.data
              );
            if (updatedTaskProgress) saveTaskProgress(updatedTaskProgress);
          } else {
            console.error(data.message);
            // toast.error('Server not responding. Please try again later.');
          }
        } catch (error) {
          console.error("Error:", error);
          setLoading(false);
          // toast.error('Server not responding. Please try again later.');
        }
        setLoading(false);
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
        const response= await submitTaskStart(
          taskDetails.id,
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
          response.data
        );
        if (response.success) {
          const progressStatus: TaskProgress = setStartStatus("" + taskId);
          console.log("API Response:", response.data); // Print the response in the console
          if (response.is_chemicals_required) {
            setShowAlert(true);
            //history.push("/taskexecution");
          } else {
            setLoading(false);
            history.push("/taskexecution");
          }
        } else {
          setLoading(false);
          console.error("Error Checking In ", response);
          setError(response.message);
          if (response.is_chemicals_required) {
            setShowAlert(true);
          }
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      // toast.error('Server not responding. Please try again later.');
    } finally {
    }
  };
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // const navigateToTaskExe = () => {
  //   history.push("/taskexecution");
  // };

  const alertButtons = [
    {
      text: "Close",
      cssClass: "alert-button-cancel",
      role: "close",
      handler: () => handleCloseAlert(),
    },
  ];
  const goBack = () => {
    history.goBack();
  };
  return (
    <>
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonBackButton defaultHref={"/"}></IonBackButton>
          </IonButtons>
          <IonTitle className="ion-float-start"> {t('task_details','Task Details')}</IonTitle>
          <div className="ion-float-end headerBts">
            <IonButton shape="round" routerLink={"/"}>
              <IonImg src="assets/images/home-outline-icon.svg" />
            </IonButton>
           
            <NotificationLength/>
            <IonButton shape="round" routerLink={"/profile"}>
              <IonImg src="assets/images/account-user.svg" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        className="dashboardWrapp ionContentColor ion-padding-horizontal"
      >
        {loading && <IonProgressBar type="indeterminate" />}
        <div className="ionPaddingBottom">
          <IonList lines="full" className="ion-list-item ">
            {taskData.length > 0 &&
              taskData.map((obj: any, index: any) => {
                const { icon, labelTxt, valueTxt, key } = obj;
                return (
                  <TaskDetailItems
                    icon={icon}
                    labelTxt={labelTxt}
                    valueTxt={valueTxt}
                    key={key}
                  />
                );
              })}
          </IonList>
        </div>
      </IonContent>
      <IonFooter className="ion-footer">
        <IonToolbar className="ionFooterTwoButtons">
          <IonButton
            className="ion-button"
            color={"medium"}
            routerLink="/taskreschedule"
            disabled={
              taskDetails.service_status === "On Going" ||
              taskDetails.service_status === "Paused"
            }
          >
            {t('reschedule','Reschedule')}
          </IonButton>
          <IonButton
            className="ion-button"
            color={"primary"}
            onClick={(e) => startTask()}
          >
            {nextButton}
          </IonButton>
        </IonToolbar>
      </IonFooter>

      <CustomAlert
        isOpen={showAlert}
        subHeader="Please collect insufficient materials at the warehouse today."
        message="click here to see the list"
        buttons={alertButtons}
        onClose={handleCloseAlert}
        onMessageClick={handleNavigateToList}
      />
    </>
  );
};

export default TaskDetails;
