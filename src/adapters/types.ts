// 数据适配器类型定义 - 通用接口
// 这是框架的核心抽象，任何数据源都可以通过适配器接入

export type AgentStatus = 'working' | 'idle' | 'busy' | 'offline'
export type TaskStatus = 'pending' | 'in-progress' | 'completed'
export type Priority = 'high' | 'medium' | 'low'

// ============ 核心接口 ============

/** Agent 代理接口 */
export interface Agent {
  id: string
  name: string
  title?: string
  avatar?: string
  status: AgentStatus
  department?: string
  color?: string
  metadata?: Record<string, any>
}

/** Task 任务接口 */
export interface Task {
  id: string
  title: string
  assignee: string  // agent id
  status: TaskStatus
  priority?: Priority
  progress?: number  // 0-100
  deadline?: string
  createdAt?: string
}

/** Message 消息接口 */
export interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: number
  type: 'text' | 'system' | 'task'
  read?: boolean
}

/** Activity 活动记录接口 */
export interface Activity {
  id: string
  type: string
  agentId?: string
  message: string
  timestamp: number
  icon?: string
  color?: string
}

/** Department 部门接口 */
export interface Department {
  id: string
  name: string
  icon: string
  color: string
  parentId?: string
  metadata?: Record<string, any>
}

// ============ 适配器接口 ============

/** 适配器配置 */
export interface AdapterConfig {
  /** 刷新间隔（毫秒） */
  refreshInterval?: number
  /** 是否使用模拟数据 */
  useSimulation?: boolean
  /** 其他配置 */
  [key: string]: any
}

/** Viz 事件类型 */
export interface VizEvent {
  type: 'agent_update' | 'task_update' | 'message_new' | 'activity_new'
  data: any
  timestamp: number
}

/** 基础适配器接口 - 所有适配器必须实现 */
export interface BaseAdapter {
  /** 初始化适配器 */
  initialize(config: AdapterConfig): Promise<void>
  
  /** 获取所有代理 */
  getAgents(): Promise<Agent[]>
  
  /** 获取所有任务 */
  getTasks(): Promise<Task[]>
  
  /** 获取消息 */
  getMessages(limit?: number): Promise<Message[]>
  
  /** 获取活动记录 */
  getActivities(limit?: number): Promise<Activity[]>
  
  /** 订阅更新事件 */
  subscribe(callback: (event: VizEvent) => void): () => void
  
  /** 断开连接 */
  disconnect(): void
}

// ============ 常量定义 ============

/** 状态颜色映射 */
export const STATUS_COLORS: Record<AgentStatus, string> = {
  working: '#22c55e',
  idle: '#eab308',
  busy: '#ef4444',
  offline: '#71717a'
}

/** 状态图标映射 */
export const STATUS_EMOJI: Record<AgentStatus, string> = {
  working: '💼',
  idle: '☕',
  busy: '⚡',
  offline: '😴'
}

/** 状态中文名称 */
export const STATUS_LABELS: Record<AgentStatus, string> = {
  working: '工作中',
  idle: '待命',
  busy: '忙碌',
  offline: '离线'
}

/** 优先级颜色映射 */
export const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e'
}
