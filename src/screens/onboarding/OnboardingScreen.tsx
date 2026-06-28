import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform, Image, FlatList, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeInDown, FadeOut, useSharedValue, useAnimatedStyle,
  interpolate, Extrapolation, useAnimatedScrollHandler, withSpring
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/appStore';
import { TargetAudience, TaskScene } from '../../types/task';

const { width, height } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const WELCOME_SLIDES = [
  {
    id: '1',
    title: '无意识的滑动',
    text: '你每天会解锁手机很多次，\n但大多数时候，\n你也不知道自己到底想看什么。',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: '夺回控制权',
    text: '下次伸手拿手机的时候，\n先别刷啦。\n我们给你一个更好的选择。',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: '微小的改变',
    text: '一个 1 分钟的小动作，\n可能比刷 30 分钟\n更能让你恢复状态。',
    image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=800&auto=format&fit=crop',
  },
];

const IDENTITY_OPTIONS: { label: TargetAudience; icon: keyof typeof Feather.glyphMap }[] = [
  { label: '大学生', icon: 'book-open' },
  { label: '职场新人', icon: 'briefcase' },
  { label: '资深打工人', icon: 'coffee' },
  { label: '年轻父母', icon: 'users' },
  { label: '通用', icon: 'smile' },
];

const SCENE_OPTIONS: { label: string; value: TaskScene; icon: keyof typeof Feather.glyphMap }[] = [
  { label: '睡前总刷', value: '睡前', icon: 'moon' },
  { label: '通勤无聊', value: '通勤', icon: 'navigation' },
  { label: '工作间隙换脑子', value: '工作间隙', icon: 'cpu' },
  { label: '独处时无意识刷', value: '独处', icon: 'user' },
  { label: '随时随地会刷', value: '通用', icon: 'smartphone' },
];

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const WelcomeSlide = ({ item, index, scrollX, colors }: any) => {
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateX = interpolate(scrollX.value, inputRange, [width * 0.5, 0, -width * 0.5], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [1.2, 1, 1.2], Extrapolation.CLAMP);
    return {
      transform: [{ translateX }, { scale }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.slide}>
      <View style={styles.imageWrapper}>
        <Animated.Image source={{ uri: item.image }} style={[styles.image, imageAnimatedStyle]} />
        <View style={styles.imageOverlay} />
      </View>
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.slideText, { color: colors.textSecondary }]}>{item.text}</Text>
      </Animated.View>
    </View>
  );
};

const PaginationDot = ({ index, scrollX, colors }: any) => {
  const dotAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
    return {
      width: dotWidth,
      opacity,
    };
  });
  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: colors.primary },
        dotAnimatedStyle,
      ]}
    />
  );
};

