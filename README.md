# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   bun install
   ```

2. Start the app

   ```bash
    bunx expo
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
bun run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# Expo App Deployment Guide

This guide will walk you through the process of deploying your Expo app to both the Google Play Store and Apple App Store using EAS (Expo Application Services).

## Prerequisites

1. Install EAS CLI globally:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account:

```bash
eas login
```

3. Configure your app.json with the necessary build settings:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

## Building for Android (Play Store)

1. Configure EAS build for Android:

```bash
eas build:configure
```

2. Create a build for Android:

```bash
eas build --platform android
```

3. After the build completes, download the APK or AAB file from the EAS dashboard.

4. To submit to the Play Store:
   - Go to the [Google Play Console](https://play.google.com/console)
   - Create a new app or select an existing one
   - Navigate to "Production" > "Create new release"
   - Upload your AAB file
   - Fill in the required information (release notes, content rating, etc.)
   - Submit for review

## Building for iOS (App Store)

1. Configure EAS build for iOS:

```bash
eas build:configure
```

2. Create a build for iOS:

```bash
eas build --platform ios
```

3. After the build completes, download the IPA file from the EAS dashboard.

4. To submit to the App Store:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create a new app or select an existing one
   - Upload your IPA file using Transporter or Xcode
   - Fill in the required information (description, screenshots, etc.)
   - Submit for review

## EAS Build Configuration

Create an `eas.json` file in your project root with the following configuration:

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Important Notes

1. **App Signing**:

   - For Android: You'll need a keystore file. EAS can generate one for you or you can use your own.
   - For iOS: You'll need an Apple Developer account and the necessary certificates and provisioning profiles.

2. **App Icons and Splash Screen**:

   - Make sure to provide high-quality app icons and splash screens in the correct sizes.
   - For Android, include adaptive icons.

3. **Privacy Policy and Terms of Service**:

   - Both stores require a privacy policy URL.
   - Make sure to have these documents ready before submission.

4. **Testing**:
   - Always test your builds thoroughly before submission.
   - Use EAS Update for quick testing of changes.

## Troubleshooting

1. If you encounter build errors:

   - Check the EAS build logs for detailed error messages
   - Ensure all dependencies are properly installed
   - Verify your app.json configuration

2. For submission issues:
   - Review the store guidelines carefully
   - Check for common rejection reasons
   - Make sure all required metadata is provided

## Additional Resources

- [EAS Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Expo Deployment Guide](https://docs.expo.dev/distribution/app-stores/)

Remember to keep your app's version number updated in app.json before each new release.
