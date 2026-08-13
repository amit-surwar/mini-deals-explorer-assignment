// These polyfill packages ship no type declarations; each exposes a
// `polyfill()` that installs spec-compliant globals on Hermes.
declare module "react-native-polyfill-globals/src/encoding" {
  export function polyfill(): void;
}
declare module "react-native-polyfill-globals/src/url" {
  export function polyfill(): void;
}
declare module "react-native-polyfill-globals/src/readable-stream" {
  export function polyfill(): void;
}
declare module "react-native-polyfill-globals/src/fetch" {
  export function polyfill(): void;
}
