import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useRecordStore } from '../../store/recordStore';
import { TaskRecord, ScrollRecord } from '../../types/record';

const { width } = Dimensions.get('window');

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const MeScreen = () => {
  const { colors, isDark } = useAppTheme();
  const { totalEnergy, level, records, fetchRecords } = useRecordStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const renderRecordItem = (record: TaskRecord | ScrollRecord, index: number) => {
    const isTask = record.type === 'completed_task';
    const date = new Date(record.createdAt);
    const timeString = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return (
      <Animated.View 
        key={record.id} 
        entering={FadeInDown.delay(index * 100).springify()}
        style={[
          styles.recordItem, 
          { 
            backgroundColor: hexToRgba(colors.surface, isDark ? 0.4 : 0.8),
            borderColor: hexToRgba(colors.border, 0.5)
          }
        ]}
      >
        <View style={[styles.recordIcon, { backgroundColor: isTask ? hexToRgba(colors.primary, 0.15) : hexToRgba('#EF4444', 0.15) }]}>
          <Feather name={isTask ? 'check-circle' : 'smartphone'} size={20} color={isTask ? colors.primary : '#EF4444'} />
        </View>
        
        <View style={styles.recordContent}>
          <Text style={[styles.recordTitle, { color: colors.text }]}>
            {isTask ? (record as TaskRecord).taskTitle : '没忍住，去刷手机了'}
          </Text>
          <Text style={[styles.recordTime, { color: colors.textSecondary }]}>
            {timeString} · {record.durationMinutes} 分钟
          </Text>
        </View>

        <View style={styles.recordEnergy}>
          <Text style={[
            styles.energyValue, 
            { color: isTask ? '#F59E0B' : '#EF4444' }
          ]}>
            {isTask ? '+' : '-'}{isTask ? (record as TaskRecord).energyEarned : (record as ScrollRecord).energyLost}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 背景装饰 */}
      <View style={[styles.bgBlob, { backgroundColor: hexToRgba('#F59E0B', 0.15), top: -100, right: -50 }]} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>能量账本</Text>
        </Animated.View>

        {/* 能量概览卡片 */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.overviewCard}>
          <View style={[styles.overviewInner, { backgroundColor: hexToRgba(colors.surface, isDark ? 0.6 : 0.9), borderColor: hexToRgba(colors.border, 0.8) }]}>
            <View style={styles.energySection}>
              <Text style={[styles.energyLabel, { color: colors.textSecondary }]}>累计获得能量</Text>
              <View style={styles.energyValueContainer}>
                <Feather name="zap" size={32} color="#F59E0B" />
                <Text style={styles.totalEnergyText}>{totalEnergy}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.levelSection}>
              <Text style={[styles.levelLabel, { color: colors.textSecondary }]}>当前等级</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{level}</Text>
              </View>
              <Text style={[styles.levelHint, { color: colors.textSecondary }]}>
                距离下一级还差 {100 - (totalEnergy % 100)} 能量
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 记录列表 */}
        <View style={styles.listContainer}>
          <Animated.Text entering={FadeIn.delay(400)} style={[styles.listTitle, { color: colors.text }]}>
            最近记录
          </Animated.Text>
          
          {records.length === 0 ? (
            <Animated.View entering={FadeIn.delay(500)} style={styles.emptyState}>
              <Feather name="inbox" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                还没有记录，去完成一个任务吧
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.recordsList}>
              {records.map((record, index) => renderRecordItem(record, index))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: 'blur(80px)',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  overviewCard: {
    width: '100%',
    borderRadius: 32,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 40,
  },
  overviewInner: {
    padding: 32,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  energySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  energyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  energyValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalEnergyText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#F59E0B',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginBottom: 24,
  },
  levelSection: {
    alignItems: 'center',
    width: '100%',
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  levelText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  levelHint: {
    fontSize: 13,
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
  },
  recordsList: {
    gap: 12,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  recordTime: {
    fontSize: 13,
  },
  recordEnergy: {
    marginLeft: 16,
  },
  energyValue: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});