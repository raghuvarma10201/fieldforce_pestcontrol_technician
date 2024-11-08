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
  IonSearchbar,
  IonBadge,
  IonGrid,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import CommonHeader from "../components/CommonHeader";
import { getvistexecutionApi } from "../data/apidata/taskApi/taskDataApi";
import { toast } from "react-toastify";
import { formatDate, formatTime } from "../utils/dateTimeUtils";
import GoTop from "../components/GoTop";

const FormData: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>(); // Extract taskId from route params
  const [formData, setFormData] = useState<any>({});
  const [userData, setUserData] = useState<any>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("taskid in formdata", taskId);
    fetchData();
  }, []);

  const fetchData = async () => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.error("User Data is not available");
      return;
    }

    const userData = JSON.parse(userDataString);

    try {
      const requestBody = {
        visit_id: taskId,
      };
      const responseData = await getvistexecutionApi(requestBody);

      console.log("Data before processing image URLs:", responseData);

      if (responseData.success) {
        let res = responseData.data;

        // Assuming decodeUrlPath function is for decoding URL paths, handle as needed
        // res.team_photo = decodeUrlPath(res.team_photo);
        // res.pests_found_image_path = decodeUrlPath(res.pests_found_image_path);
        // res.pests_recommendations_image_path = decodeUrlPath(res.pests_recommendations_image_path);
        // res.signature_path = decodeUrlPath(res.signature_path);

        // Assuming pests_found and pests_recommendations are arrays
        // You may adjust this logic based on your actual data structure
        // res.pests_found = res.pests_found.map((item: any) => {
        //   item.pest_photo = decodeUrlPath(item.pest_photo);
        //   return item;
        // });

        // res.pests_recommendations = res.pests_recommendations.map((item: any) => {
        //   item.recommended_media = item.recommended_media.map((mediaItem: any) => {
        //     // TODO: Logic for adding res.pests_recommendations_image_path to image names
        //     return mediaItem;
        //   });
        //   return item;
        // });

        // Example of adjusting signature paths
        // res.feedback_details[0].customer_signature = decodeUrlPath(res.feedback_details[0].customer_signature);
        // res.feedback_details[0].technician_signature = decodeUrlPath(res.feedback_details[0].technician_signature);

        setFormData(res);
        console.log("Final Form Data to be set in UI:", formData);
      } else {
        console.error("Failed to fetch task initiation data");
        // toast.error("Server not responding. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Server not responding. Please try again later.");
    }
  };

  return (
    <>
      <CommonHeader
        backToPath={"/forms"}
        pageTitle={"Form Data"}
        showIcons={false}
      />
      <IonContent className="ionContentColor previewWrpp">
        <div className="ionPaddingBottom">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Site Name</IonCardTitle>
            </IonCardHeader>
            <IonText className="siteName">
              {formData && formData.site_name ? (
                <h3>{formData.site_name}</h3>
              ) : (
                <p>No site name found.</p>
              )}
            </IonText>
          </IonCard>

          <IonCard className="ion-padding-horizontal">
            <IonCardHeader>
              <IonCardTitle>Team Attendance</IonCardTitle>
            </IonCardHeader>
            {/* Display only one technician */}
            {formData && formData.team && formData.team.length > 0 ? (
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
            ) : (
              <p>No technicians found.</p>
            )}

            {/* Display selected technicians */}
            {formData && formData.team && formData.team.length > 0 ? (
              <IonList lines="full" className="ion-list-item listItemAll">
                <IonText className="previewHeading">
                  <h3>Selected Technicians</h3>
                  <IonBadge color="primary">
                    {formData.team.length - 1}
                  </IonBadge>
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

          <IonCard className="ion-padding-horizontal">
            <IonCardHeader>
              <IonCardTitle>Task Initiation</IonCardTitle>
            </IonCardHeader>
            {formData &&
              formData?.task_initiation &&
              formData?.task_initiation &&
              formData?.task_initiation.length > 0 ? (
              formData?.task_initiation.map(
                (initiation: any, index: number) => (
                  <IonCard key={index}>
                    <IonText>
                      <p>
                        Date and Time:{" "}
                        {formatDate(initiation?.date_time) +
                          " " +
                          formatTime(initiation?.date_time)}
                      </p>
                      <p>Log Type: {initiation?.log_type}</p>
                      <p>Tracking Type: {initiation?.tracking_type}</p>
                      <p>Latitude: {initiation?.latitude}</p>
                      <p>Longitude: {initiation?.longitude}</p>
                    </IonText>
                  </IonCard>
                )
              )
            ) : (
              <p>No Task Initiation details found.</p>
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
                  <IonCard key={pest.id} className="innerCard">
                    <div className="preCont">
                      <div className="bottomLine">
                        <IonText>
                          <h4>Service Activity Details</h4>
                          <h2>{pest.pest_report_type}</h2>
                        </IonText>
                        <IonText>
                          <h6>Service Found?</h6>
                          <h4>{pest.is_pest_found}</h4>
                        </IonText>
                        <IonText>
                          <h6>Activity Level</h6>
                          <h4>{pest.pest_severity}</h4>
                        </IonText>
                        <IonText>
                          <h6>Chemical added</h6>
                          <h4>{pest.is_chemical_added}</h4>
                        </IonText>
                        <IonText>
                          <h6>Area</h6>
                          <h4>{pest.pest_area}</h4>
                        </IonText>

                        <IonText>
                          <h6>Photo of Pest Found</h6>
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
              <IonCardTitle>Material Used</IonCardTitle>
            </IonCardHeader>
            <div className="preCont">
              {formData.materials_used && formData.materials_used.length > 0 ? (
                <IonGrid>
                  <IonRow className="rowHeading">
                    <IonCol size="6">Products</IonCol>
                    <IonCol size="6" className="ion-text-end">
                      Quantity
                    </IonCol>
                  </IonRow>
                </IonGrid>
              ) : (
                <p>No material data available.</p>
              )}

              {formData.materials_used &&
                formData.materials_used.length > 0 &&
                formData.materials_used.map((material: any) => (
                  <IonRow key={material.id}>
                    <IonCol size="6">{material.item_name}</IonCol>
                    <IonCol size="6" className="ion-text-end">
                      {material.quantity} {material.unit_name}
                    </IonCol>
                  </IonRow>
                ))}
            </div>
          </IonCard>
          {/* Recommendations */}
          <IonCard className="ion-padding-horizontal">
            <IonCardHeader>
              <IonCardTitle>Recommendations</IonCardTitle>
            </IonCardHeader>
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

                            <IonImg key={index} src={recommendation.descriptive} />
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
              formData.work_done_details.length > 0 ? (
              <IonCard key="workDetails" className="innerCard">
                <div className="preCont">
                  {formData.work_done_details.map((workDetail: any) => (
                    <IonText key={workDetail.id}>
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
                        workDetail.selection_type.toLowerCase() === "multi" && (
                          <h4>{workDetail.options}</h4>
                        )}
                      {workDetail.type.toLowerCase() === "selection" &&
                        workDetail.selection_type.toLowerCase() ===
                        "multiple" && <h4>{workDetail.options}</h4>}
                      {workDetail.had_dependency == 1 && (
                        <>
                          <h6>
                            {" "}
                            {workDetail.dependency_label !== null
                              ? workDetail.dependency_label
                              : "Description"}{" "}
                          </h6>{" "}
                          <h4>{workDetail.dependency_label_text}</h4>
                        </>
                      )}
                    </IonText>
                  ))}
                </div>
              </IonCard>
            ) : (
              <p>No data Found</p>
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

export default FormData;
