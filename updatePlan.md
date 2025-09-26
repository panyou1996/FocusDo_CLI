# FocusDo CLI 优化升级计划 📱✨

## 📋 项目概述
基于您提出的需求，制定了一个全面的优化升级计划。项目将从当前的 Next.js 网页应用进化为一个功能丰富、体验优秀的移动应用（通过 Capacitor 打包）。

---

## 🎯 核心需求分析

### 1. Bug 修复 (优先级：🔥 高)
- **TaskCard 展开回弹问题**：动画过渡优化，避免文本压缩
- **Inbox 日历视图缺失任务提示**：添加日期下方的任务数量指示器
- **Dark Mode 功能失效**：修复主题切换逻辑

### 2. UI/UX 升级 (优先级：🔥 高)
- **整体视觉风格统一**：微交互、动效、色彩系统优化
- **精致感提升**：玻璃拟态、阴影、圆角等细节优化

### 3. 核心功能增强 (优先级：🔥 高)
- **智能任务规划**：My Day 魔法棒自动排程功能
- **语音识别**：语音转文字添加任务功能
- **数据逻辑优化**：My Day 隔夜任务分组管理

### 4. 移动端适配 (优先级：🔥 高)
- **Capacitor 兼容性优化**：移除不兼容的 Web APIs
- **移动端交互优化**：触摸手势、震动反馈等

---

## 🗓️ 开发阶段规划

## 阶段一：紧急修复与基础优化 (1-2天)

### 任务 1.1：修复关键 Bug
- [ ] **修复 TaskCard 展开动画回弹问题**
  - 优化 `framer-motion` 动画配置
  - 调整 `height: auto` 的过渡效果
  - 确保文本内容不会被压缩

- [ ] **修复 Dark Mode 切换功能**
  - 检查 `ThemeProvider` 和 `AppContext` 的主题同步
  - 修复设置页面的开关状态绑定
  - 确保主题持久化存储正常工作

- [ ] **添加 Inbox 日历任务提示**
  - 在日历日期下方添加小圆点指示器
  - 重要任务显示金色圆点，普通任务显示主题色圆点
  - 支持多个任务的数量显示

### 任务 1.2：UI 基础优化
- [ ] **统一视觉风格**
  - 规范化圆角尺寸 (4px, 8px, 12px, 16px, 24px)
  - 优化阴影系统 (subtle, soft, medium, strong)
  - 统一间距系统 (2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px)

- [ ] **优化色彩系统**
  - 深色模式背景色调整为更柔和的深灰
  - 增强对比度和可读性
  - 优化主题色在不同模式下的表现

## 阶段二：智能功能开发 (2-3天)

### 任务 2.1：My Day 智能规划系统
- [ ] **魔法棒图标设计**
  - 创建带流光溢彩效果的魔法棒 SVG 图标
  - 添加点击时的粒子效果动画
  - 集成到 My Day 页面右上角

- [ ] **任务自动排程算法**
  ```typescript
  interface ScheduleRule {
    workStart: string; // "08:30"
    lunchBreak: { start: string; end: string }; // "11:30" - "13:00"
    dinnerBreak: { start: string; end: string }; // "17:30" - "18:00"
    workEnd: string; // "21:00"
    defaultDuration: number; // 30 minutes
    taskInterval: number; // 15 minutes
  }
  
  function autoScheduleTasks(tasks: Task[], rules: ScheduleRule): Task[]
  ```
  - 重要任务优先排序
  - 固定时间任务不可移动
  - 不能早于当前时间安排
  - 尊重 due date 限制
  - 考虑任务持续时间和间隔

- [ ] **隔夜任务分组管理**
  - 新增 "昨日遗留" 任务分组
  - 自动检测跨日未完成的 My Day 任务
  - 提供批量操作：完成、移除、重新规划

### 任务 2.2：语音识别功能
- [ ] **语音输入组件开发**
  - 替换底部中央的 "+" 按钮为多功能按钮
  - 短按：弹出文本输入框
  - 长按：启动语音录音模式

