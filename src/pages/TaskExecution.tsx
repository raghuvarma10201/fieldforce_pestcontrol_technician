import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import swal from "sweetalert";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import CommonHeader from "../components/CommonHeader";
import {
  getTaskInitTimes,
  taskInit,
  getVisitExecutionDetails,
} from "../data/apidata/taskApi/taskDataApi";
import {
  formatDate,
  formatDateTime,
  formatTime,
  getDateTime,
} from "../utils/dateTimeUtils";
// import { updateInterval } from "../data/apidata/pauseResumeApi/pauseAndResumeApiData";
import { updateInterval } from "../data/offline/entity/DataTransfer";
import { toZonedTime, format } from "date-fns-tz";
import TaskProgress, {
  ProgressStatus,
  getCurrentTaskStatus,
  updateTaskProgressStatusFromExecDetails,
  updateTaskStatus,
} from "../data/localstorage/taskStatusStorage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCurrentLocation } from "../../src/data/providers/GeoLocationProvider";
import { getUserData } from "../data/apidata/taskApi/taskDataApi";
//import { updateInterval } from "../data/apidata/pauseResumeApi/pauseAndResumeApiData";
// import     PauseResumeButton from  '../../src/components/PauseResumeButton';
import {
  retrieveNetworkInitTimes,
  retrieveNetworkTasksExecutionDetails,
  retrieveNetworkTasksDetails,
} from "../data/offline/entity/DataRetriever";
import {
  submitTravelEndTime,
  submitTravelStartTime,
} from "../data/offline/entity/DataTransfer";
import FullScreenLoader from "../components/FullScreenLoader";
import FullScreenLoaderTask from "../components/FullScreenLoaderTask";
import CustomBackButton from "../components/CustomBackButton";
interface Pest {
  id: string;
  is_chemical_added: string | null;
  is_pest_found: string;
  pest_area: string;
  pest_photo: string;
  pest_report_type: string;
  pest_severity: string;
  service_name: string;
  sub_service_id: string;
  visit_id: string;
}

