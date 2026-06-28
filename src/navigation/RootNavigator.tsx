import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import MainTabsScreen from '../screens/tabs/MainTabsScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { useAppStore } from '../store/appStore';

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);

  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
      {!isLoggedIn ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="MainTabs"
          component={MainTabsScreen}
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
};
