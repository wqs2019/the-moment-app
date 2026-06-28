import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Platform, View, Animated, Easing, Pressable, Text, AccessibilityInfo } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { HomeScreen } from './HomeScreen';
import { WorkspaceScreen } from './WorkspaceScreen';
import { ServiceScreen } from './ServiceScreen';
import { MeScreen } from './MeScreen';

type MainTabParamList = {
  Home: undefined;
  Workspace: undefined;
  Service: undefined;
  Me: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_MAP: Record<keyof MainTabParamList, { default: React.ComponentProps<typeof Ionicons>['name']; active: React.ComponentProps<typeof Ionicons>['name'] }> = {
  Home: { default: 'home-outline', active: 'home' },
  Workspace: { default: 'grid-outline', active: 'grid' },
  Service: { default: 'server-outline', active: 'server' },
  Me: { default: 'person-outline', active: 'person' },
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  const value = parseInt(fullHex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useAppTheme();
  const tabScaleMapRef = useRef<Record<string, Animated.Value>>({});
  const shellScale = useRef(new Animated.Value(1)).current;
  const shellLift = useRef(new Animated.Value(0)).current;
  const shellGlow = useRef(new Animated.Value(0.14)).current;
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  const getTabScale = (routeKey: string) => {
    if (!tabScaleMapRef.current[routeKey]) {
      tabScaleMapRef.current[routeKey] = new Animated.Value(1);
    }
    return tabScaleMapRef.current[routeKey];
  };

  const animateTabScale = (routeKey: string, toValue: number, bounciness: number) => {
    Animated.spring(getTabScale(routeKey), {
      toValue,
      bounciness,
      speed: 22,
      useNativeDriver: true,
    }).start();
  };

  const animateShellPress = useCallback(
    (pressed: boolean) => {
      if (reduceMotionEnabled) {
        shellScale.setValue(1);
        shellLift.setValue(0);
        shellGlow.setValue(0.16);
        return;
      }

      Animated.parallel([
        Animated.spring(shellScale, {
          toValue: pressed ? 0.985 : 1,
          speed: 22,
          bounciness: pressed ? 0 : 10,
          useNativeDriver: false,
        }),
        Animated.spring(shellLift, {
          toValue: pressed ? -2 : 0,
          speed: 18,
          bounciness: pressed ? 0 : 8,
          useNativeDriver: false,
        }),
        Animated.timing(shellGlow, {
          toValue: pressed ? 0.26 : 0.16,
          duration: pressed ? 120 : 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    },
    [reduceMotionEnabled, shellGlow, shellLift, shellScale]
  );

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled: boolean) => {
        if (isMounted) {
          setReduceMotionEnabled(enabled);
        }
      })
      .catch(() => {
        if (isMounted) {
          setReduceMotionEnabled(false);
        }
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled: boolean) => {
      setReduceMotionEnabled(enabled);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotionEnabled) {
      shellScale.setValue(1);
      shellLift.setValue(0);
      shellGlow.setValue(0.16);
      return;
    }

    Animated.sequence([
      Animated.timing(shellGlow, {
        toValue: 0.22,
        duration: 110,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(shellGlow, {
        toValue: 0.16,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [reduceMotionEnabled, shellGlow, shellLift, shellScale, state.index]);

  return (
    <View pointerEvents="box-none" style={styles.tabBarOuter}>
      <SafeAreaView edges={['bottom']} style={styles.tabBarSafeArea}>
        <AnimatedBlurView
          intensity={35}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.blurShell,
            {
              borderColor: hexToRgba(colors.border, isDark ? 0.68 : 0.85),
              backgroundColor: hexToRgba(colors.surface, isDark ? 0.36 : 0.6),
              transform: [{ translateY: shellLift }, { scale: shellScale }],
            },
          ]}
        >
          <View style={styles.tabBarRow}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const tabLabel = options.tabBarLabel as string || options.title || route.name;
              const isFocused = state.index === index;
              const iconPair = TAB_ICON_MAP[route.name as keyof MainTabParamList];
              const iconName = isFocused ? iconPair.active : iconPair.default;

              const handleTabPress = () => {
                const tabPressEvent = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !tabPressEvent.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const handleTabLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              return (
                <Pressable
                  key={route.key}
                  onLongPress={handleTabLongPress}
                  onPressIn={() => {
                    animateTabScale(route.key, 0.92, 0);
                    animateShellPress(true);
                  }}
                  onPress={handleTabPress}
                  onPressOut={() => {
                    animateTabScale(route.key, 1, 12);
                    animateShellPress(false);
                  }}
                  style={styles.tabButton}
                >
                  <Animated.View
                    style={[
                      styles.tabButtonInner,
                      {
                        backgroundColor: isFocused
                          ? hexToRgba(colors.primary, isDark ? 0.2 : 0.14)
                          : 'transparent',
                        minWidth: isFocused ? 84 : 68,
                        transform: [{ scale: getTabScale(route.key) }],
                      },
                    ]}
                  >
                    <View style={styles.tabIconWrapper}>
                      <Ionicons
                        name={iconName}
                        size={20}
                        color={isFocused ? colors.primary : colors.textSecondary}
                        style={styles.tabIcon}
                      />
                    </View>
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color: isFocused ? colors.primary : colors.textSecondary,
                        },
                      ]}
                    >
                      {tabLabel}
                    </Text>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </AnimatedBlurView>
      </SafeAreaView>
    </View>
  );
};

const MainTabsScreen: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页', tabBarLabel: '首页' }} />
      <Tab.Screen name="Workspace" component={WorkspaceScreen} options={{ title: '工作台', tabBarLabel: '工作台' }} />
      <Tab.Screen name="Service" component={ServiceScreen} options={{ title: '服务', tabBarLabel: '服务' }} />
      <Tab.Screen name="Me" component={MeScreen} options={{ title: '我的', tabBarLabel: '我的' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarSafeArea: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 0 : 12,
  },
  blurShell: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 26,
  },
  tabBarRow: {
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 24,
    overflow: 'visible',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIcon: {
    lineHeight: 20,
  },
});

export default MainTabsScreen;