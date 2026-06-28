import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import CommonModal from '../../components/common/CommonModal';
import { useToast } from '../../components/common/Toast';
import { ThemeMode } from '../../config/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../store/appStore';
import PlaceholderScreen from '../placeholder/PlaceholderScreen';

const ThemeActionButtons: React.FC<{ currentTheme: ThemeMode; onChange: (theme: ThemeMode) => void }> = ({
  currentTheme,
  onChange,
}) => {
  return (
    <View style={styles.buttonGroup}>
      {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
        <Button
          key={mode}
          title={mode === 'system' ? '跟随系统' : mode === 'light' ? '浅色' : '深色'}
          variant={currentTheme === mode ? 'primary' : 'secondary'}
          onPress={() => onChange(mode)}
        />
      ))}
    </View>
  );
};

export const MeScreen = () => {
  const { colors } = useAppTheme();
  const { info, success } = useToast();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const [visible, setVisible] = useState(false);

  const handleThemeChange = async (mode: ThemeMode) => {
    await setTheme(mode);
    success(`已切换为${mode === 'system' ? '跟随系统' : mode === 'light' ? '浅色模式' : '深色模式'}`);
  };

  return (
    <PlaceholderScreen
      eyebrow="Profile"
      title="我的占位"
      subtitle="这里适合承接用户中心、设置、主题切换、账号信息和版本说明等内容。"
      points={[
        '全局 store 已支持主题模式持久化',
        '已演示 Toast、弹窗和主题切换的使用方式',
        '当前结构已适合扩展设置页、说明页和登录流程',
      ]}
      actions={['增加设置页', '打开弹窗示例', '接入个人中心']}
      onActionPress={(action) => {
        if (action === '打开弹窗示例') {
          setVisible(true);
          return;
        }
        info(`${action} 已预留为后续接入点`);
      }}
      footer={
        <>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>主题切换示例</Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              当前主题模式：{theme === 'system' ? '跟随系统' : theme === 'light' ? '浅色' : '深色'}
            </Text>
            <ThemeActionButtons currentTheme={theme} onChange={handleThemeChange} />
          </View>
          <CommonModal visible={visible} onClose={() => setVisible(false)} title="通用弹窗示例">
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              这里可以替换成表单、确认弹窗、筛选面板或其他公共交互内容。
            </Text>
            <View style={styles.modalButtonWrap}>
              <Button title="关闭弹窗" onPress={() => setVisible(false)} />
            </View>
          </CommonModal>
        </>
      }
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
  buttonGroup: {
    marginTop: 14,
    gap: 12,
  },
  modalButtonWrap: {
    marginTop: 16,
  },
});