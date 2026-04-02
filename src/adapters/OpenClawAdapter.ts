/**
 * OpenClaw 运行时适配器 (v3)
 *
 * 通过 Sessions Bridge (HTTP API) 连接 OpenClaw:
 * - 读取真实团队成员状态
 * - 支持本地和网络访问
 * - 自动同步 OpenClaw 会话数据
 *
 * Bridge API: http://localhost:18792
 * 网络访问:   http://<本机IP>:18792
 */

import { BaseAdapter, AdapterConfig, Agent, Task, Message, Activity, VizEvent } from './types'

// ============ 类型定义 ============

export interface OpenClawAdapterConfig extends AdapterConfig {
  bridgeUrl?: string    // Bridge HTTP API 地址 (默认: http://localhost:18792)
  pollInterval?: number // 轮询间隔 (毫秒)
}

export interface GatewayStatus {
  connected: boolean
  version?: string
  uptime?: number
  sessions?: number
  channels?: string[]
}

// ============ 常量 ============

const DEFAULT_CONFIG: Required<OpenClawAdapterConfig> = {
  bridgeUrl: 'http://localhost:18792',
  pollInterval: 10000,
  refreshInterval: 10000,
  useSimulation: false
}

// ============ 渠道名称映射 ============

const CHANNEL_NAMES: Record<string, string> = {
  openai: 'Web Chat',
  telegram: 'Telegram',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  signal: 'Signal',
  webchat: 'Web 聊天'
}

const STATUS_COLORS: Record<string, string> = {
  working: '#22c55e',
  idle: '#eab308',
  busy: '#ef4444',
  offline: '#71717a'
}

// ============ OpenClaw 适配器 ============

export class OpenClawAdapter implements BaseAdapter {
  private config: Required<OpenClawAdapterConfig>
  private subscribers: Set<(event: VizEvent) => void> = new Set()
  private agents: Agent[] = []
  private tasks: Task[] = []
  private activities: Activity[] = []
  private pollIntervalId: ReturnType<typeof setInterval> | null = null
  private isInitialized = false
  private gatewayStatus: GatewayStatus = { connected: false }

  constructor(config: OpenClawAdapterConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<OpenClawAdapterConfig>
  }

  // ============ BaseAdapter 实现 ============

  async initialize(config?: OpenClawAdapterConfig): Promise<void> {
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config } as Required<OpenClawAdapterConfig>
    }

    console.log('[OpenClawAdapter] Initializing...')
    console.log('[OpenClawAdapter] Bridge URL:', this.config.bridgeUrl)

    // 加载初始数据
    await this.loadAgents()

    // 添加初始化活动
    this.addActivity({
      id: `init-${Date.now()}`,
      type: 'system',
      message: 'OpenClaw 适配器已连接 (Bridge API)',
      timestamp: Date.now(),
      icon: '🦞',
      color: '#8b5cf6'
    })

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
    return []
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

  // ============ Bridge API 调用 ============

  private async fetchAgents(): Promise<any[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${this.config.bridgeUrl}/api/agents`, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      this.gatewayStatus.connected = true
      return data.agents || []
    } catch (error) {
      console.warn('[OpenClawAdapter] Fetch failed:', error)
      this.gatewayStatus.connected = false
      return []
    }
  }

  private async fetchHealth(): Promise<GatewayStatus> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${this.config.bridgeUrl}/health`, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        connected: data.status === 'ok',
        version: data.version,
        sessions: data.sessionsCount
      }
    } catch (error) {
      return { connected: false }
    }
  }

  // ============ 数据加载 ============

  private async loadAgents(): Promise<void> {
    const bridgeAgents = await this.fetchAgents()

    if (bridgeAgents.length > 0) {
      // 使用 Bridge 返回的真实数据
      this.agents = bridgeAgents.map(a => ({
        id: a.id,
        name: a.name,
        title: a.title || '',
        status: a.status as Agent['status'],
        department: a.department || 'COO',
        color: a.color || STATUS_COLORS[a.status] || STATUS_COLORS.offline,
        // 额外数据
        channel: a.channel,
        sessionCount: a.sessionCount,
        updatedAt: a.updatedAt,
        model: a.model,
        totalTokens: a.totalTokens,
        isMain: a.isMain
      }))
    } else {
      // 使用默认代理
      this.agents = this.getDefaultAgents()
    }

    this.emit({
      type: 'agent_update',
      data: { agents: this.agents },
      timestamp: Date.now()
    })
  }

  private getDefaultAgents(): Agent[] {
    return [
      {
        id: 'openclaw-main',
        name: 'Lucky-COO',
        title: 'AI 首席运营官',
        status: 'idle',
        department: 'COO',
        color: '#eab308'
      },
      {
        id: 'openclaw-agent-1',
        name: '助手-Alpha',
        title: '智能助手',
        status: 'idle',
        department: 'IT',
        color: '#10b981'
      },
      {
        id: 'openclaw-agent-2',
        name: '助手-Beta',
        title: '开发助手',
        status: 'idle',
        department: 'IT',
        color: '#10b981'
      }
    ]
  }

  // ============ 轮询 ============

  private startPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId)
    }

    this.pollIntervalId = setInterval(async () => {
      if (!this.isInitialized) return

      try {
        const [prevCount, prevStatus] = [this.agents.length, this.agents[0]?.status]

        await this.loadAgents()

        // 如果数据有变化，添加活动
        if (this.agents.length !== prevCount || this.agents[0]?.status !== prevStatus) {
          const mainAgent = this.agents.find(a => a.isMain)
          if (mainAgent) {
            this.addActivity({
              id: `sync-${Date.now()}`,
              type: 'heartbeat',
              message: `${mainAgent.name} 当前: ${mainAgent.status === 'working' ? '工作中' : '待命'}`,
              timestamp: Date.now(),
              icon: '🔄',
              color: STATUS_COLORS[mainAgent.status]
            })
          }
        }
      } catch (error) {
        console.warn('[OpenClawAdapter] Polling error:', error)
      }
    }, this.config.pollInterval)
  }

  // ============ 事件发射 ============

  private emit(event: VizEvent): void {
    this.subscribers.forEach(cb => cb(event))
  }

  // ============ 公共方法 ============

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
  }

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

      this.addActivity({
        id: `status-${Date.now()}`,
        type: 'agent_status_changed',
        agentId,
        message: `${agent.name}: ${oldStatus} → ${status}`,
        timestamp: Date.now(),
        icon: '🔄',
        color: STATUS_COLORS[status]
      })
    }
  }

  async sendMessage(options: {
    platform?: 'telegram' | 'discord' | 'whatsapp' | 'signal'
    to?: string
    message: string
  }): Promise<boolean> {
    // Bridge 目前只读，通知功能待实现
    console.warn('[OpenClawAdapter] Notification via Bridge not implemented yet')
    return false
  }

  async getGatewayHealth(): Promise<GatewayStatus> {
    return this.fetchHealth()
  }

  getConfig(): Required<OpenClawAdapterConfig> {
    return { ...this.config }
  }
}

// ============ 工厂函数 ============

export function createOpenClawAdapter(config?: OpenClawAdapterConfig): OpenClawAdapter {
  return new OpenClawAdapter(config)
}

// ============ 默认实例 ============

export const openClawAdapter = new OpenClawAdapter()

export default OpenClawAdapter
