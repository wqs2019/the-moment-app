import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import StartupScreen from './src/components/common/StartupScreen';
import { ToastProvider } from './src/components/common/Toast';
import { useAppTheme } from './src/hooks/useAppTheme';
import { Navigation } from './src/navigation';
import { useAppStore } from './src/store/appStore';

const Bootstrap = () => {
  const initializeApp = useAppStore((state) => state.initializeApp);
  const initialized = useAppStore((state) => state.initialized);

  React.useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  if (!initialized) {
    return <StartupScreen />;
  }

  return <Navigation />;
};

export default function App() {
  const { isDark } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Bootstrap />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
