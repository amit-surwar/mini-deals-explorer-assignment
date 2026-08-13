// Jest runs on Node, whose fetch/streams/URL are already spec-compliant —
// and msw/node intercepts Node's own fetch. The React Native polyfills must
// therefore NOT load in tests; jest.config.js maps them to this no-op stub.
module.exports = { polyfill: () => {} };
