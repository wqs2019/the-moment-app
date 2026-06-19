# The Moment App

基于 `chart-app` 精简迁移出的 Expo / React Native 通用框架。

## 包含内容

- 主题切换与本地持久化
- 通用导航结构（`Native Stack + Bottom Tabs`）
- 通用组件：按钮、弹窗、加载、启动页、Toast
- CloudBase 初始化与云函数调用封装
- 4 个底部 Tab 的占位页面

## 目录

- `src/components/common`: 通用 UI 组件
- `src/config`: 常量与主题配置
- `src/navigation`: 导航容器与路由
- `src/screens`: 占位页面与 Tab 容器
- `src/services`: CloudBase 与服务层
- `src/store`: 全局状态
- `src/utils`: 存储工具

## 启动

```bash
npm install
npm run start
```

## CloudBase 配置

打开 `src/config/constant.ts`，替换 `TCB_CONFIG` 中的 `env` 和 `region`。
如果暂未配置，应用仍可启动，只是服务调用占位页会显示“未配置”。
