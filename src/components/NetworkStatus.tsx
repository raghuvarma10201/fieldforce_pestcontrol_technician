import React, { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, IonButton, IonBackdrop, IonIcon, IonButtons, IonFooter } from '@ionic/react';
import './NetworkStatus.css';
import { refresh, settings } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Diagnostic } from '@ionic-native/diagnostic';

const NetworkStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      const status = await Network.getStatus();
      setIsConnected(status.connected);
    };

    // Check network status initially
    checkNetworkStatus();

    // Add listener for network status changes
    const handleNetworkChange = (status: any) => {
      setIsConnected(status.connected);
    };

    Network.addListener('networkStatusChange', handleNetworkChange);

    // Cleanup listener on unmount
    return () => {
      Network.removeListener('networkStatusChange', handleNetworkChange);
    };
  }, []);

  const retryConnection = async () => {
    const status = await Network.getStatus();
    setIsConnected(status.connected);
  };
  const openSetting = async () => {
    if (Capacitor.getPlatform() === 'android') {
      await Diagnostic.switchToMobileDataSettings();
    }

  };

  return (
    <>
      {!isConnected && (
        <>
          <div className="offline-overlay">
            <IonText>
              <h2>No Internet Connection</h2>
              <p>Please check your internet connection and try again.</p>
            </IonText>
            <IonFooter className="ion-footer">
              <IonToolbar className="ionFooterTwoButtons">
                
                {Capacitor.getPlatform() === 'android' && 
                <IonButton className="ion-button" color="primary" onClick={openSetting}>
                  <IonIcon icon={settings} slot="start" />settings
                </IonButton>
                }
                <IonButton  className="ion-button" color="medium" onClick={retryConnection}>
                  <IonIcon icon={refresh} slot="start" />Retry
                </IonButton>
              </IonToolbar>
            </IonFooter>
          </div>
        </>
      )}
    </>
  );
};

export default NetworkStatus;
