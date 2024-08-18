# Test creds
kdfreeman@landscape.com  / Join@1234
edsmith@landscape.com  / Join@1234
zayed@landscape.com  / Join@1234
rafi@landscape.com / Join@1234


Icons 
https://capacitorjs.com/docs/guides/splash-screens-and-icons

assets/
├── icon-only.png
├── icon-foreground.png
├── icon-background.png
├── splash.png
└── splash-dark.png

Icon files should be at least 1024px x 1024px.
Splash screen files should be at least 2732px x 2732px.
The format can be jpg or png.

npx capacitor-assets generate

## Android Build Steps 
npx cap add android
npx capacitor-assets generate
ionic build 
npx cap sync
npx cap open android

open in Android Studio
npx cap open android


# Fixes to be made in Android Studio 
(Add any manifest.xml changes , add google-services.json to app, open manifest , suppress the error under photopicker , variables.gradle to have installed sdk version for compileSdkVersion)

CLI Build:
syntax: npx cap build [options] <platform>


npx cap build --keystorepath "/certs/rak-pestcontrol"  --keystorepass 123456  --keystorealias key1 --keystorealiaspass 123456 --androidreleasetype APK  android


npx cap build --keystorepath "/Users/jay/workspace/certs/rak-pestcontrol"  --keystorepass 123456  --keystorealias key1 --keystorealiaspass 123456  --androidreleasetype APK  android


Options:
--scheme <scheme-to-build>: iOS Scheme to build (default is App)
--flavor <flavor-to-build>: Android Flavor to build
--keystorepath <path>: Path to the keystore file
--keystorepass <keystore-password>: Password to the keystore
--keystorealias <alias>: Key alias in the keystore
--keystorealiaspass <alias-password>: Password for the keystore alias
--androidreleasetype <release-type>: Can be either AAB or APK


npx cap add android
## Android Build Steps 

ionic build 
npx cap sync

npx cap open android
(Add any manifest.xml changes , add google-services.json to app, open manifest , suppress the error under photopicker , variables.gradle to have installed sdk version for compileSdkVersion)
