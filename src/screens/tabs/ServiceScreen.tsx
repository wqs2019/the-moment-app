import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useToast } from '../../components/common/Toast';
import { TCB_CONFIG } from '../../config/constant';
import { useAppTheme } from '../../hooks/useAppTheme';
import CloudService from '../../services/tcb';
import { useAppStore } from '../../store/appStore';
import PlaceholderScreen from '../placeholder/PlaceholderScreen';

export const ServiceScreen = () => {
  const { colors } = useAppTheme();
  const { info } = useToast();
  const serviceReady = useAppStore((state) => state.serviceReady);
  const configured = CloudService.isConfigured();

  return (
    <PlaceholderScreen
      eyebrow="Service"
      title="服务容器占位"
      subtitle="已保留 CloudBase 初始化和云函数调用封装，后续可继续补业务 service 与 repository。"
      points={[
        `CloudBase 环境：${configured ? '已配置' : '未配置'}`,
        `服务启动状态：${serviceReady ? '已完成匿名初始化' : '当前未建立连接'}`,
        '已提供统一的 callFunction 与 uploadFile 封装',
      ]}
      actions={['填写 TCB_CONFIG', '新增云函数 service', '接入业务接口']}
      footer={
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>当前配置</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>env: {TCB_CONFIG.env}</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>region: {TCB_CONFIG.region}</Text>
        </View>
      }
      onActionPress={(action) => info(`${action} 已预留`)}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: -4,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
});