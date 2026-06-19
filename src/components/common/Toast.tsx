import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ToastOptions>({ message: '', type: 'info' });
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [opacity, translateY]);

  const showToast = useCallback(
    (nextOptions: ToastOptions | string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const parsedOptions = typeof nextOptions === 'string' ? { message: nextOptions, type: 'info' as ToastType } : nextOptions;
      const duration = parsedOptions.duration ?? 2200;

      setOptions(parsedOptions);
      setVisible(true);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hide();
      }, duration);
    },
    [hide, opacity, translateY],
  );

  const iconName = options.type === 'success'
    ? 'checkmark-circle'
    : options.type === 'error'
      ? 'close-circle'
      : 'information-circle';
  const iconColor = options.type === 'success'
    ? colors.success
    : options.type === 'error'
      ? colors.danger
      : colors.primary;

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success: (message) => showToast({ message, type: 'success' }),
        error: (message) => showToast({ message, type: 'error' }),
        info: (message) => showToast({ message, type: 'info' }),
        hide,
      }}
    >
      {children}
      {visible ? (
        <View style={[styles.container, { top: Math.max(insets.top, 20) + 10 }]} pointerEvents="none">
          <Animated.View
            style={[
              styles.toast,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Ionicons name={iconName} size={22} color={iconColor} style={styles.icon} />
            <Text style={[styles.message, { color: colors.text }]}>{options.message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '85%',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
});
