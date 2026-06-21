import 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-get-random-values';

import { registerRootComponent } from 'expo';

if (typeof globalThis.process === 'object' && typeof globalThis.process.getBuiltinModule !== 'function') {
  globalThis.process.getBuiltinModule = () => undefined;
}

const { default: App } = require('./App');

registerRootComponent(App);
