import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonContent,
  IonText,
  IonThumbnail,
  IonImg,
  IonToolbar,
  IonIcon,
  IonHeader,
  IonButtons,
  IonTitle,
  IonFooter,
  IonSelect,
  IonSelectOption,
  IonLabel,
} from "@ionic/react";
import { pencil, arrowBack } from "ionicons/icons";
import { useHistory } from "react-router";
import AvatarImage from "../../public/assets/images/avatar_image.svg";
import ChangePasswordForm from "../components/ChangePassword";
import { useAuth } from "../components/AuthContext";
import EnvironmentRibbon from "../components/EnvironmentRibbon";
import i18n from "../i18n";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const isProd: any = import.meta.env.PROD;

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const { logout } = useAuth();
  const [avatar, setAvatar] = useState<string>(AvatarImage);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const app_version: any = localStorage.getItem('app_version');
  const app_name: any = localStorage.getItem('app_name');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(localStorage.getItem('language') || 'en');


  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserData(userData);
      if (userData.avatar) {
        setAvatar(userData.avatar);
      }
    }
  }, []);

  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };
  const toggleChangePasswordForm = () => {
    setShowChangePasswordForm((prev) => !prev);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseChangePasswordForm = () => {
    setShowChangePasswordForm(false);
  };

  const handleLogout = async () => {
    const response = await logout();
    console.log("Logout Response", response);
    if (response && response.data.status == 200 && response.data.success) {
      history.push('/login');
    }
  };
  const changeLanguage = (lng: any) => {
    localStorage.setItem('language', lng);
    setSelectedLanguage(lng);
    //loadLanguageData(lng);
    i18n.changeLanguage(lng);
  };

  return (
    <>
      {!isProd && <EnvironmentRibbon position="ribbon top-right" />}
      <IonHeader className="ion-no-border ion-padding-horizontal">
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonButton fill="clear" onClick={goBack} slot="start">
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>




      <IonContent fullscreen className="ionContentColor profileWrapp">

        <div style={{ paddingBottom: "16px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              <IonThumbnail
                style={{
                  margin: "auto",
                  "--size": "90px",
                  "--border-radius": "100%",
                  marginTop: "30px",
                  border: "solid 6px rgba(255, 255, 255, 0.63)",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <IonImg
                  alt="user"
                  src={avatar}
                  style={{ borderRadius: "50%" }}
                ></IonImg>
                {/* <IonIcon
                  icon={pencil}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "white",
                    borderRadius: "50%",
                    padding: "5px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                  onClick={() =>
                    document.getElementById("avatarInput")?.click()
                  }
                /> */}
              </IonThumbnail>
              <input
                type="file"
                id="avatarInput"
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {userData && (
            <IonText>
              <h1
                style={{
                  fontWeight: 700,
                  fontSize: "2rem",
                  textAlign: "center",
                }}
              >
                {userData.first_name} {userData.last_name}
              </h1>
              <h6
                style={{
                  fontWeight: 400,
                  fontSize: "25px",
                  textAlign: "center",
                }}
              >
                {userData.role_name}
              </h6>
            </IonText>
          )}
          <div style={{
            borderRadius: "1px",
            fontWeight: 600,
            marginLeft: "40px",
            marginRight: "40px",
            marginTop: "40px",
          }}>
            <IonLabel className="ion-label">App Language</IonLabel>
            <IonSelect
              className="custom-form-control"
              placeholder="Select Priority"
              value={selectedLanguage}
              onIonChange={(e) => {
                const selectedValue = e.detail.value;
                changeLanguage(selectedValue);
              }}
            >
              <IonSelectOption value="en">English</IonSelectOption>
              <IonSelectOption value="es">Spain</IonSelectOption>
              <IonSelectOption value="ar">Arabic</IonSelectOption>
            </IonSelect>
          </div>

          {!showChangePasswordForm && (
            <>
              <IonButton
                type="button"
                style={{
                  borderRadius: "1px",
                  fontWeight: 600,
                  marginLeft: "40px",
                  marginRight: "40px",
                  marginTop: "40px",
                  marginBottom: showChangePasswordForm ? "0px" : "40px",
                }}
                color="primary"
                fill="solid"
                expand="block"
                onClick={toggleChangePasswordForm}
                disabled={showChangePasswordForm}
              >
                CHANGE PASSWORD
              </IonButton>
              <IonButton
                type="button"
                style={{
                  borderRadius: "1px",
                  fontWeight: 600,
                  marginLeft: "40px",
                  marginRight: "40px",
                  marginTop: "40px",
                  marginBottom: "40px",
                }}
                color="secondary"

                expand="block"
                onClick={handleLogout}
              >
                LOGOUT
              </IonButton>
            </>
          )}
          {showChangePasswordForm && (
            <ChangePasswordForm onClose={handleCloseChangePasswordForm} />
          )}
        </div>
      </IonContent>
      <IonFooter className="ion-footer">
        <IonText className='loginVersionAbsolute'>
          <p>App Version &nbsp;{app_version}</p>
        </IonText>
      </IonFooter>
    </>
  );
};

export default Profile;
