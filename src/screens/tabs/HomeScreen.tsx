import React from 'react';
import { useToast } from '../../components/common/Toast';
import PlaceholderScreen from '../placeholder/PlaceholderScreen';

export const HomeScreen = () => {
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