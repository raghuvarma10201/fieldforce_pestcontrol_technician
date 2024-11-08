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
  IonLabel,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonBadge,
  IonGrid,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/react";
import { useHistory, useLocation, useParams } from "react-router";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import { useEffect, useState, useRef } from "react";
import { object, string } from "yup";
import FeedbackFollowup from "./FeedbackFollowup";
import { fetchvisitExecutionpreview } from "../data/apidata/taskApi/taskDataApi";
import { retrievevisitExecutionDetailsBasedonNetwork } from "../data/offline/entity/DataRetriever";
import { toast, ToastContainer } from "react-toastify";
import { formatDate, formatTime } from "../utils/dateTimeUtils";
import GoTop from "../components/GoTop";
interface LocationState {
  from: string;
}

const TaskPreview: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const pestActivityRef = useRef<HTMLDivElement>(null);
  const goBack = () => {
    history.goBack();
  };

  const [taskData, setTaskData] = useState<any[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<any[]>([]);
  const [pestFoundData, setPestFoundData] = useState<any[]>([]);
  const [recommData, setRecommData] = useState<any[]>([]);
  const [selectChemical, setSelectChemical] = useState<any[]>([]);
  const [selectChemicals, setSelectChemicals] = useState<any[]>([]);
  const [workDonedetails, setWorkDonedetails] = useState<any[]>([]);
  const [selectFeedback, setFeedbackDetails] = useState<any[]>([]);
  const [PestFound, setPestFound] = useState<any[]>([]);
  const [activityUsageArrays, setActivityUsageArray] = useState<any[]>([]);
  const [previewChemicalused, setActivityUsageArrays] = useState<any[]>([]);

  const [multiRecomm, multiRecomDetails] = useState<any[]>([]);
  const [isElementLoaded, setIsElementLoaded] = useState(false);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchDataFromStorage = (key: any) => {
      const storedData = sessionStorage.getItem(key);
      if (storedData) {
        return JSON.parse(storedData);
      } else {
        const localStorageData = localStorage.getItem(key);
        if (localStorageData) {
          return JSON.parse(localStorageData);
        }
        return null;
      }
    };
    const taskDataStr = localStorage.getItem("activeTaskData");
    if (!taskDataStr) {
      throw new Error("Task Data is not available");
    }
    const activeTaskData = JSON.parse(taskDataStr);
    const visitId = activeTaskData.id;

    setTaskData(fetchDataFromStorage("activeTaskData") || []);
  }, []);

  useEffect(() => {
    const taskDataStr = localStorage.getItem("activeTaskData");
    if (!taskDataStr) {
      throw new Error("Task Data is not available");
    }
    const activeTaskData = JSON.parse(taskDataStr);
    const visitId = activeTaskData.id;

    const fetchData = async () => {
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        console.error("user Data is not available");
        return;
      }

      const userData = JSON.parse(userDataString);

      try {
        const visitExecutionDetails =
          await retrievevisitExecutionDetailsBasedonNetwork(visitId);

        if (visitExecutionDetails) {
          // let res = visitExecutionDetails.data;
          console.log(
            "Visit Execution Details retrieved:---------------------------->",
            visitExecutionDetails
          );
          // Assuming setFormData is a function to update your component state
          visitExecutionDetails.pests_recommendations = groupMcqRecommendations(visitExecutionDetails.pests_recommendations,visitExecutionDetails.pests_recommendations_image_path);
          //console.log(xvdgf);
          setFormData(visitExecutionDetails);
        } else {
          console.log(
            "Visit Execution Details not found or could not be retrieved."
          );
          // toast.error("Server not responding. Please try again later.");
          // Handle case where visit execution details are not available
        }
      } catch (error: any) {
        console.error("Error fetching data", error);
        toast.error("Server not responding. Please try again later.");
      }
    };

    fetchData();
  }, []);
  console.log(formData);

  const groupMcqRecommendations = (
    selectedRecommendations: any[],path : any): any[] => {
    const grouped: any[] = [];
    const uniqueDescriptions: { [key: string]: Set<string> } = {};

    selectedRecommendations.forEach(({ question,question_id, option_id, type, descriptive }) => {
      if(type === 'file'){
        descriptive = path+''+descriptive;
      }
      const existingItem = grouped.find(
        (item) => item.question_id === question_id
      );

      if (existingItem) {
        //existingItem.recommendation_id += `,${id}`;
        if (option_id) {
          if (!uniqueDescriptions[question_id]) {
            uniqueDescriptions[question_id] = new Set();
          }
          if (!uniqueDescriptions[question_id].has(option_id)) {
            uniqueDescriptions[question_id].add(option_id);
            existingItem.option_id += `, ${option_id}`;
          }
          if (!uniqueDescriptions[question_id].has(descriptive)) {
            uniqueDescriptions[question_id].add(descriptive);
            existingItem.descriptive += `, ${descriptive}`;
          }
        }
      } else {
        grouped.push({
          question: question,
          question_id: question_id,
          option_id: option_id,
          dependency_label_text: '',
          descriptive: descriptive,
          type: type
        });
      }
    });
    console.log(grouped);
    return grouped;
  };
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#pestActivitySection") {
      const pestActivitySection = document.getElementById(
        "pestActivitySection"
      );
      console.log(pestActivitySection); // For debugging

      if (pestActivitySection) {
        // Element found, scroll smoothly
        pestActivitySection.scrollIntoView({ behavior: "smooth" });
      } else {
        console.error('Element with ID "pestActivitySection" not found'); // Optional error handling
      }
    }
  }); // Empty dependency array to run only once
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#chemicalUsedSection") {
      const chemicalUsedSection = document.getElementById(
        "chemicalUsedSection"
      );
      console.log(chemicalUsedSection); // For debugging

      if (chemicalUsedSection) {
        // Element found, scroll smoothly
        chemicalUsedSection.scrollIntoView({ behavior: "smooth" });
      } else {
        console.error('Element with ID "chemicalUsedSection" not found'); // Optional error handling
      }
    }
  }); // Empty dependency array to run only once

  // useEffect(() => {
  //   console.log("Current Hash:", window.location.hash);
  // }, []);

  const getBackPath = () => {
    const location = useLocation<{ state: LocationState }>();

    if (location.state?.state?.from) {
      return location.state.state.from;
    }

    return "/taskexecution"; // Default fallback path
  };

  return (
    <>
      <ToastContainer />
      <CommonHeader
        backToPath={"/taskexecution"}
        pageTitle={"Task Preview"}
        showIcons={false}
      />
      <IonContent className="ionContentColor previewWrpp">
        <div className="ionPaddingBottom">
          <IonCard>
            <IonText className="siteName">
              <IonCardHeader>
                <IonCardTitle>Site Name</IonCardTitle>
              </IonCardHeader>
              {formData && formData.site_name && <h3>{formData.site_name}</h3>}
            </IonText>
          </IonCard>

          {/* Team Attendance  */}
          <IonCard className="ion-padding-horizontal">
            <IonCardHeader>
              <IonCardTitle>Team Attendance</IonCardTitle>
            </IonCardHeader>
            {/* Display only one technician */}
            {formData && formData.team && formData.team.length > 0 && (
              <IonList className="listItemAll">
                <IonItem lines="none">
                  <IonThumbnail slot="start" className="thumbnailIcon">
                    <IonImg src="assets/images/technician-icon.svg"></IonImg>
                  </IonThumbnail>
                  <IonText className="listCont">
                    <h3>{formData.team[0].first_name}</h3>
                    <h6>{formData.team[0].mobile_no}</h6>
                  </IonText>
                </IonItem>
              </IonList>
            )}

            {/* Display selected technicians */}
            {formData && formData.team && formData.team.length > 0 ? (
              <IonList lines="full" className="ion-list-item listItemAll">
                <IonText className="previewHeading">
                  <h3>Selected Technicians</h3>
                  <IonBadge color="primary">{formData.team.length - 1}</IonBadge>
                </IonText>
                {formData.team.slice(1).map((technician: any, index: any) => (
                  <IonItem key={index}>
                    <IonThumbnail slot="start" className="thumbnailIcon">
                      <IonImg src="assets/images/technician-icon.svg"></IonImg>
                    </IonThumbnail>
                    <IonText className="listCont">
                      <h4>{technician.first_name}</h4>
                      <h6>{technician.mobile_no}</h6>
                    </IonText>

                  </IonItem>
                ))}
              </IonList>
            ) : null}
          </IonCard>

          <IonCard className="ion-padding-horizontal preTaskInitiation">
            <IonCardHeader>
              <IonCardTitle>Task Initiation</IonCardTitle>
            </IonCardHeader>
            {formData &&
              formData?.task_initiation &&
              formData?.task_initiation.length > 0 &&
              formData?.task_initiation.map(
                (initiation: any, index: number) => (
                  <IonCard className="innerCard" key={index}>
                    <IonText>
                      <p>
                        Date and Time: <span>{" "}
                          {formatDate(initiation?.date_time) +
                            " " +
                            formatTime(initiation?.date_time)}
                        </span>
                      </p>
                      <p>Log Type: <span>{initiation?.log_type}</span></p>
                      <p>Tracking Type: <span>{initiation?.tracking_type}</span></p>
                      <p>Latitude: <span>{initiation?.latitude}</span></p>
                      <p>Longitude: <span>{initiation?.longitude}</span></p>
                    </IonText>
                  </IonCard>
                )
              )}
            {/* Add console.log statements here */}
            {console.log("formData:", formData)}
            {console.log("formData.task_initiation:", formData.task_initiation)}
          </IonCard>

          {/* Pest Activity Found Details */}
          <IonCard className="ion-padding-horizontal" id="pestActivitySection">
            <IonCardHeader>
              <IonCardTitle>Service Activity Details</IonCardTitle>
            </IonCardHeader>
            {formData?.pests_found &&
              formData.pests_found.length > 0 &&
              formData.pests_found.map((pest: any) => {
                // Split the pest_photo string into an array if it's a string with commas
                const pestPhotos = pest.pest_photo.split(",");

                const imagePath = formData.pests_found_image_path || "";

                // Debugging output
                console.log("Pest Photos:", pestPhotos);

                return (
                  <IonCard className="innerCard" key={pest.id}>
                    <div className="preCont">
                      <div className="bottomLine">
                        <IonText>
                          <h2>Service Activity Type</h2>
                          <h4>{pest.service_report_type}</h4>
                        </IonText>
                        <IonText>
                          <h2>Service Activity Done</h2>
                          <h4>{pest.is_pest_found}</h4>
                        </IonText>
                        <IonText>
                          <h2>Activity Level</h2>
                          <h4>{pest.pest_severity}</h4>
                        </IonText>
                        <IonText>
                          <h2>Chemical added</h2>
                          <h4>{pest.is_chemical_added}</h4>
                        </IonText>
                        <IonText>
                          <h2>Area</h2>
                          <h4>{pest.pest_area}</h4>
                        </IonText>

                        <IonText>
                          <h2>Photo of Service Activity</h2>
                        </IonText>
                        {pestPhotos.map((media: any, index: any) => {
                          const fullImagePath = `${imagePath}${media}`;
                          return <IonImg key={index} src={fullImagePath} />;
                        })}
                      </div>
                    </div>
                  </IonCard>
                );
              })}
          </IonCard>

          {/* Chemical Used */}
          <IonCard className="ion-padding-horizontal">
            <IonCardHeader>
              <IonCardTitle>Chemical Used</IonCardTitle>
            </IonCardHeader>

            <div className="preCont">
              {formData.materials_used && formData.materials_used.length > 0 ? (
                <IonCard className="innerCard">
                  <IonGrid>
                    <IonRow className="rowHeading">
                      <IonCol size="6">Products</IonCol>
                      <IonCol size="6" className="ion-text-end">
                        Quantity
                      </IonCol>
                    </IonRow>
                    {formData.materials_used.map(
                      (material: any, index: number) => (
                        <IonRow key={index}>
                          <IonCol size="6">{material.item_name}</IonCol>
                          <IonCol size="6" className="ion-text-end">
                            {material.quantity} {material.unit_name}
                          </IonCol>
                        </IonRow>
                      )
                    )}
                  </IonGrid>
                </IonCard>
              ) : (
                <p>No chemical usage data available.</p>
              )}

              {/* Display pest_report_type below chemical usage */}
            </div>
          </IonCard>

          {/* Recommendations */}
          <IonCard className="ion-padding-horizontal">
            <IonCardHeader>
              <IonCardTitle>Recommendations</IonCardTitle>
            </IonCardHeader>
            {/* <IonText className="previewHeading">
              <h2>Recommendations</h2>
            </IonText> */}

            <IonCard className="innerCard">
              <div className="bottomLine">
                <div className="preCont">
                  {formData &&
                    formData.pests_recommendations &&
                    formData.pests_recommendations.length > 0 &&
                    formData.pests_recommendations.map(
                      (recommendation: any, index: number) => (
                        <IonText key={index} >
                          <h2>{recommendation.question}</h2>
                          {recommendation.type === "file" && (
                            
                          <IonImg key={index} src={recommendation.descriptive}/>
                          )}
                          {recommendation.type !== "file" && (
                            <h4>{recommendation.descriptive || "N/A"}</h4>
                          )}
                          
                        </IonText>
                      )
                    )}
                </div>
              </div>
            </IonCard>

          </IonCard>

          {/* Work Done Details */}
          <IonCard className="ion-padding-horizontal">
            <IonCardHeader>
              <IonCardTitle>Work Done Details</IonCardTitle>
            </IonCardHeader>
            {formData &&
              formData.work_done_details &&
              formData.work_done_details.length > 0 && (
                <IonCard className="innerCard">
                  {formData.work_done_details.map(
                    (workDetail: any, index: number) => (
                      <div className="preCont" key={`workDetail-${index}`}>
                        <IonText>
                          <h6>{workDetail.question}</h6>
                          {workDetail.type.toLowerCase() === "descriptive" && (
                            <h4>{workDetail.descriptive}</h4>
                          )}
                          {workDetail.type.toLowerCase() === "selection" &&
                            workDetail.selection_type.toLowerCase() ===
                            "single" && <h4>{workDetail.options}</h4>}
                          {workDetail.type.toLowerCase() === "mcq" &&
                            workDetail.selection_type.toLowerCase() ===
                            "single" && <h4>{workDetail.options}</h4>}
                          {workDetail.type.toLowerCase() === "mcq" &&
                            workDetail.selection_type.toLowerCase() ===
                            "multi" && <h4>{workDetail.options}</h4>}
                          {workDetail.type.toLowerCase() === "selection" &&
                            workDetail.selection_type.toLowerCase() ===
                            "multiple" && <h4>{workDetail.options}</h4>}
                          {/* Display dependency_label_text if options is null */}
                          {workDetail.had_dependency == 1 && (
                            <>
                              <h6> {workDetail.dependency_label !== null ? workDetail.dependency_label : "Description"} </h6> <h4>{workDetail.dependency_label_text}</h4>

                            </>
                          )}
                        </IonText>
                      </div>
                    )
                  )}
                </IonCard>
              )}
          </IonCard>

          {/* Feedback And Follow-up */}
          <IonCard className="ion-padding-horizontal">
            <IonCardHeader>
              <IonCardTitle>Feedback And Follow-up</IonCardTitle>
            </IonCardHeader>
            {formData?.feedback_details &&
              formData.feedback_details.length > 0 &&
              formData.feedback_details.map(
                (feedbackDetail: any, index: number) => (
                  <IonCard
                    key={`feedbackDetail-${index}`}
                    className="innerCard"
                  >
                    <div className="preCont">
                      <IonText>
                        <h6>Customer Feedback</h6>
                        <h4>{feedbackDetail.customer_feedback}</h4>
                      </IonText>

                      <IonText>
                        <h6>Customer Signature</h6>
                        <IonImg
                          src={`${formData.signature_path}${feedbackDetail.customer_signature}`}
                        />
                      </IonText>

                      <IonText>
                        <h6>Technician Signature</h6>
                        <IonImg
                          src={`${formData.signature_path}${feedbackDetail.technician_signature}`}
                        />
                      </IonText>

                      <IonText>
                        <h6>Feedback Details</h6>
                        <h4>{feedbackDetail.feedback}</h4>
                      </IonText>

                      <IonText>
                        <h6>Follow-Up Required</h6>
                        <h4>{feedbackDetail.is_follow_up_required}</h4>
                      </IonText>

                      {feedbackDetail.is_follow_up_required === "Yes" && (
                        <IonText>
                          <h6>Follow-Up Date</h6>
                          <h4>{formatDate(feedbackDetail.next_follow_up)}</h4>
                        </IonText>
                      )}
                      <IonText>
                        <h6>Completed Date</h6>
                        <h4>{`${formatDate(feedbackDetail.created_on)}   ${formatTime(feedbackDetail.created_on)}`}</h4>
                      </IonText>
                    </div>
                  </IonCard>
                )
              )}
          </IonCard>
        </div>
      </IonContent>
      <GoTop />
    </>
  );
};
export default TaskPreview;
