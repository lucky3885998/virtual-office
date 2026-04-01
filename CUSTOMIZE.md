# 自定义配置指南

本指南帮助你将虚拟办公室配置为自己的项目数据。

---

## 1. 修改成员数据

编辑 `src/data/members.js`：

```javascript
// 成员列表
export const members = [
  {
    id: "agent-1",
    name: "张三",
    title: "产品经理",
    department: "产品部",
    status: "working",
    avatar: null
  },
  {
    id: "agent-2", 
    name: "李四",
    title: "开发工程师",
    department: "技术部",
    status: "idle",
    avatar: null
  },
  // 添加更多成员...
]
```

---

## 2. 修改部门配置

编辑 `src/data/members.js` 中的 `departments`：

```javascript
export const departments = {
  "DEPT-1": {
    id: "DEPT-1",
    name: "产品部",
    icon: "📦",
    color: "#3b82f6"
  },
  "DEPT-2": {
    id: "DEPT-2", 
    name: "技术部",
    icon: "💻",
    color: "#10b981"
  },
  // 添加更多部门...
}
```

---

## 3. 修改组织架构

编辑 `src/data/members.js` 中的 `orgLayout`：

```javascript
export const orgLayout = [
  { id: "DEPT-1", x: 0, y: 6, level: 0 },
  { id: "DEPT-2", x: 0, y: 3, level: 1 },
  // 添加更多层级...
]
```

---

## 4. 修改主题颜色

编辑 `src/config/theme.ts`：

```typescript
export const defaultTheme: ThemeConfig = {
  accentColor: '#your-color',      // 主色调
  backgroundColor: '#0a0a0f',       // 背景色
  textColor: '#fafafa',             // 文字色
  // ...
}
```

---

## 5. 添加自定义适配器

创建新的适配器实现 `BaseAdapter` 接口：

```typescript
import { BaseAdapter, Agent, VizEvent } from './types'

export class MyCustomAdapter implements BaseAdapter {
  async initialize(config) {
    // 初始化连接
  }
  
  async getAgents(): Promise<Agent[]> {
    // 从数据源获取
  }
  
  subscribe(callback) {
    // 订阅更新
  }
  
  disconnect() {
    // 断开连接
  }
}
```

---

## 6. 部署到自己的服务器

```bash
# 构建
npm run build

# 部署 dist/ 目录到任何静态服务器
```

---

## 7. 对接 OpenClaw（待开发）

框架将支持直接对接 OpenClaw Runtime：

```javascript
import { OpenClawAdapter } from './adapters/OpenClawAdapter'

const adapter = new OpenClawAdapter({
  gatewayUrl: 'http://your-gateway:18789',
  projectId: 'your-project-id'
})

await adapter.initialize()
```

---

## 技术支持

- 提交 Issue: https://github.com/lucky3885998/virtual-office/issues
- 文档: [SPEC.md](./SPEC.md)
