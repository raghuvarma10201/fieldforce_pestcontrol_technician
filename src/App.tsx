import {
  Redirect,
  BrowserRouter as Router,
  Route,
  Switch,
} from "react-router-dom";
import { useHistory } from "react-router-dom";

import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./global.scss";
import Login from "./pages/authentication/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import TeamAttendance from "./pages/TeamAttendance";
import AvailableTechnicians from "./pages/AvailableTechnicians";
import TaskExecution from "./pages/TaskExecution";
import PestActivityFound from "./pages/PestActivityFound";

import Recommendations from "./pages/Recommendations";
import ChemicalUsed from "./pages/ChemicalUsed";
import WorkDoneDetails from "./pages/WorkDoneDetails";
import FeedbackFollowup from "./pages/FeedbackFollowup";
import ChemicalUsedDetails from "./pages/ChemicalUsedDetails";
import Site from "./pages/Site";
import SiteViewLocation from "./pages/SiteViewLocation";
import TaskReschedule from "./pages/TaskReschedule";
import MaterialList from "./pages/MaterialList";
import TaskPreview from "./pages/TaskPreview";
import Notification from "./pages/Notification";
import Preview from "./pages/Notification";
import Profile from "./pages/Profile";
import LeaveRequestList from "./pages/leaves/LeaveRequestList";
import ApplyLeave from "./pages/leaves/ApplyLeave";

import { useEffect, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { getCurrentLocation } from "./data/providers/GeoLocationProvider";
// import { IonButton, IonLoading, IonToast } from '@ionic/react';
import { postDataToLocationTracking } from "./data/apidata/authApi/dataApi";
import ChangePasswordForm from "./components/ChangePassword";
import Forms from "./pages/Forms";
import FormData from "./pages/FormData";
import "./pages/Unthorized";
import { navigate } from "ionicons/icons";
import RedirectPage from "./pages/RedirectPage";
import { registerPushHandlers } from "./utils/pushNotiications";
import CreateTask from "./pages/CreateTask";

import StockTransfer from "./pages/StockTransfer";
import StockTransferredReceived from "./pages/StockTransferredReceived";
import StockTransferredDetails from "./pages/StockTransferDetails";
import PestActivityFoundPreview from "../src/pages/PestActivityFoundPreview";
import ChemicalUsedPreview from "../src/pages/ChemicalUsedPreview";
import { AuthProvider } from "./components/AuthContext";
import AuthGuard from "./components/AuthGuard";

setupIonicReact();
const getUserId = () => {
  const userDataString = localStorage.getItem("userData");
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    return userData.user_id;
  }
  throw new Error("User ID not available in session storage");
};

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [position, setPosition] = useState<any>();
  const history = useHistory();

  const checkIfLoggedIn = () => {
    const userDataString = localStorage.getItem("userData");

    if (userDataString && userDataString !== undefined) {
      const parsedData = JSON.parse(userDataString);
      return !!parsedData.api_token;
    }
    return false;
  };

  const pollLocation = async () => {
    try {
      const actTaskDataString = localStorage.getItem("activeTaskData");
      let actTaskId = "";
      if (actTaskDataString) {
        let actTaskData = JSON.parse(actTaskDataString);
        console.log("Poll - act task data = ", actTaskData);
        if (actTaskData && actTaskData.id) {
          actTaskId = actTaskData.id; // Accessing the id directly
        }
      }
      const position = await getCurrentLocation();
      if (position) {
        const userId = getUserId();
        console.log("Geolocation fetched for polling:", position.coords);
        setPosition(position);
        await postDataToLocationTracking(
          position.coords.latitude,
          position.coords.longitude,
          actTaskId // Active Task ID should be passed here if available
        );
      }
    } catch (e) {
      setError("Geolocation Error or user not logged in.");
    }
  };

  useEffect(() => {
    registerPushHandlers();

    console.log("Checking User session");
    const checkInFlag = localStorage.getItem("checkInFlag");

    if (checkIfLoggedIn()) {
      pollLocation(); // Fetch geolocation immediately
      const geolocationInterval = setInterval(pollLocation, 60000); // Fetch geolocation every 1 minute
      // User Logged in Navigate to Home or Technician Dashboard
      console.log("User session valid");
      // Clear intervals on component unmount
      return () => {
        clearInterval(geolocationInterval);
      };
    } else {
      console.log("User session NOT valid. DO NOT POLL Location.");
    }
  }, []);

  return (
    <IonApp>
      <ToastContainer />
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/">
                <Redirect to="/redirectpage" />
              </Route>
              <Route path="/redirectpage" component={RedirectPage} />
              <Route path="/login" component={Login} />


              <AuthGuard path="/home" component={Home} />
              <AuthGuard path="/ChemicalUsedPreview" component={ChemicalUsedPreview} />
              <AuthGuard path="/pestActivityfoundpreview" component={PestActivityFoundPreview} />
              <AuthGuard path="/dashboard" component={Dashboard} />
              <AuthGuard path="/MaterialList" component={MaterialList} />
              <AuthGuard path="/tasks" component={Tasks} />
              <AuthGuard path="/task/:taskId" component={TaskDetails} />
              <AuthGuard path="/formdata/:taskId" component={FormData} />
              <AuthGuard path="/taskreschedule" component={TaskReschedule} />
              <AuthGuard path="/taskexecution" component={TaskExecution} />
              <AuthGuard path="/taskpreview" component={TaskPreview} />
              <AuthGuard path="/teamattendance/:techniciansRequired" component={TeamAttendance} />
              <AuthGuard path="/availabletechnicians" component={AvailableTechnicians} />
              <AuthGuard path="/pestactivityfound" component={PestActivityFound} />
              <AuthGuard path="/recommendations" component={Recommendations} />
              <AuthGuard path="/chemicalused" component={ChemicalUsed} />
              <AuthGuard path="/chemicaluseddetails" component={ChemicalUsedDetails} />
              <AuthGuard path="/workdonedetails" component={WorkDoneDetails} />
              <AuthGuard path="/feedbackfollowup" component={FeedbackFollowup} />
              <AuthGuard path="/siteviewlocation/:taskId" component={SiteViewLocation} />
              <AuthGuard path="/notification" component={Notification} />
              <AuthGuard path="/preview" component={Preview} />
              <AuthGuard path="/profile" component={Profile} />
              <AuthGuard path="/leaverequestlist" component={LeaveRequestList} />
              <AuthGuard path="/applyleave" component={ApplyLeave} />
              <AuthGuard path="/createTask" component={CreateTask} />
              <AuthGuard path="/stocktransferreddetails/:id" component={StockTransferredDetails} />
              <AuthGuard path="/stocktransferredreceived" component={StockTransferredReceived} />
              <AuthGuard path="/stocktransfer" component={StockTransfer} />
              <AuthGuard path="/forms" component={Forms} />
              <AuthGuard path="/changePassword" component={ChangePasswordForm} />
              
            </Switch>
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
