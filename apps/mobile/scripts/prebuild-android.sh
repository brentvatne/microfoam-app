#!/bin/bash

DEBUG=expo:* RELEASE=1 GOOGLE_SERVICES_JSON=~/google-services-microfoam.json npx expo prebuild --clean -p android