- [ ] **语音识别集成**
  - 集成 Web Speech API (浏览器环境)
  - 为 Capacitor 环境准备原生语音识别插件
  - 实现语音转文字功能

- [ ] **智能语义解析**
  - 解析任务标题、截止日期、重要性
  - 支持自然语言如："明天下午3点开会，重要"
  - 自动分类到合适的任务列表

- [ ] **科技感 UI 设计**
  - 语音录音时的动态波形动画
  - 呼吸灯效果的录音指示器
  - 语音转文字的实时显示效果

## 阶段三：高级 UI/UX 优化 (2-3天)

### 任务 3.1：微交互与动效升级
- [ ] **任务卡片交互优化**
  - 完善长按固定任务的触觉反馈
  - 优化展开/收缩动画的缓动函数
  - 添加卡片悬停状态的微妙高光效果

- [ ] **页面切换动效**
  - 实现页面间的流畅过渡动画
  - 添加路由切换时的加载状态
  - 优化底部导航的激活状态动画

- [ ] **列表操作动效**
  - 任务完成时的庆祝动画
  - 任务删除的滑出动画
  - 任务添加的滑入动画

### 任务 3.2：视觉细节优化
- [ ] **玻璃拟态效果**
  - 底部导航栏应用毛玻璃效果
  - 弹窗和悬浮元素的背景模糊
  - 半透明卡片的视觉层次优化

- [ ] **图标与插画系统**
  - 为空状态页面添加精美插画
  - 统一图标风格和尺寸
  - 添加状态图标的动态效果

- [ ] **加载与反馈优化**
  - 骨架屏加载效果
  - 操作成功的 Toast 提示
  - 错误状态的友好提示

## 阶段四：移动端优化 (1-2天)

### 任务 4.1：Capacitor 集成准备
- [ ] **依赖检查与清理**
  - 审查 package.json 中不兼容的依赖
  - 替换 Web-only APIs 为 Capacitor 兼容方案
  - 优化构建配置

- [ ] **原生功能集成**
  - 添加 Capacitor 语音识别插件
  - 集成设备震动 API
  - 支持应用图标和启动画面

- [ ] **性能优化**
  - 代码分割和懒加载
  - 图片资源优化
  - 减少包体积

### 任务 4.2：移动端交互优化
- [ ] **触摸手势增强**
  - 优化长按识别阈值
  - 添加滑动手势支持
  - 改善触摸目标尺寸

- [ ] **适配安全区域**
  - 处理刘海屏等特殊屏幕
  - 优化状态栏显示
  - 适配键盘弹出

## 阶段五：进阶功能与优化 (2天)

### 任务 5.1：数据管理优化
- [ ] **本地存储升级**
  - 实现数据版本控制
  - 添加数据导入/导出功能
  - 优化大量数据的性能

- [ ] **离线功能完善**
  - 确保离线状态下的完整可用性
  - 优化 PWA 缓存策略
  - 添加网络状态检测

### 任务 5.2：AI 功能集成
- [ ] **智能任务建议**
  - 基于历史数据的任务时间预测
  - 智能提醒和任务优先级调整
  - 工作模式识别和建议

- [ ] **个性化体验**
  - 自适应主题推荐
  - 使用习惯分析
  - 个性化快捷操作

---

## 🎨 设计系统规范

### 色彩系统
```css
/* 主色调 */
:root {
  --primary-50: hsl(241, 62%, 95%);
  --primary-500: hsl(241, 62%, 59%);
  --primary-900: hsl(241, 62%, 20%);
}

/* 语义色彩 */
:root {
  --success: hsl(142, 76%, 36%);
  --warning: hsl(45, 93%, 47%);
  --error: hsl(0, 84%, 60%);
  --info: hsl(197, 88%, 48%);
}

/* 中性色 */
:root.light {
  --gray-50: hsl(210, 17%, 98%);
  --gray-500: hsl(240, 1%, 54%);
  --gray-900: hsl(240, 4%, 11%);
}
```

