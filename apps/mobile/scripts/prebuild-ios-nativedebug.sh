#!/bin/bash

# Allows the build to have the JS bundle packaged as in a release build,
# but still allows native debugging in Xcode.
#
# Before using this, expo-dev-client must be uninstalled.
#
DEBUG=expo:* RELEASE=1 EX_UPDATES_NATIVE_DEBUG=1 npx expo prebuild --clean -p ios

