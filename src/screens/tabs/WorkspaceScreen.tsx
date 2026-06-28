import React from 'react';
import { useToast } from '../../components/common/Toast';
import PlaceholderScreen from '../placeholder/PlaceholderScreen';

export const WorkspaceScreen = () => {
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