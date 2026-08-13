const expoPreset = require("jest-expo/jest-preset");

// jest-expo's babel transform only matches .js/.ts(x); msw ships ESM-only
// dependencies as .mjs, so widen the pattern (same babel-jest options).
const transform = { ...expoPreset.transform };
const babelEntry = transform["\\.[jt]sx?$"];
delete transform["\\.[jt]sx?$"];
transform["\\.m?[jt]sx?$"] = babelEntry;

module.exports = {
  preset: "jest-expo",
  transform,
  moduleNameMapper: {
    // Node's fetch/streams are already spec-compliant; the RN polyfills must
    // not replace them in tests (msw/node intercepts Node's own fetch).
    "^react-native-polyfill-globals/src/.*$": "<rootDir>/jest.polyfillStub.js",
    "^@/(.*)$": "<rootDir>/$1",
    "^@react-native-async-storage/async-storage$":
      "@react-native-async-storage/async-storage/jest/async-storage-mock",
    // msw/node maps "react-native" to null in its exports, so jest-expo's
    // react-native-condition resolver can't see it; point at the CJS build.
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // jest-expo's default whitelist plus msw and its ESM-only dependencies.
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|msw|@mswjs|@open-draft|rettime|until-async|strict-event-emitter|outvariant|is-node-process|statuses|@bundled-es-modules))",
    "/node_modules/react-native-reanimated/plugin/",
  ],
  testTimeout: 30000,
};
