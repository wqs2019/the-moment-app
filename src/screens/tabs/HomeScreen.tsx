import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeIn, 
  SlideInRight, 
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/appStore';
import { RecommendationEngine } from '../../services/recommendation';
import { Task, TaskCategory, TaskScene } from '../../types/task';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

const { width, height } = Dimensions.get('window');

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CATEGORY_ICONS: Record<TaskCategory, keyof typeof Feather.glyphMap> = {
  '轻学习': 'book',
  '创作表达': 'edit-2',
  '社交连接': 'message-circle',
  '治愈放松': 'wind',
  '整理收纳': 'archive',
  '感官体验': 'eye',
};

const CATEGORY_THEMES: Record<TaskCategory, { primary: string; secondary: string }> = {
  '轻学习': { primary: '#3B82F6', secondary: '#93C5FD' }, // Blue
  '创作表达': { primary: '#EC4899', secondary: '#F9A8D4' }, // Pink
  '社交连接': { primary: '#10B981', secondary: '#6EE7B7' }, // Green
  '治愈放松': { primary: '#8B5CF6', secondary: '#C4B5FD' }, // Purple
  '整理收纳': { primary: '#F59E0B', secondary: '#FCD34D' }, // Amber
  '感官体验': { primary: '#F43F5E', secondary: '#FDA4AF' }, // Rose
};

const SCENE_FILTERS: { label: string; value: TaskScene | '全部' }[] = [
  { label: '推荐', value: '全部' },
  { label: '睡前', value: '睡前' },
  { label: '通勤', value: '通勤' },
  { label: '工作间隙', value: '工作间隙' },
  { label: '独处', value: '独处' },
  { label: '排队等待', value: '排队等待' },
];

