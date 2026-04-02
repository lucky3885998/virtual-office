/**
 * OpenClaw 运行时适配器
 *
 * 将纳灵虚拟办公室与 OpenClaw Gateway 连接，
 * 实现真实团队状态数据的读取和通知发送。
 *
 * 连接方式:
 * - 读取 OpenClaw 工作区中的团队成员配置
 * - 通过 Gateway API 读取在线状态
 * - 通过 Skill 系统发送通知到各个平台
 */

import { BaseAdapter, AdapterConfig, Agent, Task, Message, Activity, VizEvent } from './types'

// ============ OpenClaw Gateway API 类型 ============

interface OpenClawSession {
  id: string
  key: string
  label: string
  updatedAt: number
  model?: string
}

interface OpenClawMemory {
  key: string
  text: string
  updatedAt: number
}

interface OpenClawStatus {
  version: string
  uptime: number
  sessions: number
  channels: string[]
}

// ============ OpenClaw 适配器配置 ============

export interface OpenClawAdapterConfig extends AdapterConfig {
  /** OpenClaw Gateway 地址 */
  gatewayUrl?: string
  /** Gateway 认证 Token */
  gatewayToken?: string
  /** OpenClaw 工作区路径 */
  workspace?: string
  /** 成员数据文件路径 */
  membersFile?: string
  /** 状态轮询间隔 (毫秒) */
  pollInterval?: number
  /** 是否启用通知发送 */
  enableNotifications?: boolean
}

// ============ 默认配置 ============

const DEFAULT_CONFIG: Required<OpenClawAdapterConfig> = {
  gatewayUrl: 'http://127.0.0.1:18789',
  gatewayToken: '', // 从 openclaw.json 读取
  workspace: 'C:\\Users\\Phil Lian\\Documents\\myOCD',
  membersFile: 'data/office-members.json',
  pollInterval: 10000,
  enableNotifications: true,
  refreshInterval: 10000,
  useSimulation: false
}

// ============ 工具函数 ============

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    online: '#22c55e',
    away: '#eab308',
    busy: '#ef4444',
    offline: '#71717a'
  }
  return colors[status] || colors.offline
}

// ============ OpenClaw 适配器 ============

export class OpenClawAdapter implements BaseAdapter {
  private config: Required<OpenClawAdapterConfig>
  private subscribers: Set<(event: VizEvent) => void> = new Set()
  private agents: Agent[] = []
  private tasks: Task[] = []
  private activities: Activity[] = []
  private pollIntervalId: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor(config: OpenClawAdapterConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ============ BaseAdapter 实现 ============

  async initialize(config?: OpenClawAdapterConfig): Promise<void> {
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config }
    }

    console.log('[OpenClawAdapter] Initializing...')
    console.log('[OpenClawAdapter] Gateway:', this.config.gatewayUrl)

    // 尝试连接 Gateway
    try {
      await this.fetchGatewayStatus()
      console.log('[OpenClawAdapter] Gateway connected')
    } catch (error) {
      console.warn('[OpenClawAdapter] Gateway not available, using offline mode')
    }

    // 加载初始数据
    await this.loadAgents()
    await this.loadActivities()

    // 启动轮询
    this.startPolling()

