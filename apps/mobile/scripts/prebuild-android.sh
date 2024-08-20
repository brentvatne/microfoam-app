#!/bin/bash

RELEASE=1 GOOGLE_SERVICES_JSON=~/google-services-microfoam.json npx expo prebuild --clean -p android

echo 'EX_UPDATES_NATIVE_DEBUG=1' >> android/gradle.properties

sed -i '' 's/\/\/ debuggableVariants = .*$/  debuggableVariants = []/;' android/app/build.gradle
