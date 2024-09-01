#!/bin/bash

DEBUG=expo:* RELEASE=1 EX_UPDATES_NATIVE_DEBUG=1 npx expo prebuild --clean -p ios
#DEBUG=expo:* RELEASE=1 npx expo prebuild --clean -p ios
