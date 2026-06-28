import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/appStore';

const { width, height } = Dimensions.get('window');

export const LoginScreen = () => {
  const { colors, isDark } = useAppTheme();
  const setLoggedIn = useAppStore((state) => state.setLoggedIn);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleAuthAvailable(available);
    };
    checkAvailability();
  }, []);

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      console.log(credential);
      setLoggedIn(true);
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        console.error(e);
      }
    }
  };

  const handleFallbackLogin = () => {
    setLoggedIn(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ambient Background Blobs */}
      <Animated.View 
        entering={FadeIn.duration(1500)} 
        style={[styles.blob1, { backgroundColor: colors.primary }]} 
      />
      <Animated.View 
        entering={FadeIn.duration(1500).delay(300)} 
        style={[styles.blob2, { backgroundColor: colors.success }]} 
      />
      <Animated.View 
        entering={FadeIn.duration(1500).delay(600)} 
        style={[styles.blob3, { backgroundColor: colors.primary }]} 
      />
      
      <BlurView 
        intensity={isDark ? 60 : 100} 
        tint={isDark ? 'dark' : 'light'} 
        style={StyleSheet.absoluteFill} 
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.topSection}>
            {/* Logo */}
            <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={styles.logoContainer}>
              <View style={[styles.logoIconWrapper, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                <Feather name="wind" size={42} color={colors.primary} />
              </View>
            </Animated.View>

            {/* Typography */}
            <Animated.View entering={FadeInDown.delay(400).duration(800).springify()} style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>别刷啦</Text>
              <Text style={[styles.slogan, { color: colors.textSecondary }]}>
                把碎片时间还给自己
              </Text>
            </Animated.View>

            {/* Quote Card */}
            <Animated.View entering={FadeInDown.delay(600).duration(800).springify()} style={styles.quoteContainer}>
              <View style={[styles.quoteCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}>
                <Feather name="message-circle" size={20} color={colors.primary} style={styles.quoteIcon} />
                <Text style={[styles.quote, { color: colors.text }]}>
                  "一个 1 分钟的小动作，{'\n'}可能比刷 30 分钟更能让你恢复状态。"
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(800).duration(800).springify()} style={styles.bottomContainer}>
            {isAppleAuthAvailable ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={
                  isDark
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={100}
                style={styles.appleButton}
                onPress={handleAppleLogin}
              />
            ) : (
              <TouchableOpacity 
                style={[styles.fallbackButton, { backgroundColor: colors.primary }]}
                onPress={handleFallbackLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.fallbackButtonText}>进入应用</Text>
              </TouchableOpacity>
            )}
            
            <Text style={[styles.agreementText, { color: colors.textSecondary }]}>
              登录即代表同意 <Text style={{ color: colors.primary, fontWeight: '600' }}>用户协议</Text> 和 <Text style={{ color: colors.primary, fontWeight: '600' }}>隐私政策</Text>
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  blob1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    top: -width * 0.5,
    left: -width * 0.5,
    opacity: 0.18,
  },
  blob2: {
    position: 'absolute',
    width: width * 1.6,
    height: width * 1.6,
    borderRadius: width * 0.8,
    bottom: -width * 0.4,
    right: -width * 0.5,
    opacity: 0.14,
  },
  blob3: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    top: height * 0.3,
    left: width * 0.1,
    opacity: 0.14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: height * 0.08,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  topSection: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 17,
    letterSpacing: 1,
    fontWeight: '500',
  },
  quoteContainer: {
    width: '100%',
  },
  quoteCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  quote: {
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.9,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  appleButton: {
    width: '100%',
    height: 56,
    marginBottom: 24,
  },
  fallbackButton: {
    width: '100%',
    height: 56,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  fallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  agreementText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});