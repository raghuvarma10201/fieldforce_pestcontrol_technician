import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonPage,
  IonRow,
  IonText,
  IonThumbnail,
  IonImg,
  IonLoading,
  IonAlert,
  IonIcon,
  IonItem ,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router";
import CustomAlert from "../components/CustomAlert";
import NetworkCheckTime from "./NetworkCheckTime";
import AvatarImage from "../../public/assets/images/avatar_image.svg";
import { userCheckIn } from "../data/apidata/authApi/dataApi";
import Db from "../data/offline/entity/Db"; // Import allFunction from Db
import { syncPush } from "../data/offline/entity/sync-push";
import { ellipse } from "ionicons/icons";
import {toast} from "react-toastify";
import NotificationLength from "../components/NotificationLength";
// import {getTaskListByStatus} from '../data/offline/entity/DataRetriever';
//  import {taskListFetcher} from "../data/offline/entity/DataRetriever";
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation<{ showAlert: boolean }>();
  const [showAlert, setShowAlert] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // State for loading spinner
  const [checkloading, setCheckLoading] = useState<boolean>(false); // State for loading spinner
  const [taskList, setTaskList] = useState<[]>([]);
  const [showSyncAlert, setShowSyncAlert] = useState(false);
  const app_version: any = localStorage.getItem('app_version');
  const app_name: any = localStorage.getItem('app_name');

  const [languageData, setLanguageData] = useState<any>(null);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en'); // Default to English

  const isProd: any = import.meta.env.PROD;
  
  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserData(userData);
    }

    if (location.state?.showAlert) {
      setShowAlert(true);
    }

    const checkInFlag = localStorage.getItem("checkInFlag");
    if (checkInFlag) {
      console.log("Check-in flag found:", checkInFlag);
    }
  }, [location.state]);

  // Function to load language data from the REST API

  useEffect(() => {
    const fetchTasks = async () => {
      // await taskListFetcher();
    };
    // fetchTasks();
  }, []);
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const handleCheckIn = async () => {
    try {
      setCheckLoading(true);
      const response= await userCheckIn();
      
      if (response) {
        if (response.is_chemicals_required) {
          setLoading(false);
          setShowAlert(true);
        } else {
          localStorage.setItem("checkInFlag", "true");
          setLoading(false);
          history.push("/dashboard");
        }
      } else {
        setCheckLoading(false);
        setError(response.message);
        if (response.is_chemicals_required) {
          setShowAlert(true);
        }
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      setError("An unexpected error occurred");
      toast.error('Server not responding. Please try again later.');
    }
  };

  const handleSyncClick = async () => {
    setShowSyncAlert(true); // Show the confirmation alert
  };

  const handleConfirmSync = async (confirm: boolean) => {
    if (confirm) {
      setLoading(true);
      try {
        await syncPush();
      } catch (error) {
        console.error("Sync failed:", error);
        toast.error('Server not responding. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    setShowSyncAlert(false); // Hide the alert
  };

  const handleNavigateToList = () => {
    history.push({
      pathname: "/MaterialList",
      state: { showAlert: true },
    });
  };

  const alertButtons = [
    {
      text: "Close",
      cssClass: "alert-button-cancel",
      role: "close",
      handler: () => handleCloseAlert(),
    },
    {
      text: "Collected",
      handler: async () => {
        try {
          const { response, data } = await userCheckIn();
          if (response.ok) {
            localStorage.setItem("checkInFlag", "true");
            history.push("/dashboard");
          } else {
            if (data.message === "Attendance already captured") {
              history.push("/dashboard");
            }
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error('Server not responding. Please try again later.');
        } finally {
          handleCloseAlert();
        }
      },
      cssClass: "alert-button-confirm",
    },
  ];
  const handleNotificationClick = () => {
    history.push("/notification");
  };


  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("checkInFlag");
    history.push("/login");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-home-content">
          <div className="homeHeader">
            <IonItem lines="none">
              <IonImg className="logoMd ion-float-start" src="assets/images/logo-sm-white.svg"/>
                  <div className="headerBts" slot="end">
                        <NotificationLength/>
                        <IonButton shape="round" routerLink={"/profile"}>
                          <IonImg src="assets/images/account-user.svg" />
                        </IonButton>
                  </div>
                </IonItem>

                    <div className="userHomeDetails IonText-center ">
                      <IonItem lines="none">
                          <IonThumbnail slot="start">
                            <IonImg
                              alt="user"
                              className="defaultUserImg"
                              src={userData?.avatar || AvatarImage}
                            />
                          </IonThumbnail>
                          <div>
                          {userData && (
                            <IonText>
                              <h5>{t('welcome_text')}</h5>
                              <h1>
                                {userData.first_name} {userData.last_name}
                              </h1>
                              <h6>{userData.role_name}</h6>
                            </IonText>
                          )}
                          </div>
                          </IonItem>
                    </div>
            </div>

        <div className="homeWrapp ion-padding-horizontal">
    

          <div className="homeList">
            <IonRow>
              <IonCol size="4">
                <IonCard onClick={handleCheckIn}>
                <IonText>{t('check_in')}</IonText>
                  <IonImg src="assets/images/checkin-icon.svg" />
                
                </IonCard>
              </IonCol>

              {/* <IonCol size="4">
                <IonCard> */}
                  {/* <IonImg src="assets/images/sync-icon.svg" /> */}
                  {/* <IonText>Synk</IonText> */}
                  {/* <Db /> */}
                  {/* <IonText onClick={()=>GetTaskListByStatus("true")}>getTaskListByStatus</IonText> */}
                {/* </IonCard>
              </IonCol> */}
{/* 
              <IonCol size="4">
                <IonCard onClick={handleSyncClick}>
                <IonText>Sync Up</IonText>
                  <IonImg src="assets/images/sync-icon.svg" />
                 
                </IonCard>
              </IonCol> */}

              <IonCol size="4">
                <IonCard routerLink={"/LeaveRequestList"}>
                <IonText>{t('apply_leave')}</IonText>
                  <IonImg src="assets/images/apply-leave-icon.svg" />
                 
                </IonCard>
              </IonCol>
              <IonCol
                size="4"
              >
                <IonCard className="ion-nomargin" routerLink={"/stocktransfer"}>
                <IonText>{t('stock_transfer')}</IonText>
                  <IonImg src="assets/images/stock-transfer-home-icon.svg"></IonImg>
                 
                </IonCard>
              </IonCol>

              <IonCol
                size="4"
              >
                <IonCard className="ion-nomargin logOutCard" onClick={handleLogout}>
                <IonText>{t('logout')}</IonText>
                  <IonImg src="assets/images/logout-icon.svg"></IonImg>
                 
                </IonCard>
              </IonCol>
            </IonRow>
          </div>

          <IonText className="networkCheck">
            <NetworkCheckTime />
          </IonText>

      
        </div>
      </IonContent>
      <CustomAlert
        isOpen={showAlert}
        subHeader="Please collect insufficient materials at the warehouse today."
        message="click here to see the list"
        buttons={alertButtons}
        onClose={handleCloseAlert}
        onMessageClick={handleNavigateToList}
      />
      <IonLoading
        isOpen={loading}
        message={"Syncing up data to server..."}
        spinner="crescent"
      />
      <IonLoading
        isOpen={checkloading}
        message={"loading..."}
        spinner="crescent"
      />
      <IonAlert
        isOpen={showSyncAlert}
        onDidDismiss={() => setShowSyncAlert(false)}
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
              handleConfirmSync(true), setShowSyncAlert(false);
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default Home;