### 动画系统
```css
/* 缓动函数 */
:root {
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out-back: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 持续时间 */
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

### 阴影系统
```css
:root {
  --shadow-subtle: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-soft: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-medium: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-strong: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-fab: 0 8px 25px -5px rgb(0 0 0 / 0.3);
}
```

---

## 🚀 技术栈增强

### 新增依赖
```json
{
  "dependencies": {
    "@capacitor/android": "^5.0.0",
    "@capacitor/core": "^5.0.0",
    "@capacitor/haptics": "^5.0.0",
    "@capacitor/speech-recognition": "^1.0.0",
    "framer-motion": "^11.5.7", // 已有，用于高级动画
    "date-fns": "^3.6.0", // 已有，用于日期处理
    "react-speech-kit": "^3.0.1" // 用于 Web 语音识别
  },
  "devDependencies": {
    "@capacitor/cli": "^5.0.0"
  }
}
```

### 项目结构优化
```
src/
├── ai/                    # AI 功能模块 (已有)
├── components/
│   ├── animations/        # 动画组件 (新增)
│   ├── audio/            # 语音相关组件 (新增)
│   ├── scheduling/       # 排程相关组件 (新增)
│   └── mobile/           # 移动端特定组件 (新增)
├── hooks/
│   ├── useVoiceRecording.ts  # 语音录制 Hook (新增)
│   ├── useTaskScheduler.ts   # 任务调度 Hook (新增)
│   └── useHaptics.ts         # 触觉反馈 Hook (新增)
├── utils/
│   ├── taskScheduler.ts      # 任务调度算法 (新增)
│   ├── nlpParser.ts          # 自然语言解析 (新增)
│   └── capacitorUtils.ts     # Capacitor 工具函数 (新增)
└── styles/
    ├── animations.css        # 动画样式 (新增)
    └── mobile.css           # 移动端样式 (新增)
```

---

## 📱 移动端特殊优化点

### Capacitor 配置
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.focusdo.app',
  appName: 'FocusDo',
  webDir: 'out',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#8b5cf6",
      showSpinner: false
    },
    Haptics: {},
    SpeechRecognition: {
      language: "zh-CN",
      maxResults: 1,
      prompt: "请说话...",
      partialResults: true
    }
  }
};

export default config;
```

### PWA 优化
```json
// next.config.js 增强
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
});
```

---

## 🎯 成功指标

### 用户体验指标
- [ ] 页面切换响应时间 < 200ms
- [ ] 任务操作反馈 < 100ms
- [ ] 语音识别准确率 > 90%
- [ ] 应用启动时间 < 3s

### 功能完成度
- [ ] 所有提到的 Bug 修复完成
- [ ] 智能排程算法正常工作
- [ ] 语音识别功能可用
- [ ] 移动端 APK 打包成功

### 代码质量
- [ ] TypeScript 严格模式无错误
- [ ] 组件复用率 > 80%
- [ ] 代码覆盖率 > 70%
- [ ] 无严重的 a11y 问题

---

## 📝 后续迭代方向

### v2.0 规划
1. **云同步功能**：支持多设备数据同步
2. **团队协作**：任务分享和协作功能
3. **高级分析**：工作效率分析报告
4. **Widget 支持**：桌面小组件
5. **Siri/语音助手集成**：深度语音控制

### v3.0 规划
1. **AI 驱动的智能助手**：深度学习个人习惯
2. **AR 功能**：增强现实任务提醒
3. **多平台支持**：Windows、macOS 桌面版
4. **企业版功能**：团队管理和分析

---

## ⚡ 立即执行清单

### 第一天任务 (立即开始)
1. ✅ 启动开发服务器
2. 🔧 修复 TaskCard 动画回弹问题
3. 🔧 修复 Dark Mode 切换功能
4. 🎨 添加 Inbox 日历任务提示圆点
5. 📝 创建组件复用和设计系统文档

这个计划将让您的 FocusDo 应用从一个普通的待办应用升级为一个具有 AI 加持、精美交互和移动端优化的现代生产力工具。整个开发周期预计 8-10 天，可以根据实际需要调整优先级和时间安排。

---

*计划制定时间：2025-09-25*  
*预计完成时间：2025-10-05*  
*版本目标：v1.5.0 (Major UI/UX + Smart Features)*