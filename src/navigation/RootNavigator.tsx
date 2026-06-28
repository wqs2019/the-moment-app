import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import MainTabsScreen from '../screens/tabs/MainTabsScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { TaskExecutionScreen } from '../screens/execution/TaskExecutionScreen';
import { useAppStore } from '../store/appStore';
import { Task } from '../types/task';

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Onboarding: undefined;
  TaskExecution: { task: Task };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const preference = useAppStore((state) => state.preference);

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
      ) : !preference?.isOnboarded ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <Stack.Group>
          <Stack.Screen
            name="MainTabs"
            component={MainTabsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="TaskExecution"
            component={TaskExecutionScreen}
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom'
            }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};
