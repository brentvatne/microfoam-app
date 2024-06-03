#!/bin/bash

npx expo prebuild --clean -p android

echo 'EX_UPDATES_NATIVE_DEBUG=1' >> android/gradle.properties

sed -i '' 's/\/\/ debuggableVariants = .*$/  debuggableVariants = []/;' android/app/build.gradle