// Define the VisitExecutionDetails interface
interface VisitExecutionDetails {
  pests_found: Pest[];
  pests_found_image_path: string;
}
const TaskExecution: React.FC = () => {
  const [techniciansRequired, setTechniciansRequired] = useState<number | null>(
    null
  );

  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaveNextEnabled, setIsSaveNextEnabled] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<string | null>(null);
  const [isTravelStartEnable, setIsTravelStartEnable] = useState(false);
  const [travelStartTime, setTravelStartTime] = useState<string | null>(null);
  const [isTravelEndEnable, setIsTravelEndEnable] = useState(false);
  const [travelEndTime, setTravelEndTime] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [visitExecutionDetails, setVisitExecutionDetails] = useState<any>(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [nextButton, setNextButton] = useState<string>("SAVE & NEXT");
  const [nextButtonId, setNextButtonID] = useState<string>("SAVE & NEXT");
  const [nextButtonFunction, setNextButtonFunction] = useState<number>(0);
  const [showAttendanceAlert, setShowAttendanceAlert] = useState(false);

  const history = useHistory();
  const formatToUaeTime = (dateTime: any) => {
    const uaeTimeZone = "Asia/Dubai";
    const zonedTime = toZonedTime(dateTime, uaeTimeZone);
    return format(zonedTime, "yyyy-MM-dd HH:mm:ss");
  };
  const initTaskExecForm = async () => {
    const activeTaskData = JSON.parse(localStorage.getItem("activeTaskData")!);
    const initTimesData = await retrieveNetworkInitTimes(activeTaskData.id);
    console.log("Init Times in TestExec page: ", initTimesData);
    // setTaskProgress(getCurrentTaskStatus(activeTaskData.id));
    // Set Status based on task execution details from server
    const visitId = activeTaskData?.id; // Ensure visitId is available
    if (visitId) {
      let data = await fetchVisitExecutionDetails(visitId);
      setTaskProgress(updateTaskProgressStatusFromExecDetails(visitId, data));
      console.log("Task Progress from Task Exec Details :::::", taskProgress);
      console.log("updatedTask===============>", visitId);
      updateNextButton();
    } else {
      console.error("visitId is not available");
    }

    const taskInitTimes = initTimesData;
    setIsTravelStartEnable(true);
    setIsTravelEndEnable(true);

    for (let index = 0; index < taskInitTimes.length; index++) {
      const element = taskInitTimes[index];
      if (element.tracking_type === "Service Initiated") {
        setTaskStartTime(
          formatDate(element.date_time) + " " + formatTime(element.date_time)
        );
      } else if (element.tracking_type === "Start") {
        setIsTravelStartEnable(false);
        setTravelStartTime(
          formatDate(element.date_time) + " " + formatTime(element.date_time)
        );
        updateTaskStatus(activeTaskData.id, "travelStart", ProgressStatus.done);
      } else if (element.tracking_type === "Stop") {
        setIsTravelEndEnable(false);
        setTravelEndTime(
          formatDate(element.date_time) + " " + formatTime(element.date_time)
        );
        updateTaskStatus(activeTaskData.id, "travelEnd", ProgressStatus.done);
      }
    }
  };
  console.log("visitexecution details", visitExecutionDetails);

  const startTrackingTime = async () => {
    if (taskProgress?.teamAttendance === ProgressStatus.done) {
      setSubmitting(true)
      const currTime = getDateTime();
      setTravelStartTime(`${formatDate(formatToUaeTime(currTime))}  ${formatTime(formatToUaeTime(currTime))}`);

      setIsTravelStartEnable(false);

      try {
        const activeTaskData = JSON.parse(
          localStorage.getItem("activeTaskData")!
        );
        await submitTravelStartTime(
          activeTaskData.id,
          currTime,
          "Track Travel Time Start",
          "Start"
        );
        //updateTaskStatus(activeTaskData.id, "travelStart", ProgressStatus.done);
        let data = await fetchVisitExecutionDetails(visitId);
        setTaskProgress(updateTaskProgressStatusFromExecDetails(visitId, data));
        console.log("Task Progress from Task Exec Details :::::", taskProgress);

        // setTaskProgress(
        //   (prev) => prev && { ...prev, travelStart: ProgressStatus.done }
        // );
      } catch (error) {
        console.error("Error starting travel time:", error);
      } finally {
        setSubmitting(false); // Hide loader
      }
    }
  };

  const fetchTDetails = async (taskId: any) => {
    console.log("Going to fetch Task Details for task ID ::::", taskId);
    setLoading(true);
    try {
      const response = await retrieveNetworkTasksDetails(visitId); // Ensure taskId is passed correctly
      if (response) {
        console.log(
          "Fetched task details:------------------------------->",
          response
        );
        setTaskDetails(response); // Set the fetched data to state
        if (response.service_status === "Paused") {
          setIsPaused(true);
        } else {
          setIsPaused(false);
        }
      } else {
        console.error("Failed to fetch task details. Error:", response.message);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
    } finally {
      setLoading(false);
    }
  };

  const endTrackingTime = async () => {
    if (!isTravelStartEnable) {
      if (taskProgress?.teamAttendance === ProgressStatus.done) {
        setSubmitting(true)
        const currTime = getDateTime();
        setTravelEndTime(`${formatDate(formatToUaeTime(currTime))}  ${formatTime(formatToUaeTime(currTime))}`);

        setIsTravelEndEnable(false);


        try {
          const activeTaskData = JSON.parse(
            localStorage.getItem("activeTaskData")!
          );
          await submitTravelEndTime(
            activeTaskData.id,
            currTime,
            "Track Travel Time End",
            "Stop"
          );
          // updateTaskStatus(activeTaskData.id, "travelEnd", ProgressStatus.done);
          // setTaskProgress(
          //   (prev) => prev && { ...prev, travelEnd: ProgressStatus.done }
          // );

          let data = await fetchVisitExecutionDetails(visitId);
          setTaskProgress(updateTaskProgressStatusFromExecDetails(visitId, data));
          console.log("Task Progress from Task Exec Details :::::", taskProgress);
        } catch (error) {
          console.error("Error starting travel time:", error);
        } finally {
          setSubmitting(false); // Hide loader
        }
      }
    } else {
      toast.info("Please click 'Start Travel' before selecting 'End Travel'");
    }
  };

  const handleAlertConfirm = (data: any) => {
    const value = data.techniciancount;
    if (value) {
      localStorage.setItem("techniciansRequired", value.toString());
      setTechniciansRequired(value);
      setIsSaveNextEnabled(true);
      history.push("/availabletechnicians");
    } else {
      toast.error("Please enter number of technicians.");
    }
  };

  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);

  const fetchVisitExecutionDetails = async (visitId: string) => {
    try {
      const data = await retrieveNetworkTasksExecutionDetails(visitId);
      console.log("Data from retrvexecv2 = ", data);
      if (data) {
        console.log("Visit Execution Details ::", data);
        setVisitExecutionDetails(data);
        return data;
      } else {
        console.error(data.message);
        // toast.error("Server not responding. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Server not responding. Please try again later.");
    }
  };

  useEffect(() => {
    initTaskExecForm();
  }, []);
  const handleCancel = () => {
    const taskDataStr = localStorage.getItem("activeTaskData");
    if (!taskDataStr) {
      throw new Error("Task data is not available");
    }
    let activeTaskData = JSON.parse(taskDataStr);
    activeTaskData = [activeTaskData];
    const taskId = activeTaskData.id; // Assuming the task ID is in the first element

    // Navigate to task details page when Cancel button is clicked
    history.push(`/tasks/${taskId}`);
  };

  const visitId = activeTaskData.id;
  const [isPaused, setIsPaused] = useState(false);
  // Function to toggle tracking time
  const toggleTrackingTime = async () => {
    try {
      if (
        visitExecutionDetails?.pests_found?.some(
          (pest: Pest) => pest.is_chemical_added === null
        )
      ) {
        toast.info(
          "Before pausing, please add chemicals used for pest found details."
        );
        return;
      }
      if (
        taskProgress?.travelStart === ProgressStatus.done &&
        taskProgress?.travelEnd !== ProgressStatus.done
      ) {
        toast.info("Please end the travel before pausing the task");
        return;
      }
      if (taskProgress?.feedBack === ProgressStatus.done) {
        toast.info(
          "You cannot pause the task after providing feedback and follow-up."
        );
        return;
      }

      const data = await updateInterval(visitId, isPaused);

      const newIsPaused = !isPaused; // Toggle the paused state
      setIsPaused(newIsPaused);
      // if (newIsPaused) {
      //   toast.success("Task paused successfully");
      //   console.log("Interval paused successfully");
      // } else {
      //   toast.success("Task resumed successfully");
      //   console.log("Interval resumed successfully");
      // }
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Transaction failed, please try again.");
      console.error("Error updating interval:", error);
    }
  };

  console.log(visitExecutionDetails);
  console.log(taskProgress?.workDoneDetails);

  const clearSessionStorage = () => {
    localStorage.removeItem("feedbackFollowupFormData");
    localStorage.removeItem("recommDataArray");
    localStorage.removeItem("selectedChemicalItems");
    localStorage.removeItem("taskProgressStatus");
    localStorage.removeItem("workDataArray");
    localStorage.removeItem("techniciansRequired");
    localStorage.removeItem("selectedPestActIndForChem");
    localStorage.removeItem("selectedTechnicianData");
    localStorage.removeItem("activityUsageArray");
    localStorage.removeItem("1");
    localStorage.removeItem("pestFormData");
    localStorage.removeItem("pestFormDatas");
    localStorage.removeItem("multi");
    localStorage.removeItem("0");
    localStorage.removeItem(`pestFormData-${visitId}`);
    localStorage.removeItem(`activeChemicalUsed-${visitId}`);
    localStorage.removeItem(`activityUsageArray-${visitId}`);
    localStorage.removeItem("activeTaskData");
  };

  useEffect(() => {
    if (visitId) {
      fetchTDetails(visitId); // Call the API function when taskId changes
    }
  }, [visitId]);

  const handleSaveSubmit = () => {
    swal({
      title: '"Are you Sure?"',
      text: "Are you sure you want to submit the Task",
      buttons: ["Cancel", "Submit"],
    }).then((willsubmit: any) => {
      if (willsubmit) {
        swal("Task is Completed!", { icon: "success" });
        clearSessionStorage();
        history.push("/dashboard");
      }
    });
  };

  useEffect(() => {
    setIsSaveNextEnabled(taskProgress?.feedBack === 1);
    updateNextButton();
  }, [taskProgress]);

  const updateNextButton = async () => {
    //const eee = await updateTaskProgressStatusFromExecDetails(visitId, taskDetails);
    console.log(taskProgress);
    // setLoading(true); // Start loading
    if (taskProgress?.teamAttendance === -1) {
      setNextButton("NEXT");
      setShowAttendanceAlert(true);
      setNextButtonFunction(1);
    } else if (taskProgress?.teamAttendance === 1 && (taskProgress?.travelStart === -1 && taskProgress?.travelEnd === -1)) {
      setNextButtonFunction(2);
      setNextButton("Start Travel");
    } else if (taskProgress?.teamAttendance === 1 && (taskProgress?.travelStart === 1 && taskProgress?.travelEnd === -1)) {
      setNextButtonFunction(3);
      setNextButton("End Travel");
    } else if (taskProgress?.teamAttendance === 1 && (taskProgress?.travelStart === 1 && taskProgress?.travelEnd === 1) && taskProgress?.pestActivityDiscov === -1) {
      setNextButtonFunction(4);
      setNextButton("NEXT");
    } else if (taskProgress?.teamAttendance === 1 && (taskProgress?.travelStart === 1 && taskProgress?.travelEnd === 1) && taskProgress?.pestActivityDiscov === 1 && (taskProgress?.chemicalsUsed === -1 || taskProgress?.chemicalsUsed === 0)) {
      setNextButtonFunction(5);
      setNextButton("NEXT");
    } else if (taskProgress?.teamAttendance === 1 && (taskProgress?.travelStart === 1 && taskProgress?.travelEnd === 1) && taskProgress?.pestActivityDiscov === 1 && taskProgress?.chemicalsUsed === 1 && taskProgress?.recommGiven === -1) {
      setNextButtonFunction(6);
      setNextButton("NEXT");
    } else if (taskProgress?.teamAttendance === 1 && (taskProgress?.travelStart === 1 && taskProgress?.travelEnd === 1) && taskProgress?.pestActivityDiscov === 1 && taskProgress?.chemicalsUsed === 1 && taskProgress?.recommGiven === 1 && taskProgress?.workDoneDetails === -1) {
      setNextButtonFunction(7);
      setNextButton("NEXT");
    } else if (taskProgress?.teamAttendance === 1 && (taskProgress?.travelStart === 1 && taskProgress?.travelEnd === 1) && taskProgress?.pestActivityDiscov === 1 && taskProgress?.chemicalsUsed === 1 && taskProgress?.recommGiven === 1 && taskProgress?.workDoneDetails === 1 && taskProgress?.feedBack === -1) {
      setNextButtonFunction(8);
      setNextButton("FEEDBACK");
    } else {
      setNextButtonFunction(9);
      setNextButton("SUBMIT");

    }
  };
  const handleBackClick = () => {
    history.push('/tasks'); // Go back to the previous page or default backToPath
  };
  const handleNextSubmit = () => {
    switch (nextButtonFunction) {
      case 0:
        console.log('case 0');
        break;
      case 1:
        if (taskProgress?.teamAttendance !== 1 && !(taskProgress?.teamAttendance === -1 && isPaused)) {
          setShowAttendanceAlert(true);
        }
        //history.push("/teamattendance/:techniciansRequired");
        break;
      case 2:
        startTrackingTime();
        setNextButtonFunction(3);
        setNextButton("End Travel");
        break;
      case 3:
        endTrackingTime();
        setNextButtonFunction(4);
        setNextButton("NEXT");
        break;
      case 4:
        if (isPaused) {
          toast.info("Please resume the task to perform the action");
        } else if (
          visitExecutionDetails?.pests_found?.some(
            (pest: Pest) => pest.is_chemical_added === null
          )
        ) {
          toast.info("Please add chemicals for previous pest found");
        } else if (
          taskProgress?.travelStart === ProgressStatus.done &&
          taskProgress?.travelEnd === ProgressStatus.done &&
          taskProgress?.recommGiven !== ProgressStatus.done &&
          !isPaused &&
          visitExecutionDetails?.pests_found?.every(
            (pest: Pest) => pest.is_chemical_added !== null
          )
        ) {
          history.push("/PestActivityFound");
        }
        break;
      case 5:
        console.log(taskProgress);
        if (taskProgress?.chemicalsUsed === -1 && isPaused) {
          toast.info("Please resume the task to perform the action");
        } else if (
          taskProgress?.recommGiven === ProgressStatus.done &&
          taskProgress?.chemicalsUsed !== ProgressStatus.done &&
          !(taskProgress?.chemicalsUsed === -1 && isPaused) &&
          visitExecutionDetails.pests_found.some(
            (pest: Pest) => pest.is_chemical_added === null
          )
        ) {
          history.push("/chemicalUsed");
        } else if (
          taskProgress?.recommGiven !== ProgressStatus.done &&
          taskProgress?.chemicalsUsed === ProgressStatus.inprogress &&
          visitExecutionDetails.pests_found.some(
            (pest: Pest) => pest.is_chemical_added === null
          )
        ) {
          history.push("/chemicalUsed");
        }
        break;
      case 6:
        if (taskProgress?.recommGiven === -1 && isPaused) {
          toast.info("Please resume the task to perform the action");
        } else if (visitExecutionDetails?.pests_found?.length === 0) {
          toast.info(
            "No pests found. Please add pests before proceeding to Recommendations."
          );
        } else if (
          visitExecutionDetails.pests_found.some(
            (pest: Pest) => pest.is_chemical_added === null
          )
        ) {
          toast.info(
            "Please add chemicals for pests before proceeding to Recommendations."
          );
        } else if (
          taskProgress?.pestActivityDiscov === ProgressStatus.done &&
          taskProgress?.chemicalsUsed === ProgressStatus.done &&
          taskProgress?.recommGiven !== ProgressStatus.done &&
          !(isPaused && taskProgress?.recommGiven === -1) &&
          visitExecutionDetails?.pests_found?.length! > 0 && // Ensure pests_found has items
          !visitExecutionDetails.pests_found.some(
            (pest: Pest) => pest.is_chemical_added === null
          )
        ) {
          history.push("/Recommendations");
        }

        break;
      case 7:

        if (taskProgress?.workDoneDetails === -1 && isPaused) {
          toast.info("Please resume the task to perform the action");
        } else if (
          taskProgress?.recommGiven === ProgressStatus.done &&
          taskProgress?.workDoneDetails !== ProgressStatus.done &&
          !(isPaused && taskProgress?.workDoneDetails === -1)
        ) {
          history.push("/WorkDoneDetails");
        }

        break;
      case 8:
        if (taskProgress?.feedBack === -1 && isPaused) {
          toast.info("Please resume the task to perform the action");
        } else if (
          taskProgress?.workDoneDetails === ProgressStatus.done &&
          taskProgress?.feedBack != ProgressStatus.done &&
          !(taskProgress?.feedBack === -1 && isPaused)
        ) {
          history.push("/FeedbackFollowup");
        }
        break;
      case 9:
        handleSaveSubmit();
        break;
      default:
        console.log('Default');;
    }
  };
  return (
    <>
      <ToastContainer />
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonButton onClick={handleBackClick} >
              <CustomBackButton />
            </IonButton>
          </IonButtons>
          <IonTitle className="ion-float-start" >Task Execution</IonTitle>
          <div className="ion-float-end headerBts">
            <IonButton
              shape="round"
              color="secondary"
              onClick={toggleTrackingTime}
            >
              <IonImg
                src={
                  isPaused
                    ? "/assets/images/resume-icon.svg"
                    : "/assets/images/pause-icon.svg"
                }
              ></IonImg>
            </IonButton>
            <IonButton
              shape="round"
              routerLink={"/tasks/" + activeTaskData.id}
            >
              <IonImg src="/assets/images/task-details-icon.svg"></IonImg>
            </IonButton>
            <IonButton shape="round" routerLink="/TaskPreview">
              <IonImg src="/assets/images/preview-icon.svg"></IonImg>
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ionContentColor taskExecutionWrapp">
        <div className="ionPaddingBottom task-container">
          <IonList className="ion-list-item executionTopHeading ion-padding">
            <IonItem lines="none">
              <IonThumbnail slot="start" class="thumbnailIcon">
                <IonImg src="/assets/images/location-icon.svg"></IonImg>
              </IonThumbnail>
              <div>
                <IonText>
                  <h3>{activeTaskData.service_name}</h3>
                  <h2>{activeTaskData.address}</h2>
                  <p>
                    {
                      formatDate(activeTaskData.created_on) +
                      " " +
                      formatTime(activeTaskData.created_on)
                    }
                  </p>
                </IonText>
                <IonText className="priorityText">
                  <h6 className="borderRight">Priority : <span className="highColor"> {activeTaskData.priority} </span></h6>   <h6 className="borderRight"> {activeTaskData.distance} </h6>
                  <h6>Status : <span className='' style={{ color: "#16BAC2" }}> {activeTaskData.service_status} </span></h6>
                </IonText>
              </div>
            </IonItem>
          </IonList>

          <div className="ion-padding-horizontal serviceRequestStatus">
            <IonText>
              <h1>Service Request Status</h1>
            </IonText>
            <IonAlert className="techniciansNumAlert"
              isOpen={showAttendanceAlert}

              header="Total number of technicians required"
              buttons={[
                {
                  text: "Ok",
                  handler: handleAlertConfirm,
                  cssClass: 'alert-button-confirm',
                },
              ]}
              inputs={[
                {
                  name: "techniciancount",
                  type: "number",
                  placeholder: "Enter the number",
                  min: 1,
                  max: 100,
                },
              ]}
            ></IonAlert>
            <IonCard className="card card-active">
              <h3>Service Request is Started</h3>
              <h6>{taskStartTime}</h6>
            </IonCard>
            <IonCard
              className={
                taskProgress?.teamAttendance === -1
                  ? "card"
                  : taskProgress?.teamAttendance === 1
                    ? "card card-active"
                    : "card"
              }
              onClick={() => {
                if (taskProgress?.teamAttendance === -1 && isPaused) {
                  toast.info(
                    "Please resume the task to perform the action"
                  );
                }
              }}
              id="present-alert"
            >
              <h3>Team Attendance</h3>
            </IonCard>
            <IonCard
              className={
                taskProgress?.travelStart === -1 &&
                  taskProgress?.travelEnd === -1
                  ? "card"
                  : taskProgress?.travelStart === 1 &&
                    taskProgress?.travelEnd === 1
                    ? "card card-active"
                    : "card card-active"
              }
            >
              <h3>Track Travel Time</h3>
              {!isTravelStartEnable ? (
                <h6>Start Time: {travelStartTime}</h6>
              ) : (
                <></>
              )}
              {isTravelEndEnable ? (
                <></>
              ) : (
                <h6>End Time: {travelEndTime}</h6>
              )}
            </IonCard>
            <IonCard
              className={
                taskProgress?.pestActivityDiscov === -1
                  ? "card"
                  : taskProgress?.pestActivityDiscov === 1 &&
                    taskProgress?.recommGiven === ProgressStatus.done
                    ? "card card-active"
                    : taskProgress?.pestActivityDiscov === 1 &&
                      taskProgress?.recommGiven !== ProgressStatus.done ? "card card-semi-active"
                      : "card"
              }
              onClick={() => {
                console.log("onClick triggered for PestActivityFound");
                if (isPaused) {
                  toast.info("Please resume the task to perform the action");
                } else if (
                  visitExecutionDetails?.pests_found?.some(
                    (pest: Pest) => pest.is_chemical_added === null
                  )
                ) {
                  toast.info("Please add chemicals for previous pest found");
                } else if (
                  taskProgress?.travelStart === ProgressStatus.done &&
                  taskProgress?.travelEnd === ProgressStatus.done &&
                  taskProgress?.recommGiven !== ProgressStatus.done &&
                  !isPaused &&
                  visitExecutionDetails?.pests_found?.every(
                    (pest: Pest) => pest.is_chemical_added !== null
                  )
                ) {
                  history.push("/PestActivityFound");
                }
              }}
            >
              <h3>Pest Activity Found Details</h3>
              <h6>House Flies, House Mice</h6>
            </IonCard>
            <IonCard
              className={
                taskProgress?.chemicalsUsed === -1
                  ? "card"
                  : taskProgress?.chemicalsUsed === 1 &&
                    taskProgress?.recommGiven === ProgressStatus.done
                    ? "card card-active"
                    : (taskProgress?.chemicalsUsed === 1 || taskProgress?.chemicalsUsed === ProgressStatus.inprogress) &&
                      taskProgress?.recommGiven !== ProgressStatus.done ? "card card-semi-active"
                      : "card"
              }
              onClick={() => {
                console.log("onClick triggered for ChemicalUsed");
                if (taskProgress?.chemicalsUsed === -1 && isPaused) {
                  toast.info("Please resume the task to perform the action");
                } else if (
                  taskProgress?.recommGiven === ProgressStatus.done &&
                  taskProgress?.chemicalsUsed !== ProgressStatus.done &&
                  !(taskProgress?.chemicalsUsed === -1 && isPaused) &&
                  visitExecutionDetails?.pests_found?.some(
                    (pest: Pest) => pest.is_chemical_added === null
                  )
                ) {
                  history.push("/chemicalUsed");
                } else if (
                  taskProgress?.recommGiven !== ProgressStatus.done &&
                  taskProgress?.chemicalsUsed === ProgressStatus.inprogress &&
                  visitExecutionDetails.pests_found.some(
                    (pest: Pest) => pest.is_chemical_added === null
                  )
                ) {
                  history.push("/chemicalUsed");
                }
              }}
            >
              <h3>Chemical Used</h3>
              <h6>Advion Ant Gel, Ant Bait Station … View Details</h6>
            </IonCard>
            <IonCard
              className={
                taskProgress?.recommGiven === -1
                  ? "card"
                  : taskProgress?.recommGiven === 1
                    ? "card card-active"
                    : "card"
              }
              onClick={() => {
                if (taskProgress?.recommGiven === -1 && isPaused) {
                  toast.info("Please resume the task to perform the action");
                } else if (visitExecutionDetails?.pests_found?.length === 0) {
                  toast.info(
                    "No pests found. Please add pests before proceeding to Recommendations."
                  );
                } else if (
                  visitExecutionDetails.pests_found.some(
                    (pest: Pest) => pest.is_chemical_added === null
                  )
                ) {
                  toast.info(
                    "Please add chemicals for pests before proceeding to Recommendations."
                  );
                } else if (
                  taskProgress?.pestActivityDiscov === ProgressStatus.done &&
                  taskProgress?.chemicalsUsed === ProgressStatus.done &&
                  taskProgress?.recommGiven !== ProgressStatus.done &&
                  !(isPaused && taskProgress?.recommGiven === -1) &&
                  visitExecutionDetails?.pests_found?.length! > 0 && // Ensure pests_found has items
                  !visitExecutionDetails.pests_found.some(
                    (pest: Pest) => pest.is_chemical_added === null
                  )
                ) {
                  history.push("/Recommendations");
                }
              }}
            >
              <h3>Recommendations</h3>
              <h6>Keep the manholes close after the treatment</h6>
            </IonCard>
            <IonCard
              className={
                taskProgress?.workDoneDetails === -1
                  ? "card"
                  : taskProgress?.workDoneDetails === 1
                    ? "card card-active"
                    : "card"
              }
              onClick={() => {
                if (taskProgress?.workDoneDetails === -1 && isPaused) {
                  toast.info("Please resume the task to perform the action");
                } else if (
                  taskProgress?.recommGiven === ProgressStatus.done &&
                  taskProgress?.workDoneDetails !== ProgressStatus.done &&
                  !(isPaused && taskProgress?.workDoneDetails === -1)
                ) {
                  history.push("/WorkDoneDetails");
                }
              }}
            >
              <h3>Work Done Details</h3>
            </IonCard>
            <IonCard
              className={
                taskProgress?.feedBack === -1
                  ? "card"
                  : taskProgress?.feedBack === 1
                    ? "card card-active"
                    : "card"
              }
              onClick={() => {
                if (taskProgress?.feedBack === -1 && isPaused) {
                  toast.info("Please resume the task to perform the action");
                } else if (
                  taskProgress?.workDoneDetails === ProgressStatus.done &&
                  taskProgress?.feedBack != ProgressStatus.done &&
                  !(taskProgress?.feedBack === -1 && isPaused)
                ) {
                  history.push("/FeedbackFollowup");
                }
              }}
            >
              <h3>Feedback And Follow-up</h3>
              <h6>Very Good</h6>
            </IonCard>

          </div>
        </div>
        <FullScreenLoader isLoading={submitting} />
        <FullScreenLoaderTask isLoading={loading} />
      </IonContent>
      <IonFooter className="ion-footer">
        <IonToolbar className="ionFooterTwoButtons">
          <IonButton
            className="ion-button"
            fill="outline"
            color="medium"
            onClick={handleCancel}
          >
            Cancel
          </IonButton>
          <IonButton
            className="ion-button"

            color="primary"
            onClick={handleNextSubmit}
          >
            {nextButton}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
};

export default TaskExecution;
