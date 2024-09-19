#!/bin/bash

# Allows the build to have the JS bundle packaged as in a release build,
# but still allows native debugging in Android Studio.
#
# Before using this, expo-dev-client must be uninstalled.
#
DEBUG=expo:* RELEASE=1 GOOGLE_SERVICES_JSON=~/google-services-microfoam.json npx expo prebuild --clean -p android

echo 'EX_UPDATES_NATIVE_DEBUG=1' >> android/gradle.properties

sed -i '' 's/\/\/ debuggableVariants = .*$/  debuggableVariants = []/;' android/app/build.gradle
