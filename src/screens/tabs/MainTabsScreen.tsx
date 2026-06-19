import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../../components/common/Button';
import CommonModal from '../../components/common/CommonModal';
import { useToast } from '../../components/common/Toast';
import { TCB_CONFIG } from '../../config/constant';
import { ThemeMode } from '../../config/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import CloudService from '../../services/tcb';
import { useAppStore } from '../../store/appStore';
import PlaceholderScreen from '../placeholder/PlaceholderScreen';

type MainTabParamList = {
  Home: undefined;
  Workspace: undefined;
  Service: undefined;
  Me: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeScreen = () => {
  const { info } = useToast();

  return (
    <PlaceholderScreen
      eyebrow="Entry"
      title="首页占位"
      subtitle="这里作为应用默认入口，后续可承接首页聚合、推荐内容、快捷操作和状态总览。"
      points={[
        '已保留导航、主题状态和启动页基座',
        '已接入 Toast、按钮、弹窗、加载态等通用组件',
        '适合作为首屏聚合模块继续扩展',
      ]}
      actions={['接入业务卡片', '增加数据请求', '配置首页布局']}
      onActionPress={(action) => info(`${action} 已预留`)}
    />
  );
};

const WorkspaceScreen = () => {
  const { info } = useToast();

  return (
    <PlaceholderScreen
      eyebrow="Modules"
      title="工作台占位"
      subtitle="这里适合放业务模块入口，例如表单流、内容流、任务流或多种功能聚合页。"
      points={[
        '底部 Tab 已初始化，可直接追加二级 Stack',
        '页面样式与主题色自动联动',
        '后续模块迁移时可按功能逐步接入',
      ]}
      actions={['新增模块路由', '拆分子导航', '接入列表页面']}
      onActionPress={(action) => info(`${action} 已预留`)}
    />
  );
};

const ServiceScreen = () => {
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

const MeScreen = () => {
  const { colors } = useAppTheme();
  const { info, success } = useToast();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const [visible, setVisible] = React.useState(false);

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

const TAB_ICON_MAP: Record<keyof MainTabParamList, { default: React.ComponentProps<typeof Ionicons>['name']; active: React.ComponentProps<typeof Ionicons>['name'] }> = {
  Home: { default: 'home-outline', active: 'home' },
  Workspace: { default: 'grid-outline', active: 'grid' },
  Service: { default: 'server-outline', active: 'server' },
  Me: { default: 'person-outline', active: 'person' },
};

const MainTabsScreen: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconPair = TAB_ICON_MAP[route.name as keyof MainTabParamList];
          return <Ionicons name={focused ? iconPair.active : iconPair.default} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页', tabBarLabel: '首页' }} />
      <Tab.Screen name="Workspace" component={WorkspaceScreen} options={{ title: '工作台', tabBarLabel: '工作台' }} />
      <Tab.Screen name="Service" component={ServiceScreen} options={{ title: '服务', tabBarLabel: '服务' }} />
      <Tab.Screen name="Me" component={MeScreen} options={{ title: '我的', tabBarLabel: '我的' }} />
    </Tab.Navigator>
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

export default MainTabsScreen;
