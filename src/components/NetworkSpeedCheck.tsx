import React, { useEffect, useState } from 'react';
import { IonToast } from '@ionic/react';
import {toast} from 'react-toastify'

const NetworkSpeedCheck: React.FC = () => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const checkNetworkSpeed = () => {
      const connection = navigator.connection;

      if (connection) {
        console.log(connection)
        const { downlink } = connection;

        console.log(downlink,"downlink")

        // Assume network is slow if the downlink is less than 1.5Mbps
        if (downlink < 1.5 && downlink > 0) {
          toast.info("Your network connection is slow");
        }
        else if(downlink == 0){
          toast.info("Your network connection is disconnected");

        } else {
            toast.success("Network is connected");
        }
      }
    };

    checkNetworkSpeed();

    const connection = navigator.connection;

    if (connection) {
      connection.addEventListener('change', checkNetworkSpeed);
    }

    return () => {
      if (connection) {
        connection.removeEventListener('change', checkNetworkSpeed);
      }
    };
  }, []);

  return (
    <IonToast
      isOpen={showToast}
      onDidDismiss={() => setShowToast(false)}
      message="Your network connection is slow"
      duration={2000}
    />
  );
};

export default NetworkSpeedCheck;
