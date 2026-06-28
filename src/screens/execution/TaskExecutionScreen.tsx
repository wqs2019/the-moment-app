import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { 
  FadeIn, 
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { Audio } from 'expo-av';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/appStore';
import { useRecordStore } from '../../store/recordStore';
import { useToast } from '../../components/common/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskExecution'>;

const { width, height } = Dimensions.get('window');

const NOISE_OPTIONS = [
  { id: 'none', label: '无', icon: 'volume-x' },
  { id: 'rain', label: '雨声', icon: 'cloud-rain' },
  { id: 'fire', label: '篝火', icon: 'sun' },
  { id: 'cafe', label: '咖啡馆', icon: 'coffee' },
];

export const TaskExecutionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { task } = route.params;
  const { colors } = useAppTheme();
  const toast = useToast();
  const addCompletedTask = useRecordStore((state) => state.addCompletedTask);
  const addScrolledScreen = useRecordStore((state) => state.addScrolledScreen);
  
  const [timeLeft, setTimeLeft] = useState(task.durationMinutes * 60);
  const [isActive, setIsActive] = useState(true);
  const [selectedNoise, setSelectedNoise] = useState('none');
  const soundRef = useRef<Audio.Sound | null>(null);
  const appState = useRef(AppState.currentState);

  // 呼吸动画
  const breathScale = useSharedValue(1);

  useEffect(() => {
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  // 倒计时逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    // 倒计时结束时不自动退出，让用户手动点击完成，增强仪式感
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 播放白噪音
  useEffect(() => {
    const playSound = async () => {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (selectedNoise === 'none') return;

      try {
        // const { sound } = await Audio.Sound.createAsync(
        //   // 这里暂时用 require 占位，实际需要真实的音频文件
        //   // require('../../assets/sounds/rain.mp3')
        // );
        // soundRef.current = sound;
        // await sound.setIsLoopingAsync(true);
        // await sound.playAsync();
      } catch (error) {
        console.log('Error playing sound', error);
      }
    };

    // playSound(); // 暂时注释掉，避免没有文件报错

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [selectedNoise]);

  // 监听 App 状态（防跳出）
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App 进入后台
        if (isActive && timeLeft > 0) {
          console.log('用户切出了 App，可以发送本地推送提醒');
          // TODO: 发送本地推送
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    
    // 记录完成任务的能量收益
    addCompletedTask({
      taskId: task.id,
      taskTitle: task.title,
      durationMinutes: task.durationMinutes,
      energyEarned: task.energyValue,
    });

    toast.success(`太棒了！获得 ${task.energyValue} 能量`);
    navigation.goBack();
  };

  const handleGiveUp = () => {
    setIsActive(false);
    
    // 记录放弃任务（去刷手机）的能量损失
    // 假设放弃一次扣除 5 点能量，并记录为刷了 15 分钟手机
    addScrolledScreen({
      durationMinutes: 15,
      energyLost: 5,
    });

    toast.info('没关系，允许自己停下来休息一会儿');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#121212' }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGiveUp} 
          style={styles.closeButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          activeOpacity={0.6}
        >
          <Feather name="x" size={32} color="#FFF" opacity={0.8} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.circleContainer, breathStyle]}>
          <View style={[styles.circle, { borderColor: colors.primary }]} />
          <View style={[styles.innerCircle, { backgroundColor: colors.primary }]} />
        </Animated.View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.noiseSelector}>
          {NOISE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.noiseOption,
                selectedNoise === option.id && { backgroundColor: 'rgba(255,255,255,0.2)' }
              ]}
              onPress={() => setSelectedNoise(option.id)}
            >
              <Feather 
                name={option.icon as any} 
                size={20} 
                color={selectedNoise === option.id ? '#FFF' : 'rgba(255,255,255,0.5)'} 
              />
              <Text style={[
                styles.noiseText,
                { color: selectedNoise === option.id ? '#FFF' : 'rgba(255,255,255,0.5)' }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.completeButton, 
            { backgroundColor: timeLeft === 0 ? colors.primary : 'rgba(255,255,255,0.1)' }
          ]}
          onPress={handleComplete}
          disabled={timeLeft > 0}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.completeButtonText,
            { color: timeLeft === 0 ? '#FFF' : 'rgba(255,255,255,0.3)' }
          ]}>
            {timeLeft === 0 ? '完成了' : '倒计时结束后可完成'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'flex-end',
    zIndex: 10, // 确保按钮在最上层
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)', // 增加一点背景色让点击区域更明显
    borderRadius: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.4,
    borderWidth: 2,
    opacity: 0.2,
  },
  innerCircle: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: width * 0.4,
    opacity: 0.1,
    filter: 'blur(40px)',
  },
  timerContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 80,
    fontWeight: '200',
    color: '#FFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  noiseSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 8,
  },
  noiseOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
  },
  noiseText: {
    fontSize: 12,
    fontWeight: '500',
  },
  completeButton: {
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
});