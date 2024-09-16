#!/bin/bash

# Function to check if a path is a symlink
is_symlink() {
    [ -L "$1" ]
}

# Function to handle each directory
handle_directory() {
    local dir="$1"
    local target="$2"

    if is_symlink "$dir"; then
        echo "Symlink already exists: $dir"
    else
        echo "Setting up symlink for $dir -> $target"
        rm -rf "$dir" && ln -s "$target" "$dir"
    fi
}

# Main execution
echo "Setting up monorepo symlinks for devving expo-notifications. Always run from repo root."

handle_directory "node_modules/expo-notifications" "../expo/packages/expo-notifications"
# may or may not be needed
handle_directory "node_modules/expo-modules-test-core" "../expo/packages/expo-modules-test-core"
handle_directory "node_modules/expo-modules-core" "../expo/packages/expo-modules-core"
handle_directory "node_modules/expo" "../expo/packages/expo"
handle_directory "node_modules/expo-updates" "../expo/packages/expo-updates"

echo "Done."./