    this.isInitialized = true
  }

  async getAgents(): Promise<Agent[]> {
    return [...this.agents]
  }

  async getTasks(): Promise<Task[]> {
    return [...this.tasks]
  }

  async getMessages(limit: number = 50): Promise<Message[]> {
    // 从 OpenClaw 会话历史中读取消息
    try {
      const sessions = await this.fetchSessions()
      // 实际实现中会从会话中提取消息
      return []
    } catch {
      return []
    }
  }

  async getActivities(limit: number = 20): Promise<Activity[]> {
    return this.activities.slice(0, limit)
  }

  subscribe(callback: (event: VizEvent) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  disconnect(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId)
      this.pollIntervalId = null
    }
    this.subscribers.clear()
    this.isInitialized = false
    console.log('[OpenClawAdapter] Disconnected')
  }

  // ============ Gateway API 调用 ============

  private async fetchGatewayStatus(): Promise<OpenClawStatus> {
    const response = await fetch(`${this.config.gatewayUrl}/api/status`, {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Gateway status failed: ${response.status}`)
    }

    return response.json()
  }

  private async fetchSessions(): Promise<OpenClawSession[]> {
    const response = await fetch(`${this.config.gatewayUrl}/api/sessions`, {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Fetch sessions failed: ${response.status}`)
    }

    return response.json()
  }

  private async fetchMemory(key: string): Promise<OpenClawMemory | null> {
    try {
      const response = await fetch(
        `${this.config.gatewayUrl}/api/memory/${encodeURIComponent(key)}`,
        {
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(5000)
        }
      )

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error(`Fetch memory failed: ${response.status}`)
      }

      return response.json()
    } catch {
      return null
    }
  }

  private async sendNotification(options: {
    channel?: string
    message: string
    to?: string
  }): Promise<boolean> {
    if (!this.config.enableNotifications) {
      return false
    }

    try {
      const response = await fetch(`${this.config.gatewayUrl}/api/notify`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options),
        signal: AbortSignal.timeout(10000)
      })

      return response.ok
    } catch (error) {
      console.error('[OpenClawAdapter] Notification failed:', error)
      return false
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.config.gatewayToken) {
      headers['Authorization'] = `Bearer ${this.config.gatewayToken}`
    }

    return headers
  }

  // ============ 数据加载 ============

  private async loadAgents(): Promise<void> {
    // 首先尝试从 Gateway 获取在线成员
    try {
      const sessions = await this.fetchSessions()
      this.updateAgentsFromSessions(sessions)
    } catch {
      // Gateway 不可用，使用本地配置
      this.loadAgentsFromConfig()
    }
  }

  private updateAgentsFromSessions(sessions: OpenClawSession[]): void {
    // 将 OpenClaw 会话映射为虚拟办公室成员
    const previousAgents = new Map(this.agents.map(a => [a.id, a]))

    this.agents = sessions.map((session, index) => {
      const existing = previousAgents.get(session.id)
      return {
        id: session.id,
        name: session.label || `成员 ${index + 1}`,
        title: session.model || 'AI 助手',
        status: existing?.status || 'offline',
        department: existing?.department || 'IT',
        color: existing?.color || getStatusColor('online')
      }
    })

    this.emit({
      type: 'agent_update',
      data: { agents: this.agents },
      timestamp: Date.now()
    })
  }

  private loadAgentsFromConfig(): void {
    // 从本地配置文件加载成员
    // 这个方法在 Gateway 不可用时作为后备
    const defaultAgents: Agent[] = [
      {
        id: 'openclaw-main',
        name: 'Lucky-COO',
        title: 'AI 首席运营官',
        status: 'working',
        department: 'COO',
        color: '#3b82f6'
      },
      {
        id: 'openclaw-agent-1',
        name: '助手-1',
        title: '智能助手',
        status: 'idle',
        department: 'IT',
        color: '#10b981'
      }
    ]

    this.agents = defaultAgents
  }

  private async loadActivities(): Promise<void> {
    // 从 OpenClaw 记忆系统加载最近活动
    const memory = await this.fetchMemory('office-activities')

    if (memory?.text) {
      try {
        const activities = JSON.parse(memory.text)
        this.activities = activities.slice(0, 50)
      } catch {
        this.activities = []
      }
    }
  }

  private async saveActivities(): Promise<void> {
    // 保存活动到 OpenClaw 记忆系统
    const data = JSON.stringify(this.activities.slice(0, 50))

    try {
      await fetch(`${this.config.gatewayUrl}/api/memory/office-activities`, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: data }),
        signal: AbortSignal.timeout(5000)
      })
    } catch (error) {
      console.warn('[OpenClawAdapter] Save activities failed:', error)
    }
  }

  // ============ 轮询 ============

  private startPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId)
    }

    this.pollIntervalId = setInterval(async () => {
      if (!this.isInitialized) return

      try {
        // 刷新会话状态
        const sessions = await this.fetchSessions()
        this.updateAgentsFromSessions(sessions)

        // 添加心跳活动
        this.addActivity({
          id: `heartbeat-${Date.now()}`,
          type: 'heartbeat',
          message: '系统心跳 - 所有成员状态已更新',
          timestamp: Date.now(),
          icon: '💓',
          color: '#3b82f6'
        })
      } catch (error) {
        // 轮询失败不影响主流程
      }
    }, this.config.pollInterval)
  }

  // ============ 事件发射 ============

  private emit(event: VizEvent): void {
    this.subscribers.forEach(cb => cb(event))
  }

  // ============ 公共方法 ============

  /**
   * 添加活动记录
   */
  addActivity(activity: Activity): void {
    this.activities.unshift(activity)
    if (this.activities.length > 50) {
      this.activities.pop()
    }

    this.emit({
      type: 'activity_new',
      data: activity,
      timestamp: Date.now()
    })

    // 异步保存
    this.saveActivities()
  }

  /**
   * 更新成员状态
   */
  updateAgentStatus(agentId: string, status: Agent['status']): void {
    const agent = this.agents.find(a => a.id === agentId)
    if (agent && agent.status !== status) {
      const oldStatus = agent.status
      agent.status = status

      this.emit({
        type: 'agent_update',
        data: { agentId, oldStatus, newStatus: status },
        timestamp: Date.now()
      })

      // 记录活动
      this.addActivity({
        id: `status-${Date.now()}`,
        type: 'agent_status_changed',
        agentId,
        message: `${agent.name} 从 ${oldStatus} 变为 ${status}`,
        timestamp: Date.now(),
        icon: '🔄',
        color: getStatusColor(status)
      })
    }
  }

  /**
   * 发送通知到 OpenClaw 管理的平台
   */
  async sendMessage(options: {
    platform?: 'telegram' | 'discord' | 'whatsapp' | 'signal'
    to?: string
    message: string
  }): Promise<boolean> {
    return this.sendNotification(options)
  }

  /**
   * 获取 OpenClaw Gateway 状态
   */
  async getGatewayHealth(): Promise<{
    connected: boolean
    version?: string
    uptime?: number
    sessions?: number
  }> {
    try {
      const status = await this.fetchGatewayStatus()
      return {
        connected: true,
        version: status.version,
        uptime: status.uptime,
        sessions: status.sessions
      }
    } catch {
      return { connected: false }
    }
  }

  /**
   * 获取连接配置
   */
  getConfig(): Required<OpenClawAdapterConfig> {
    return { ...this.config }
  }
}

// ============ 工厂函数 ============

/**
 * 创建 OpenClaw 适配器实例
 */
export function createOpenClawAdapter(config?: OpenClawAdapterConfig): OpenClawAdapter {
  return new OpenClawAdapter(config)
}

// ============ 默认实例 ============

export const openClawAdapter = new OpenClawAdapter()

export default OpenClawAdapter
