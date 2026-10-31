#!/usr/bin/env bash
# One-time setup. Run from the repo root after unzipping the project files into it.
set -e
rm -rf /tmp/expo-base
npx --yes create-expo-app@latest /tmp/expo-base --template blank-typescript --no-install
cp -n /tmp/expo-base/package.json /tmp/expo-base/app.json /tmp/expo-base/tsconfig.json .
cp -rn /tmp/expo-base/assets . 2>/dev/null || true
cp -n /tmp/expo-base/.gitignore . 2>/dev/null || true
npm install
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants \
  expo-status-bar expo-secure-store expo-local-authentication @expo/vector-icons react-native-web react-dom @expo/metro-runtime
node scripts/configure.js
bash scripts/add-tests.sh
echo "Setup complete. Start the app with: npx expo start --web"
