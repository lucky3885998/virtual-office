# 纳灵数字企业虚拟办公室 - 开发文档

> 最后更新: 2026-03-31 06:40

## 项目概述

**项目名称**: 纳灵数字企业虚拟办公室 (Naling Digital Enterprise Virtual Office)
**技术栈**: React + React Three Fiber + Zustand + Vite
**端口**: http://localhost:3002

---

## 已完成功能

### 1. 3D组织架构可视化
- [x] 3D太空宇宙背景（星星、星云、深度线）
- [x] 人员3Davatar显示（呼吸动画、悬浮效果）
- [x] 部门标签和层级指示
- [x] 人员状态色彩区分（在线/空闲/忙碌/离线）
- [x] 连接线显示组织关系
- [x] 点击成员查看信息面板

### 2. 任务管理系统
- [x] 创建任务（标题、负责人、优先级、截止日期）
- [x] 任务状态流转（待处理 → 进行中 → 已完成）
- [x] 真实执行模拟（进度条动画、自动完成）
- [x] 3Davatar头顶进度显示
- [x] 负责人状态自动变为忙碌
- [x] 完成后自动恢复在线状态
- [x] 按状态筛选任务
- [x] **多并行任务支持** - 同一成员可同时执行多个任务
- [x] **任务重新执行** - 已完成任务可重新开始

### 3. 工作报告系统
- [x] 底部工作简报面板（横向滚动卡片）
- [x] 任务完成自动生成报告
- [x] 点击简报卡片查看详情弹窗
- [x] 展开执行成果详情（时间、时长、进度）
- [x] **工作报告导出** - JSON/CSV格式导出

### 4. 通讯模拟系统
- [x] 公告发送（全员）
- [x] 部门消息发送
- [x] 私信功能
- [x] 消息分类显示

### 5. 通知系统
- [x] **实时通知推送** - 任务完成、消息、公告自动推送
- [x] **通知中心面板** - 下拉显示所有通知
- [x] **未读计数角标** - 红点显示未读数量
- [x] **模拟系统公告** - 每30秒推送一条模拟通知

### 6. 数据持久化
- [x] **LocalStorage自动保存** - 所有数据自动保存到本地
- [x] **页面刷新恢复** - 刷新后数据不丢失
- [x] **关闭前保存** - beforeunload事件保存数据
- [x] **手动重置** - 可清除所有数据恢复默认

### 7. 导航系统
- [x] 右下角迷你地图
- [x] 部门节点状态色彩
- [x] 人数统计显示
- [x] 点击跳转镜头

### 8. 主题与UI
- [x] **深色/浅色主题切换** - 一键切换全系统配色
- [x] **底部状态栏** - 实时显示系统状态
- [x] 可拖动面板（任务面板、消息面板、通知面板）

### 9. 键盘快捷键
- [x] **Ctrl+T** - 打开/关闭任务面板
- [x] **Ctrl+M** - 打开/关闭消息面板
- [x] **Ctrl+N** - 打开/关闭通知面板
- [x] **Ctrl+B** - 切换深色/浅色主题
- [x] **Ctrl+1-5** - 快速导航到各部门
- [x] **Home** - 回到中心位置
- [x] **Esc** - 关闭面板
- [x] **Ctrl+?** - 显示快捷键帮助面板

---

## 核心文件结构

```
src/
├── App.jsx                      # 主应用入口
├── main.jsx                     # React渲染入口
├── index.css                    # 全局样式（含主题变量）
├── components/
│   ├── canvas/
│   │   └── VirtualOffice.jsx   # 3D场景组件
│   └── ui/
│       ├── Header.jsx           # 顶部导航栏
│       ├── InfoPanel.jsx        # 成员信息面板
│       ├── WorkReportPanel.jsx  # 工作简报面板
│       ├── ReportDetail.jsx     # 报告详情弹窗
│       ├── TaskPanel.jsx        # 任务管理面板
│       ├── MessagePanel.jsx     # 消息中心面板
│       ├── MiniMap.jsx          # 导航迷你地图
│       ├── DraggablePanel.jsx   # 可拖动面板容器
│       ├── NotificationPanel.jsx # 通知中心面板
│       ├── StatusBar.jsx        # 底部状态栏
│       └── KeyboardShortcutsPanel.jsx # 快捷键帮助
├── stores/
│   └── officeStore.js           # Zustand状态管理
└── data/
    └── members.js               # 成员和部门数据
```

---

## 主题系统

### CSS变量
```css
/* 深色主题 (默认) */
--color-bg-primary: #09090b;
--color-text-primary: #fafafa;

/* 浅色主题 */
--color-bg-primary: #ffffff;
--color-text-primary: #18181b;
```

### 切换方式
- UI按钮: Header右侧 ☀️/🌙 按钮
- 快捷键: Ctrl+B
- 自动保存: 主题设置会保存到LocalStorage

---

## 快捷键列表

| 快捷键 | 功能 |
|--------|------|
| Ctrl+T | 任务面板 |
| Ctrl+M | 消息面板 |
| Ctrl+N | 通知面板 |
| Ctrl+B | 切换主题 |
| Ctrl+1 | 导航到CEO |
| Ctrl+2 | 导航到COO |
| Ctrl+3 | 导航到市场部 |
| Ctrl+4 | 导航到销售部 |
| Ctrl+5 | 导航到运营部 |
| Home | 回到中心 |
| Esc | 关闭面板 |
| Ctrl+? | 快捷键帮助 |

---

## 待优化/开发方向

1. ~~多并行任务支持~~ ✅
2. ~~消息实时推送~~ ✅
3. ~~数据持久化~~ ✅
4. ~~工作报告导出~~ ✅
5. ~~主题切换~~ ✅
6. ~~键盘快捷键~~ ✅
7. 深色/浅色主题优化
8. 国际化多语言
9. 后端数据同步
10. 移动端适配

---

## 常见问题

1. **报告不显示** - 确保 `getAllReports()` 传入的是更新后的 members 数组
2. **任务进度不更新** - 检查 `_updateTaskProgress` 定时器是否正常
3. **面板拖动失效** - 检查 DraggablePanel 的事件处理
4. **数据未保存** - 检查LocalStorage是否可用

---

## 开发命令

```bash
cd digi-team/projects/virtual-office
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
```

---

*此文档由Lucky-COO维护*
