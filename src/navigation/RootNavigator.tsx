import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import MainTabsScreen from '../screens/tabs/MainTabsScreen';

export type RootStackParamList = {
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
