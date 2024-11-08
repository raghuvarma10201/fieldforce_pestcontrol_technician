import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonLabel,
  IonTitle,
  IonInput,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonTextarea,
  IonBadge,
  IonProgressBar,
  IonSpinner,
  IonCard,
} from "@ionic/react";
import { useHistory } from "react-router";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import "./PestActivityFound.css";
import "@splidejs/splide/dist/css/themes/splide-default.min.css";
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import {
  ProgressStatus,
  updateTaskStatus,
} from "../data/localstorage/taskStatusStorage";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import useLongitudeLocation from "../components/useLongitudeLocation";
import FullScreenLoader from "../components/FullScreenLoader";
import { toast, ToastContainer } from "react-toastify";
import {
  multiRecommendations,
  submitRecommendations,
  getVisitExecutionDetails,
} from "../data/apidata/taskApi/taskDataApi";

import {
  retrieveRecommendationsBasedOnNetwork,
  retrievevisitExecutionDetailsBasedonNetwork,
} from "../data/offline/entity/DataRetriever";
import { savePestRecommendationBasedOnNetwork } from "../data/offline/entity/DataTransfer";
import { camera } from "ionicons/icons";
import { t } from "i18next";
// import { toast } from "react-toastify";
interface FormData {
  visit_id: string;
  is_recommendation_added: string;
  recommendations: string;
}

interface RecommendationData {
  is_recommendation_added?: string;
  pest_reported_id?: string;
  recommendation_id?: string;
  description?: string;
  is_service_available?: string;
  selectedRecommendations?: { recommendation_type_id: string; id: string, dependency_label_text: string, descriptive: string, }[];
  selectedRecommendationDescriptions?: { recommendation_type_id: string; description: string }[];
  selectedRecommendationFiles?: { recommendation_type_id: string; file: any }[];
  recommended_media?: any[];
  custom_recommendation?: string;
  recommendations?: any; // Add recommendations property
  recommTypes?: {
    recommendation_type_id: string;
    recommendation_type: string;
  }[]; // Add this line
}

// Define the type for a grouped recommendation
interface GroupedRecommendation {
  question_id: string;
  option_id: string;
  dependency_label_text: string;
  descriptive: string;
}

interface SelectedRecommendation {
  question_id: string;
  option_id: string;
  dependency_label_text: string;
  descriptive: string;
}