export const HomeScreen = () => {
  const { colors, isDark } = useAppTheme();
  const preference = useAppStore((state) => state.preference);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeScene, setActiveScene] = useState<TaskScene | '全部'>('全部');

  // 呼吸悬浮动画
  const floatingY = useSharedValue(0);

  useEffect(() => {
    floatingY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [floatingY]);

  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatingY.value }],
    };
  });

  const loadRecommendations = useCallback(async (isLoadMore = false, scene: TaskScene | '全部' = activeScene) => {
    if (!isLoadMore) {
      setIsLoading(true);
    }

    try {
      // 如果选择了特定场景，则覆盖用户的默认偏好场景
      const targetScene = scene === '全部' ? preference?.targetScene : scene;
      
      const recommendedTasks = await RecommendationEngine.getRecommendations(
        preference?.identity,
        targetScene
      );
      
      if (isLoadMore) {
        setTasks(prev => [...prev, ...recommendedTasks]);
      } else {
        setTasks(recommendedTasks);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      if (!isLoadMore) {
        setIsLoading(false);
      }
    }
  }, [preference, activeScene]);

  useEffect(() => {
    loadRecommendations(false, activeScene);
  }, [activeScene]); // 当 activeScene 改变时重新加载

  const handleSkip = () => {
    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(prev => prev + 1);
      
      // 如果快到底了，提前静默加载更多
      if (currentIndex === tasks.length - 3) {
        loadRecommendations(true);
      }
    } else {
      // 如果真的到底了，重新加载
      loadRecommendations();
    }
  };

  const handleSceneChange = (scene: TaskScene | '全部') => {
    if (scene !== activeScene) {
      setActiveScene(scene);
    }
  };

  const handleStart = () => {
    if (tasks[currentIndex]) {
      navigation.navigate('TaskExecution', { task: tasks[currentIndex] });
    }
  };

  const renderSkeleton = () => {
    return (
      <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.cardWrapper}>
        <View style={[styles.cardInner, { backgroundColor: hexToRgba(colors.surface, isDark ? 0.4 : 0.7), borderColor: hexToRgba(colors.border, 0.5) }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.skeletonBlock, { width: 80, height: 32, borderRadius: 16, backgroundColor: colors.border }]} />
            <View style={[styles.skeletonBlock, { width: 60, height: 32, borderRadius: 16, backgroundColor: colors.border }]} />
          </View>
          <View style={[styles.skeletonBlock, { width: '90%', height: 40, borderRadius: 8, backgroundColor: colors.border, marginTop: 40, marginBottom: 16 }]} />
          <View style={[styles.skeletonBlock, { width: '100%', height: 20, borderRadius: 8, backgroundColor: colors.border, marginBottom: 10 }]} />
          <View style={[styles.skeletonBlock, { width: '80%', height: 20, borderRadius: 8, backgroundColor: colors.border, marginBottom: 60 }]} />
          <View style={styles.cardFooter}>
            <View style={[styles.skeletonBlock, { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.border }]} />
            <View style={[styles.skeletonBlock, { flex: 1, height: 60, borderRadius: 30, backgroundColor: colors.border, marginLeft: 16 }]} />
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCurrentTask = () => {
    if (tasks.length === 0 || !tasks[currentIndex]) return null;
    
    const task = tasks[currentIndex];
    const iconName = CATEGORY_ICONS[task.category] || 'star';
    const theme = CATEGORY_THEMES[task.category] || CATEGORY_THEMES['治愈放松'];
    
    return (
      <Animated.View 
        key={task.id} 
        entering={SlideInRight.springify().damping(20).stiffness(400).mass(0.6)} 
        exiting={SlideOutLeft.duration(150)}
        style={[styles.cardWrapper, floatingStyle, { shadowColor: theme.primary }]}
      >
        {/* 内部彩色光晕，创造 Mesh Gradient 效果 */}
        <View style={styles.meshContainer}>
          <View style={[styles.meshBlob, { backgroundColor: theme.primary, top: -40, left: -40 }]} />
          <View style={[styles.meshBlob, { backgroundColor: theme.secondary, bottom: -40, right: -40 }]} />
        </View>

        <BlurView
          intensity={isDark ? 60 : 90}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.cardInner,
            {
              backgroundColor: hexToRgba(colors.surface, isDark ? 0.3 : 0.6),
              borderColor: hexToRgba(colors.border, isDark ? 0.3 : 0.8),
            }
          ]}
        >
          {/* 巨大的能量水印 */}
          <Text style={[styles.watermark, { color: theme.primary }]}>+{task.energyValue}</Text>

          <View style={styles.cardHeader}>
            <View style={[styles.glassTag, { backgroundColor: hexToRgba(theme.primary, 0.15), borderColor: hexToRgba(theme.primary, 0.3) }]}>
              <Feather name={iconName} size={14} color={theme.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.glassTagText, { color: theme.primary }]}>{task.category}</Text>
            </View>
            <View style={[styles.glassTag, { backgroundColor: hexToRgba(colors.surface, 0.5), borderColor: hexToRgba(colors.border, 0.5) }]}>
              <Feather name="clock" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.glassTagText, { color: colors.textSecondary }]}>{task.durationMinutes} 分钟</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
            <Text style={[styles.taskDesc, { color: colors.textSecondary }]}>
              {task.description}
            </Text>
          </View>

          {/* 操作按钮直接集成在卡片内部 */}
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={[styles.skipBtn, { backgroundColor: hexToRgba(colors.surface, 0.6), borderColor: hexToRgba(colors.border, 0.5) }]} 
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Feather name="x" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.startBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]} 
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={styles.startBtnText}>开始行动</Text>
              <Feather name="arrow-right" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 顶部背景装饰 */}
      <View style={[styles.bgBlob, { backgroundColor: hexToRgba(colors.primary, 0.15), top: -100, left: -50 }]} />
      <View style={[styles.bgBlob, { backgroundColor: hexToRgba('#10B981', 0.12), top: height * 0.3, right: -100 }]} />

      <View style={styles.content}>
        <View style={{ zIndex: 10 }}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {preference?.identity === '职场新人' ? '辛苦了，' : '你好，'}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              与其漫无目的地刷，{'\n'}不如做件小事吧。
            </Text>
          </Animated.View>

          {/* 场景筛选器 */}
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.filterWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {SCENE_FILTERS.map((filter) => {
                const isActive = activeScene === filter.value;
                return (
                  <TouchableOpacity
                    key={filter.value}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive ? colors.primary : hexToRgba(colors.surface, isDark ? 0.5 : 0.8),
                        borderColor: isActive ? colors.primary : hexToRgba(colors.border, 0.5),
                      }
                    ]}
                    onPress={() => handleSceneChange(filter.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterText,
                      { color: isActive ? '#FFF' : colors.textSecondary }
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>

        <View style={styles.cardContainer}>
          {isLoading ? renderSkeleton() : renderCurrentTask()}
        </View>

        <Animated.View entering={FadeIn.delay(600)} style={styles.giveUpContainer}>
          <TouchableOpacity style={styles.giveUpButton} activeOpacity={0.6}>
            <Text style={[styles.giveUpText, { color: colors.textSecondary }]}>
              算了，我还是去刷手机
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgBlob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    filter: 'blur(100px)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 0,
  },
  filterWrapper: {
    marginTop: 12,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 42,
    letterSpacing: 0.5,
  },
  filterContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    zIndex: 1,
  },
  cardWrapper: {
    width: '100%',
    height: height * 0.54,
    maxHeight: 480,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
    backgroundColor: 'transparent',
  },
  meshContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#FFF', // 浅色模式底色
  },
  meshBlob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    filter: 'blur(60px)',
    opacity: 0.6,
  },
  cardInner: {
    padding: 28,
    borderWidth: 1.5,
    borderRadius: 40,
    flex: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -20,
    bottom: 80,
    fontSize: 140,
    fontWeight: '900',
    fontStyle: 'italic',
    opacity: 0.08,
    letterSpacing: -5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  glassTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  glassTagText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
    zIndex: 1,
  },
  taskTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
    lineHeight: 42,
    letterSpacing: 1,
  },
  taskDesc: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    opacity: 0.9,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
  skipBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  giveUpContainer: {
    alignItems: 'center',
    marginBottom: 20, // 增加底部边距，避免被 TabBar 遮挡
  },
  giveUpButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  giveUpText: {
    fontSize: 14,
    fontWeight: '400',
    textDecorationLine: 'underline',
    opacity: 0.6, // 进一步弱化视觉层级
  },
  skeletonBlock: {
    opacity: 0.5,
  },
});

export default HomeScreen;