export const OnboardingScreen = () => {
  const { colors, isDark } = useAppTheme();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  
  const [step, setStep] = useState<'welcome' | 'identity' | 'scene'>('welcome');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedIdentity, setSelectedIdentity] = useState<TargetAudience | null>(null);
  const [selectedScene, setSelectedScene] = useState<TaskScene | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentSlideIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNextSlide = () => {
    if (currentSlideIndex < WELCOME_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentSlideIndex + 1,
        animated: true,
      });
    } else {
      setStep('identity');
    }
  };

  const handleComplete = () => {
    completeOnboarding({
      identity: selectedIdentity || '通用',
      targetScene: selectedScene || '通用',
      isOnboarded: true,
    });
  };

  const renderWelcome = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <AnimatedFlatList
        ref={flatListRef}
        data={WELCOME_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item, index }: any) => (
          <WelcomeSlide item={item} index={index} scrollX={scrollX} colors={colors} />
        )}
      />
      
      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {WELCOME_SLIDES.map((_, index) => (
            <PaginationDot key={index} index={index} scrollX={scrollX} colors={colors} />
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleNextSlide}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentSlideIndex === WELCOME_SLIDES.length - 1 ? '开始设置' : '继续'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderIdentity = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <View style={styles.questionContainer}>
        <Animated.Text entering={FadeInDown.delay(200)} style={[styles.questionTitle, { color: colors.text }]}>
          你的身份是？
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300)} style={[styles.questionSubtitle, { color: colors.textSecondary }]}>
          这能帮助我们推荐更适合你的小任务
        </Animated.Text>

        <View style={styles.optionsGrid}>
          {IDENTITY_OPTIONS.map((option, index) => {
            const isSelected = selectedIdentity === option.label;
            return (
              <Animated.View key={option.label} entering={FadeInDown.delay(400 + index * 100)}>
                <TouchableOpacity
                  style={[
                    styles.optionCardWrapper,
                    {
                      borderColor: isSelected ? colors.primary : hexToRgba(colors.border, 0.5),
                      borderWidth: 1.5,
                    }
                  ]}
                  onPress={() => setSelectedIdentity(option.label)}
                  activeOpacity={0.7}
                >
                  <BlurView
                    intensity={isSelected ? 40 : 20}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? hexToRgba(colors.primary, 0.15) : hexToRgba(colors.surface, 0.5),
                      }
                    ]}
                  >
                    <Feather name={option.icon} size={24} color={isSelected ? colors.primary : colors.textSecondary} style={{ marginBottom: 12 }} />
                    <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.text }]}>
                      {option.label}
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: selectedIdentity ? colors.primary : colors.border }
          ]}
          onPress={() => selectedIdentity && setStep('scene')}
          disabled={!selectedIdentity}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.buttonText,
            { color: selectedIdentity ? '#FFFFFF' : colors.textSecondary }
          ]}>下一步</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderScene = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <View style={styles.questionContainer}>
        <Animated.Text entering={FadeInDown.delay(200)} style={[styles.questionTitle, { color: colors.text }]}>
          你最想改变哪个场景？
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300)} style={[styles.questionSubtitle, { color: colors.textSecondary }]}>
          我们会优先在这些时刻提醒你
        </Animated.Text>

        <View style={styles.optionsList}>
          {SCENE_OPTIONS.map((option, index) => {
            const isSelected = selectedScene === option.value;
            return (
              <Animated.View key={option.value} entering={FadeInDown.delay(400 + index * 100)}>
                <TouchableOpacity
                  style={[
                    styles.optionRowWrapper,
                    {
                      borderColor: isSelected ? colors.primary : hexToRgba(colors.border, 0.5),
                      borderWidth: 1.5,
                    }
                  ]}
                  onPress={() => setSelectedScene(option.value)}
                  activeOpacity={0.7}
                >
                  <BlurView
                    intensity={isSelected ? 40 : 20}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected ? hexToRgba(colors.primary, 0.15) : hexToRgba(colors.surface, 0.5),
                      }
                    ]}
                  >
                    <View style={styles.optionRowLeft}>
                      <Feather name={option.icon} size={20} color={isSelected ? colors.primary : colors.textSecondary} style={{ marginRight: 12 }} />
                      <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.text }]}>
                        {option.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Animated.View entering={FadeIn}>
                        <Feather name="check-circle" size={20} color={colors.primary} />
                      </Animated.View>
                    )}
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: selectedScene ? colors.primary : colors.border }
          ]}
          onPress={handleComplete}
          disabled={!selectedScene}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.buttonText,
            { color: selectedScene ? '#FFFFFF' : colors.textSecondary }
          ]}>完成设置</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {step === 'welcome' && renderWelcome()}
      {step === 'identity' && renderIdentity()}
      {step === 'scene' && renderScene()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  slide: {
    width,
    flex: 1,
  },
  imageWrapper: {
    width: width - 48,
    height: height * 0.45,
    borderRadius: 32,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 40,
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  textContainer: {
    paddingHorizontal: 32,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
  },
  slideText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: height * 0.08,
  },
  questionTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  questionSubtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    width: (width - 64 - 12) / 2,
  },
  optionCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  optionsList: {
    gap: 12,
  },
  optionRowWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  optionRow: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});