const Recommendations = () => {
  const location = useLongitudeLocation();
  const [images, setImages] = useState<string[][]>([]);
  const {
    handleSubmit,
    register,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm({ mode: "all" });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [customRecommendations, setCustomRecommendations] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommDataArray, setRecommDataArray] = useState<any>({});
  const [imageUploadStatus, setImageUploadStatus] = useState<any[]>([]);

  // const [recommTypes, setRecommTypes] = useState<{ recommendation_type_id: string; recommendation_type: string }[]>([]);

  const [othersSelections, setOthersSelections] = useState<{
    [pestIndex: number]: {
      [recommendationTypeId: string]: boolean;
    };
  }>({});
  const [customDescriptions, setCustomDescriptions] = useState<{
    [index: number]: { [recommendationTypeId: string]: string };
  }>({});

  const [recomm, setRecomm] = useState<any[]>([]);
  const [visitExecutionDetails, setVisitExecutionDetails] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [imgDelete, setImgDelete] = useState(false);
  const taskId = localStorage.getItem("activeTaskData");
  if (!taskId) {
    throw new Error("Task data is not available");
  }
  const activeTaskData = JSON.parse(taskId);
  const [formData, setFormData] = useState<Partial<FormData>>({
    visit_id: activeTaskData.id,
    is_recommendation_added: "",
    recommendations: "",
  });
  console.log(activeTaskData);
  // Move the pest activity processing logic into a useEffect that depends on visitExecutionDetails
  useEffect(() => {
    if (visitExecutionDetails) {
      const pestActivityArray = visitExecutionDetails.pests_found || [];

      // Use a Map to filter out duplicate pest_report_type entries
      const uniquePestActivityMap = new Map();

      pestActivityArray.forEach((pestActivity: any) => {
        if (!uniquePestActivityMap.has(pestActivity.pest_report_type)) {
          uniquePestActivityMap.set(
            pestActivity.pest_report_type,
            pestActivity
          );
        }
      });

      // Convert the Map back to an array
      const uniquePestActivityArray = Array.from(
        uniquePestActivityMap.values()
      );

      // Log or store the uniquePestActivityArray
      console.log(uniquePestActivityArray);

      // Initialize formData with sub_service_id from uniquePestActivityArray
      setFormData((prevData: any) => ({
        ...prevData,
        pest_reported_id: uniquePestActivityArray[0]?.pest_reported_id || "",
      }));

      initRecommDataArray(uniquePestActivityArray); // Pass the unique pest activity array to initRecommDataArray
    }
  }, [visitExecutionDetails]); // Depend on visitExecutionDetails

  const initTaskExecForm = async () => {
    const activeTaskData = JSON.parse(localStorage.getItem("activeTaskData")!);
    const visitId = activeTaskData?.id; // Ensure visitId is available
    console.log("visitId------>", visitId);

    if (visitId) {
      await fetchVisitExecutionDetails(visitId); // Wait for the data to be fetched
    } else {
      console.error("visitId is not available");
    }
  };

  const fetchVisitExecutionDetails = async (visitId: string) => {
    try {
      setSubmittingProgress(true);
      const data = await retrievevisitExecutionDetailsBasedonNetwork(visitId);
      if (data) {
        console.log("Visit Execution Details ::", data);
        setVisitExecutionDetails(data);
      } else {
        console.error("Failed to fetch visit execution details");
        // toast.error("Server not responding. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Server not responding. Please try again later.");
    } finally {
      setSubmittingProgress(false); // Stop loading
    }
  };

  const initRecommDataArray = (uniquePestActivityArray: any[]) => {
    const recommDataArrayTemp = {
      is_recommendation_added: "",
      recommendations: [],
      selectedRecommendations: [],
      selectedRecommendationDescriptions: [],
      selectedRecommendationFiles: [],

    };

    setRecommDataArray(recommDataArrayTemp);
    setImages(new Array(uniquePestActivityArray.length).fill([]));
    console.log(
      "recommDataArrayTemp---------------------->",
      recommDataArrayTemp
    );
  };

  // Initialize task execution form when the component mounts
  useEffect(() => {
    initTaskExecForm();
  }, []);
  useEffect(() => {
    retrieveRecommendationsBasedOnNetwork(activeTaskData.service_id)
      .then((response) => {
        if (response && response.success) {
          const data = response.data;
          setRecomm(data);
          console.log("give recommendations -------------->", data);

          const multiRecommendationsArray = data;
        } else {
          console.error("Failed to fetch multi recommendations");
          // toast.error("Server not responding. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching mutli recommendations:", error);
        toast.error("Server not responding. Please try again later.");
      });
  }, []);

  const validateInputs = (recommendation: any) => {
    let isValid = true;

    console.log("Submitted recommendation data array:", recommendation);
    if (!recommDataArray.is_recommendation_added) {
      isValid = false;
    }
    if (recommDataArray.is_recommendation_added === "Yes") {
      const recommendationTypes = recommDataArray.selectedRecommendations || [];
      recomm.forEach((type: any) => {
        const isFilled = recommendation.recommendations.find((rec: any) => rec.question_id == type.questions.id);
        console.log(isFilled);
        if (isFilled) {
          if ((type.questions.type === 'descriptive') && isFilled.descriptive === '') {
            isValid = false;
            return isValid;
          }else if ((type.questions.type === 'file') && isFilled.file === '') {
            isValid = false;
            return isValid;
          }
        } else {
          isValid = false;
          return isValid;
        }
      })
    }
    console.log("Validation result:", isValid);
    return isValid;
  };
  const groupMcqRecommendations = (
    selectedRecommendations: any[]): any[] => {
    const grouped: any[] = [];
    const uniqueDescriptions: { [key: string]: Set<string> } = {};

    selectedRecommendations.forEach(({ question_id, option_id, dependency_label_text, descriptive }) => {
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
        }
      } else {
        grouped.push({
          question_id: question_id,
          option_id: option_id,
          dependency_label_text: '',
          descriptive: '',
          file: ''
        });
      }
    });
    console.log(grouped);
    return grouped;
  };
  const onSubmit = async (data: any) => {
    console.log(recommDataArray);
    //const requestBody: { visit_id: any; is_recommendation_added: any; recommendations: { question_id: any; option_id: any; dependency_label_text: any; descriptive: any; file: any; }[]; latitude: string | number; longitude: string | number; }[] = [];
    //const ccc = recommDataArray[0].selectedRecommendations.some((selected: any) =>selected.recommendation_type_id === type.questions.id))
    console.log("Submit data : ", data);
    console.log("recommDataArray ==== ", recommDataArray);
    setFormSubmitted(true);

    const activeTaskStr = localStorage.getItem("activeTaskData");
    if (!activeTaskStr) {
      console.error("Task Data not available");
      setSubmitting(false);
      return;
    }
    const activeTaskData = JSON.parse(activeTaskStr);
    const visit_id = activeTaskData?.id ?? "";
    console.log("visit id from session storage ", visit_id);
    setIsSubmitting(true);

    let mcqData = recommDataArray.selectedRecommendations?.map((question: any) => {
      const questionId = question.recommendation_type_id;
      const answerId = Array.isArray(question.id) ? question.id.join(",") : question.id || "";
      const dependencyLabelText = question.dependencyLabelText || "";
      const descriptive = Array.isArray(question.descriptive) ? question.descriptive.join(",") : question.descriptive || "";
      return {
        question_id: questionId,
        option_id: answerId,
        dependency_label_text: dependencyLabelText,
        descriptive: descriptive,
        file: ''
      };
    });
    
    //mcqData = groupMcqRecommendations(mcqData);
    console.log(mcqData);
    
    const descriptiveData = recommDataArray.selectedRecommendationDescriptions?.map((question: any) => {
      const questionId = question.recommendation_type_id;
      const answerId = '';
      const dependencyLabelText = "";
      const descriptive = question.description;
      return {
        question_id: questionId,
        option_id: answerId,
        dependency_label_text: dependencyLabelText,
        descriptive: descriptive,
        file: ''
      };
    });
    const fileData = recommDataArray.selectedRecommendationFiles?.map((question: any) => {
      const questionId = question.recommendation_type_id;
      const answerId = '';
      const dependencyLabelText = "";
      const descriptive = question.file;
      return {
        question_id: questionId,
        option_id: answerId,
        dependency_label_text: dependencyLabelText,
        descriptive: '',
        file: descriptive
      };
    });
    const mergedArray = [...new Set([...(mcqData ?? []), ...(descriptiveData ?? []), ...(fileData ?? [])])];
    const requestBody = {
      visit_id: visit_id,
      is_recommendation_added: recommDataArray.is_recommendation_added || "",
      recommendations: mergedArray,
      latitude: location?.latitude || "",
      longitude: location?.longitude || "",
    }
    try {
      // Validate inputs
      if (!validateInputs(requestBody)) {
        setSubmitting(false); // Stop form submission
        toast.error("Please fill all fields")
        return;
      }
      setSubmitting(true);
      const responseData = await savePestRecommendationBasedOnNetwork(
        location?.latitude?.toString() || "", // Pass latitude as a string
        location?.longitude?.toString() || "", // Pass longitude as a string
        visit_id,
        requestBody
      );
      // Check the structure of responseData.data
      if (responseData.data) {
        console.log(responseData);
        updateTaskStatus("", "recommGiven", ProgressStatus.done);
        history.push("/taskexecution");
      } else if (
        responseData.success === false &&
        responseData.message === "Undefined variable: index"
      ) {
        updateTaskStatus("", "recommGiven", ProgressStatus.done);
        history.push("/taskexecution");
      } else {
        console.error("Failed to submit form:", responseData.statusText);
        toast.error("Please fill all the Details Correctly. Please try again.");
      }
    } catch (error: any) {
      console.log(error);
      if (error.message === "Undefined variable: index") {
        updateTaskStatus("", "recommGiven", ProgressStatus.done);
        history.push("/taskexecution");
      } else {
        toast.error("Error during submission");
        console.error("Error during submission", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const history = useHistory();

  const isRecommChanged = (value: string) => {
    let updatedRecommDataArray: any = {
      is_recommendation_added: value,
      recommendations: [],
      selectedRecommendations: [],
      selectedRecommendationDescriptions: [],
      selectedRecommendationFiles: [],
    };
    if (updatedRecommDataArray.is_recommendation_added === "No") {
      toast.info("no recommendations added for the for ");
    }else{
      if(recomm.length == 0 ){
        updatedRecommDataArray.is_recommendation_added == "No"
        toast.info("No questionnaire configured");
      }
    }
    setRecommDataArray(updatedRecommDataArray);
  };

  const isRecommIdChanged = (
    selectedIds: string[],
    recommendation_type_id: string
  ) => {

    // Use "OthersID" for the Others selection
    const othersId = "Others";
    console.log(selectedIds);
    // Map selectedIds to the appropriate recommendation objects
    let selectedRecommendations;
    if (typeof selectedIds === 'string') {
      const recommendation = recomm.flatMap((type) => type.answers).find((rec) => rec.id === selectedIds);
      selectedRecommendations = [{
        recommendation_type_id: recommendation_type_id,
        id: selectedIds,
        dependency_label_text: '',
        descriptive: recommendation.options,
      }]
    } else {
      selectedRecommendations = selectedIds.map((id) => {
        if (id === othersId) {
          return {
            recommendation_type_id,
            id: othersId, // Use "OthersID" here
            dependency_label_text: '',
            descriptive: '',
          };
        }
        console.log(recomm);
        const recommendation = recomm.flatMap((type) => type.answers).find((rec) => rec.id === id);
        console.log(recommendation);
        return {
          recommendation_type_id:
            recommendation?.recommendation_type_id || recommendation_type_id,
          id,
          dependency_label_text: '',
          descriptive: recommendation.options,
        };
      });
    }


    setRecommDataArray((prevState: any) => {
      const newState = recommDataArray;
      // Filter out existing recommendations of the same type to avoid duplicates
      const filteredRecommendations = (selectedRecommendations || []).filter((rec: any) => rec.recommendation_type_id !== recommendation_type_id);

      newState.selectedRecommendations = [
        ...filteredRecommendations,
        ...selectedRecommendations,
      ];

      return newState;
    });
  };
  const isRecommIdChanged2 = (
    description: string,
    recommendation_type_id: string
  ) => {
    // Use "OthersID" for the Others selection
    const othersId = "Others";

    // Map selectedIds to the appropriate recommendation objects
    //const selectedDescription = description;

    const selectedDescription = [{
      recommendation_type_id: recommendation_type_id,
      description: description,
    }]
    setRecommDataArray((prevState: any) => {
      const newState = recommDataArray;
      // Filter out existing recommendations of the same type to avoid duplicates
      const filteredRecommendations = (
        newState.selectedRecommendationDescriptions || []
      ).filter((rec: any) => rec.recommendation_type_id !== recommendation_type_id);

      console.log(filteredRecommendations);

      newState.selectedRecommendationDescriptions = [
        ...filteredRecommendations,
        ...selectedDescription,
      ];
      console.log(recommDataArray);
      return newState;
    });
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecommImageUpload = async (
    recommendation_type_id: string,
    source: number) => {
    try {
      let src;
      if (source == 1) {
        src = CameraSource.Camera;
      } else if (source == 2) {
        src = CameraSource.Photos;
      } else if (source == 3) {
        src = CameraSource.Prompt;
      } else {
        src = CameraSource.Prompt;
      }
      if (Capacitor.getPlatform() === "web") src = CameraSource.Photos;

      const capturedImage = await Camera.getPhoto({
        quality: 25,
        allowEditing: false,
        saveToGallery: false,
        source: src,
        //direction: CameraDirection.Rear,
        resultType: CameraResultType.Base64,
      });
      const imageUrl = "data:image/jpeg;base64," + capturedImage.base64String;
      console.log("Captured image", imageUrl);
      //setImageUploadForIndex(index, true);

      const selectedFile = [{
        recommendation_type_id: recommendation_type_id,
        file: imageUrl,
        dependency_label_text: '',
        descriptive: '',
      }]
      
      await setRecommDataArray((prevState: any) => {
        const newState = recommDataArray;
        const filteredRecommendations = (
          newState.selectedRecommendationFiles || []
        ).filter((rec: any) => rec.recommendation_type_id !== recommendation_type_id);
        console.log(filteredRecommendations);
        recommDataArray.selectedRecommendationFiles = [
          ...filteredRecommendations,
          ...selectedFile,
        ];
        console.log(recommDataArray);
        return newState;
      });
      console.log(recommDataArray);
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };
  const setImageUploadForIndex = (index: any, status: any) => {
    setImageUploadStatus((prevState) => ({
      ...prevState,
      [index]: status,
    }));
  };
  const handleCancel = async () => {
    // Display a confirmation alert using swal
    const willReset = await swal({
      title: "Are you sure?",
      text: "Do you want to reset the form? All changes will be lost.",
      buttons: ["Cancel", "Ok"],
    });

    // If the user confirms, reset the form fields
    if (willReset) {
      setFormData({
        visit_id: activeTaskData?.id || "", // Ensure activeTaskData is defined
        is_recommendation_added: "",
        recommendations: "",
      });

      // Reset additional states
      setCustomRecommendations({});
      setSelectedOptions({});
      setRecommDataArray([]);
      setOthersSelections({});
      setCustomDescriptions({});
      setImages([[]]); // Reset the images state
      setImgDelete(false); // Reset the image delete flag
      setFormSubmitted(false);
    }
  };

  const filteredPestActivityArray = Array.from(
    new Set(
      visitExecutionDetails?.pests_found?.map(
        (item: any) => item.pest_report_type
      )
    )
  ).map((pest_report_type) =>
    visitExecutionDetails?.pests_found?.find(
      (item: any) => item.pest_report_type === pest_report_type
    )
  );
  const handleRemoveImage = (index: any, imageIndex: any) => {
    const updatedFormDataArray = [...images];
    updatedFormDataArray[index].splice(imageIndex, 1);
    setImages(updatedFormDataArray);
    setImgDelete(true);
  };

  return (
    <>
      <ToastContainer />
      <CommonHeader
        backToPath={"/taskexecution"}
        pageTitle={"Recommendations"}
        showIcons={false}
      />

      <IonContent fullscreen className="ionContentColor">
        {submittingProgress && <IonProgressBar type="indeterminate" />}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="ionPaddingBottom">
            <div className="recWrappBlock">
              <IonList className="recommendationHead ">
                <IonItem className="" lines="none" routerLink="/taskdetails">
                  <div>
                    <IonText>
                      <h5>{t('service', 'Service')} {t('activity', 'Activity')}</h5>
                    </IonText>
                  </div>
                </IonItem>
                <div className="bottomArrow"></div>
              </IonList>

              <div className="ion-padding-horizontal ion-margin-bottom">
                <IonList className="formlist">
                  <IonItem lines="none">
                    <div className="width100">
                      <IonLabel className="ion-label">
                        Do you want to add {t('recommendations', 'Recommendations')} ?
                        <IonText>*</IonText>
                      </IonLabel>
                      <IonSelect
                        placeholder="Select"

                        style={{ width: "100%" }}
                        value={
                          recommDataArray.is_recommendation_added
                        }
                        onIonChange={(e) => {
                          isRecommChanged(
                            e.detail.value || "",
                          );
                          clearErrors(
                            `recommDataArray.is_recommendation_added`
                          );
                        }}
                      >
                        <IonSelectOption value="Yes">Yes</IonSelectOption>
                        <IonSelectOption value="No">No</IonSelectOption>
                        <IonSelectOption value="NA">NA</IonSelectOption>
                      </IonSelect>
                    </div>
                  </IonItem>
                  {formSubmitted &&
                    !recommDataArray.is_recommendation_added && (
                      <IonText color="danger">
                        Please select whether you want to add {t('recommendations', 'Recommendations')}
                        or not
                      </IonText>
                    )}

                  {recommDataArray.is_recommendation_added ===
                    "Yes" && (
                      <>
                        {recomm.map((type, mapIndex) => (
                          <IonItem
                            lines="none"
                            key={type.questions.id}
                          >
                            <div className="width100">
                              <IonLabel className="ion-label">
                                {type.questions.question}
                                <IonText>*</IonText>
                              </IonLabel>
                              {type.questions.type === "descriptive" && (
                                <IonTextarea
                                  aria-label="Reason"

                                  placeholder={type.questions.question}
                                  value={
                                    recommDataArray.selectedRecommendationDescriptions
                                      ?.filter(
                                        (selected: any) =>
                                          selected.recommendation_type_id === type.questions.id
                                      )
                                      .map((selected: any) => selected.description) // returns an array of descriptions
                                      .join(', ') || ''  // Join them into a single string, separated by a comma (or use '\n' for new lines)
                                  }
                                  onIonInput={(e) => {
                                    clearErrors(
                                      `recommDataArray.recommendation_id`
                                    );
                                    const value = e.detail.value as string;
                                    isRecommIdChanged2(
                                      value,
                                      type.questions.id
                                    );
                                  }}
                                ></IonTextarea>
                              )}
                              {type.questions.type === "mcq" && (
                                <IonSelect
                                  placeholder="Select"

                                  style={{ width: "100%" }}
                                  multiple={(() => {
                                    if (type.questions.selection_type === 'single') {
                                      return false;
                                    } else {
                                      return true;
                                    }
                                  })()}
                                  value={
                                    recommDataArray.selectedRecommendations
                                      ?.filter(
                                        (selected: any) =>
                                          selected.recommendation_type_id === type.questions.id
                                      )
                                      .map((selected: any) => selected.id) || []
                                  }
                                  onIonChange={(e) => {
                                    clearErrors(
                                      `recommDataArray.recommendation_id`
                                    );
                                    console.log(e);
                                    const value = e.detail.value as string[];

                                    isRecommIdChanged(
                                      value,
                                      type.questions.id
                                    );
                                  }}
                                >
                                  {type.answers.map((rec: any) => (
                                    <IonSelectOption key={rec.id} value={rec.id}>
                                      {rec.options}
                                    </IonSelectOption>
                                  ))}
                                  <IonSelectOption value="Others">
                                    Others
                                  </IonSelectOption>
                                </IonSelect>
                              )}
                              {type.questions.type === "file" && (
                                <div>
                                  <IonCard
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0px', minHeight: '200px', border: '2px dashed #ccc' }}>
                                    {recommDataArray.selectedRecommendationFiles &&
                                      recommDataArray.selectedRecommendationFiles
                                        ?.filter((selected: any) => selected.recommendation_type_id === type.questions.id)
                                        .map((selected: any) => selected.file)[0] ? (
                                      <span style={{ width: '100%' }}>
                                        <img src={recommDataArray.selectedRecommendationFiles &&
                                          recommDataArray.selectedRecommendationFiles
                                            ?.filter((selected: any) => selected.recommendation_type_id === type.questions.id)
                                            .map((selected: any) => selected.file)[0]} alt="Uploaded" style={{ width: '100%', height: 'auto', maxHeight: '200px' }} />
                                        <IonIcon className="updateImage" icon={camera} onClick={() => handleRecommImageUpload(type.questions.id, type.questions.source)} />
                                      </span>
                                    ) : (
                                      <div style={{ textAlign: 'center' }}>
                                        <IonIcon icon={camera} style={{ fontSize: '48px', color: '#888' }} />

                                        {type.questions.source == 1 && (<p>Capture an image, or click the camera to capture one</p>)}
                                        {type.questions.source == 2 && (<p>Upload an image here, or click below to upload</p>)}
                                        {type.questions.source == 3 && (<p>Capture/Upload an image here, or click the camera to capture one</p>)}
                                        <IonButton onClick={() => handleRecommImageUpload(type.questions.id, type.questions.source)}>
                                          <IonIcon slot="start" icon={camera} />
                                          {type.questions.source == 1 && ('Capture')}
                                          {type.questions.source == 2 && ('Upload')}
                                          {type.questions.source == 3 && ('Capture/Upload')}
                                        </IonButton>
                                      </div>
                                    )}
                                  </IonCard>
                                </div>

                              )}
                              {formSubmitted &&
                                ((!recommDataArray.selectedRecommendations || !recommDataArray.selectedRecommendations.some((selected: any) => selected.recommendation_type_id === type.questions.id)) &&

                                  (!recommDataArray.selectedRecommendationDescriptions || !recommDataArray.selectedRecommendationDescriptions.some((selected: any) => selected.recommendation_type_id === type.questions.id)) &&

                                  (!recommDataArray.selectedRecommendationFiles || !recommDataArray.selectedRecommendationFiles.some((selected: any) => selected.recommendation_type_id === type.questions.id))) && (

                                  <IonText color="danger">
                                    This field is required.
                                  </IonText>
                                )}
                            </div>
                          </IonItem>
                        ))}
                      </>
                    )}
                </IonList>
              </div>
            </div>
            <IonFooter className="ion-footer">
              <IonToolbar className="ionFooterTwoButtons">
                <IonButton
                  className="ion-button"

                  color="medium"
                  onClick={handleCancel}
                >
                  RESET
                </IonButton>
                <IonButton
                  className="ion-button"
                  color="primary"
                  type="submit"
                // disabled={isSubmitting || !validateInputs()}
                >
                  SUBMIT
                </IonButton>
              </IonToolbar>
            </IonFooter>
          </div>
        </form>
        <FullScreenLoader isLoading={submitting} />
      </IonContent>
    </>
  );
};

export default Recommendations;
