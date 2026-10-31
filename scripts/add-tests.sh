#!/usr/bin/env bash
# Installs the test tools (Jest, jest-expo, Testing Library) and wires up `npm test`.
set -e
npx expo install jest-expo jest @types/jest --dev
REACT_VERSION=$(node -p "require('react/package.json').version")
npm install --save-dev @testing-library/react-native "react-test-renderer@${REACT_VERSION}"
node scripts/configure.js
echo "Test tools installed. Run: npm test"
