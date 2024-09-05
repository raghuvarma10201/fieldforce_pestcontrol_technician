import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonRouterLink,
  IonBadge,
  IonIcon,
  IonProgressBar,
} from "@ionic/react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { userCheckIn, userCheckIns } from "../../data/apidata/authApi/dataApi";
import "react-toastify/dist/ReactToastify.css";
import { registerDevice } from "../../utils/pushNotiications";
import { eye, eyeOff } from "ionicons/icons"; // Import icons
import { useAuth } from '../../components/AuthContext';
import EnvironmentRibbon from "../../components/EnvironmentRibbon";

const isProd: any = import.meta.env.PROD;

const Login: React.FC = () => {
  const logo = "assets/images/logo-login.svg";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loginMessage, setLoginMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [isError, setIsError] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const app_version: any = localStorage.getItem('app_version');
  const app_name: any = localStorage.getItem('app_name');

  const history = useHistory();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const storedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (storedRememberMe && storedUsername && storedPassword) {
      setUsername(storedUsername);
      setPassword(storedPassword);
      setRememberMe(storedRememberMe);
    }

    // Register Push Handlers
    // registerPushHandlers();
    // Register the Device Token
    registerDevice();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (isSubmitting) return;
    setLoginMessage("");
    setIsSubmitting(true);

    // Validation
    if (!username) {
      setUsernameError("Please enter username");
    }
    if (!password) {
      setPasswordError("Please enter password");
    }

    if (username && password) {
      try {
        const response = await login(username, password); // Call loginApi function
        if (response.data.status == 200 && response.data.success == true) {
          console.log("hi")
          toast.success(response.data.message);
          console.log(response.data.data[0].role_name, "rolename");
          const userData = response.data.data[0]
          if (userData.last_action === "1") {
            try {
              await userCheckIns(userData);
              //localStorage.setItem("userData", JSON.stringify(userData));
              history.push("/dashboard");

            } catch (error) {
              console.error("Error during check-in:", error);
            }


          } else {
            localStorage.setItem("userData", JSON.stringify(response.data.data[0]));
            history.push("/home");
          }
        }
        else {
          // console.log(response.message)
          toast.error(response.data.message);
        }

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
        setLoading(false);
      }
      setTimeout(() => {
        setLoginMessage("");
      }, 2000);
    } else {
      setIsError(true);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      localStorage.removeItem("rememberMe");
    }
  }, [rememberMe, username, password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUsernameChange = (e: any) => {
    setUsername(e.detail.value!);
    if (e.detail.value) {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (e: any) => {
    setPassword(e.detail.value!);
    if (e.detail.value) {
      setPasswordError("");
    }
  };

  return (
    <IonPage>
      
      <IonContent fullscreen className="ion-login">
        {!isProd && <EnvironmentRibbon position="ribbon top-right"/>}
        {loading && <IonProgressBar type="indeterminate" color="success" />}
        <div className="loginwrapp">
          <IonImg
            className="loginLogo"
            src={logo}
            alt="logo"
            style={{ height: "100px" }}
          ></IonImg>
          <IonText className="loginHeading">
            <h1>Login</h1>
            <p>Enter Email / Employee ID and Password</p>
          </IonText>
          <form onSubmit={handleLogin}>
            <IonLabel className="ion-label">Email / Employee ID</IonLabel>
            <div className="ionItemInput ion-margin-bottom">
              <IonImg className="loginImgInput" src="assets/images/login-email-icon.svg"></IonImg>
              <IonInput
                placeholder="Email"
                value={username}
                onIonInput={handleUsernameChange}
                style={{ color: "black" }}
              />
            </div>
            {usernameError && <IonText color="danger">{usernameError}</IonText>}

            <IonLabel className="ion-label">Password</IonLabel>
            <div className="ionItemInput">
              <IonImg className="loginImgInput" src="assets/images/login-password-icon.svg"></IonImg>
              <IonInput
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onIonInput={handlePasswordChange}
                style={{ color: "black" }}
              />
              <IonIcon className="showPasswordIcon"
                slot="end"
                icon={showPassword ? eye : eyeOff}
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer", }}
              />
            </div>
            {passwordError && <IonText color="danger">{passwordError}</IonText>}

            <IonText className="ion-Remember">
              <IonCheckbox
                className="ionCheckbox ion-float-left"
                labelPlacement="end"
                checked={rememberMe}
                onIonChange={(e) => setRememberMe(e.detail.checked)}
              >
                Remember Me
              </IonCheckbox>
            </IonText>
            <IonButton
              type="submit"
              className="ion-button primaryGradientBt"
              slot="primary"
              fill="solid"
              expand="block"
              disabled={isSubmitting}
            >
              Login
            </IonButton>
          </form>
          {loginMessage && (
            <IonText
              color={
                loginMessage === "Logged in successfully" ? "success" : "danger"
              }
            >
              {loginMessage}
            </IonText>
          )}
          <IonText className='loginVersion'>
            <p>App Version &nbsp;{app_version}</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
