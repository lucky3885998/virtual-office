# 纳灵虚拟办公室 - 数字企业3D可视化看板

**项目编号**：PJ-VO-001
**当前版本**：v0.3.0
**架构师**：IT-01-01 首席架构师
**项目状态**：🟢 开发中

---

## 项目愿景

在数字空间中构建纳灵的虚拟办公室，让每个团队成员都能在3D空间中看见彼此的工作状态、成果和最新动态。

---

## 🎯 通用化框架

本项目正在逐步改造为**通用3D可视化框架**，任何 OpenClaw 用户都可以快速部署自己的虚拟办公室。

### 如何配置自己的数据

编辑 `src/data/members.js` 文件：

```javascript
export const members = [
  {
    id: "your-agent-1",
    name: "你的名字",
    title: "职位",
    department: "部门",
    status: "working" // working | idle | busy | offline
  },
  // 添加更多成员...
]
```

编辑 `src/config/layout.js` 来自定义布局。

---

### 适配器模式（开发中）

框架支持多种数据源适配器：

```javascript
// 本地适配器（默认）
import { LocalAdapter } from './adapters/DataAdapter'

// OpenClaw Runtime 适配器（待开发）
import { OpenClawAdapter } from './adapters/OpenClawAdapter'
```

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 3D渲染 | Three.js + React Three Fiber | WebGL 3D渲染 |
| 前端框架 | React 18 | 组件化开发 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 样式方案 | Tailwind CSS | 快速样式开发 |
| 3D组件 | @react-three/drei | React Three.js工具库 |
| 构建工具 | Vite | 快速构建 |

---

## 快速启动

```bash
# 进入项目目录
cd digi-team/projects/virtual-office

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
# http://localhost:3000
```

---

## 版本规划

| 版本 | 目标日期 | 主要功能 |
|------|----------|----------|
| v0.1.0 MVP | 2026-03-31 | 3D办公室框架、成员状态显示 |
| v0.2.0 | 2026-04-07 | 交互增强、实时数据对接 |
| v0.3.0 | 2026-04-14 | 虚拟会议室、任务看板3D化 |
| v1.0.0 | 2026-04-30 | 全员正式使用、移动端适配 |

---

## 功能特性

### v0.1.0（MVP）
- ✅ 3D虚拟办公室场景
- ✅ 13个工作单元3D头像展示
- ✅ 状态指示（工作中/待命/忙碌/离线）
- ✅ 部门分区展示
- ✅ 工作简报面板
- ✅ 成员详情弹窗

### v0.2.0（规划中）
- 🔄 交互式3D头像（点击查看详情）
- 🔄 实时数据对接
- 🔄 工作成果3D展示
- 🔄 部门分组视图

---

## 项目结构

```
virtual-office/
├── public/
├── src/
│   ├── components/
│   │   ├── canvas/          # 3D画布组件
│   │   └── ui/              # UI组件
│   ├── data/                # 静态数据
│   ├── stores/              # 状态管理
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── SPEC.md                  # 项目规格说明书
```

---

## 迭代记录

### v0.1.0（2026-03-31）
- ✅ 创建项目规格说明书
- ✅ 搭建React + Three.js项目框架
- ✅ 实现3D虚拟办公室场景
- ✅ 实现成员头像和状态显示
- ✅ 实现工作简报面板

---

*每次迭代只需更新本目录下的文件，无需创建新项目！*
