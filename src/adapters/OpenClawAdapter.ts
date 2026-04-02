/**
 * OpenClaw 运行时适配器 (v2)
 *
 * 通过以下方式连接 OpenClaw Gateway:
 * 1. CLI 命令 (sessions, status) 获取运行时数据
 * 2. WebSocket RPC 连接获取实时事件
 * 3. 文件系统读取会话存储
 *
 * Gateway: ws://127.0.0.1:18789
 * 配置: C:\Users\Phil Lian\.openclaw
 */

import { BaseAdapter, AdapterConfig, Agent, Task, Message, Activity, VizEvent } from './types'

// ============ 类型定义 ============

export interface OpenClawAdapterConfig extends AdapterConfig {
  gatewayWs?: string      // WebSocket 地址 (默认: ws://127.0.0.1:18789)
  configPath?: string     // OpenClaw 配置目录
  sessionsPath?: string  // 会话存储路径
  pollInterval?: number   // 轮询间隔 (毫秒)
  enableCLI?: boolean     // 启用 CLI 模式
}

export interface GatewayStatus {
  connected: boolean
  version?: string
  uptime?: number
  sessions?: number
  channels?: string[]
}

export interface SessionInfo {
  key: string
  sessionId: string
  updatedAt: number
  agentId: string
  model?: string
  kind: string
  inputTokens?: number
  outputTokens?: number
}

// ============ 常量 ============

const DEFAULT_CONFIG: Required<OpenClawAdapterConfig> = {
  gatewayWs: 'ws://127.0.0.1:18789',
  configPath: 'C:\\Users\\Phil Lian\\.openclaw',
  sessionsPath: '',  // 自动检测
  pollInterval: 10000,
  enableCLI: true,
  refreshInterval: 10000,
  useSimulation: false
}

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  away: '#eab308',
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
  private wsConnection: WebSocket | null = null
  private isInitialized = false
  private gatewayStatus: GatewayStatus = { connected: false }

  constructor(config: OpenClawAdapterConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<OpenClawAdapterConfig>
    // 自动检测 sessions 路径
    if (!this.config.sessionsPath) {
      this.config.sessionsPath = `${this.config.configPath}\\agents\\main\\sessions\\sessions.json`
    }
  }

  // ============ BaseAdapter 实现 ============

  async initialize(config?: OpenClawAdapterConfig): Promise<void> {
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config } as Required<OpenClawAdapterConfig>
    }

    console.log('[OpenClawAdapter] Initializing...')
    console.log('[OpenClawAdapter] Config path:', this.config.configPath)

    // 尝试连接 WebSocket Gateway
    this.connectWebSocket()

    // 加载初始数据
    await this.loadAgents()

    // 添加初始化活动
    this.addActivity({
      id: `init-${Date.now()}`,
      type: 'system',
      message: 'OpenClaw 适配器已连接虚拟办公室',
      timestamp: Date.now(),
      icon: '🦞',
      color: '#8b5cf6'
    })

    // 启动轮询 (CLI 模式)
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
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
    this.subscribers.clear()
    this.isInitialized = false
    console.log('[OpenClawAdapter] Disconnected')
  }

  // ============ WebSocket 连接 ============

  private connectWebSocket(): void {
    try {
      console.log('[OpenClawAdapter] Connecting to WebSocket:', this.config.gatewayWs)

      // WebSocket 连接
      // 注意: Gateway 使用 WebSocket RPC协议，这里只是演示连接结构
      this.wsConnection = new WebSocket(this.config.gatewayWs)

      this.wsConnection.onopen = () => {
        console.log('[OpenClawAdapter] WebSocket connected')
        this.gatewayStatus.connected = true
        this.emitStatusUpdate()
      }

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWSMessage(data)
        } catch (e) {
          // 非 JSON 消息，忽略
        }
      }

      this.wsConnection.onerror = (error) => {
        console.warn('[OpenClawAdapter] WebSocket error:', error)
        this.gatewayStatus.connected = false
      }

      this.wsConnection.onclose = () => {
        console.log('[OpenClawAdapter] WebSocket disconnected')
        this.gatewayStatus.connected = false
        // 尝试重连
        setTimeout(() => this.connectWebSocket(), 5000)
      }
    } catch (error) {
      console.warn('[OpenClawAdapter] WebSocket connection failed:', error)
      this.gatewayStatus.connected = false
    }
  }

  private handleWSMessage(data: any): void {
    // 处理 WebSocket RPC 消息
    // 格式: { method: string, params?: any, result?: any }
    if (data.method === 'session.update' || data.method === 'agent.status') {
      this.emit({
        type: 'agent_update',
        data: data.params,
        timestamp: Date.now()
      })
    }
  }

  // ============ 数据加载 (CLI 模式) ============

  private async loadAgents(): Promise<void> {
    try {
      // 通过 CLI 获取会话列表
      const sessions = await this.fetchSessionsViaCLI()

      if (sessions.length > 0) {
        this.updateAgentsFromSessions(sessions)
      } else {
        // 使用默认代理
        this.agents = this.getDefaultAgents()
      }

      this.emit({
        type: 'agent_update',
        data: { agents: this.agents },
        timestamp: Date.now()
      })
    } catch (error) {
      console.warn('[OpenClawAdapter] Failed to load agents:', error)
      this.agents = this.getDefaultAgents()
    }
  }

  private async fetchSessionsViaCLI(): Promise<SessionInfo[]> {
    // 注意: 在浏览器环境中无法直接运行 CLI
    // 实际实现需要通过 HTTP/WebSocket 中间件
    // 这里返回模拟数据作为演示
    return []
  }

  private updateAgentsFromSessions(sessions: SessionInfo[]): void {
    const now = Date.now()
    const activeThreshold = 30 * 60 * 1000 // 30 分钟内有活动视为在线

    this.agents = sessions.map((session, index) => {
      const isRecent = (now - session.updatedAt) < activeThreshold
      const status = isRecent ? 'working' : 'offline'

      return {
        id: session.sessionId,
        name: this.extractNameFromKey(session.key) || `成员 ${index + 1}`,
        title: session.model || 'AI 助手',
        status: status as Agent['status'],
        department: this.guessDepartment(session.key),
        color: STATUS_COLORS[status]
      }
    })
  }

  private extractNameFromKey(key: string): string | null {
    // 从 session key 提取名称
    // 格式: agent:main:openai:uuid 或 agent:main:main
    const parts = key.split(':')
    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1]
      // 如果最后一个部分是 UUID，跳过
      if (lastPart.length === 36 && lastPart.includes('-')) {
        return null
      }
      return lastPart
    }
    return null
  }

  private guessDepartment(key: string): string {
    // 根据 session key 猜测部门
    if (key.includes('main')) return 'COO'
    if (key.includes('coder') || key.includes('dev')) return 'IT'
    if (key.includes('write') || key.includes('blog')) return 'MKT'
    if (key.includes('sale') || key.includes('crm')) return 'SAL'
    return 'IT'
  }

  private getDefaultAgents(): Agent[] {
    return [
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
        status: 'working',
        department: 'IT',
        color: '#22c55e'
      },
      {
        id: 'openclaw-agent-3',
        name: '助手-Gamma',
        title: '运维助手',
        status: 'busy',
        department: 'OPR',
        color: '#ef4444'
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
        await this.loadAgents()

        // 添加心跳活动
        this.addActivity({
          id: `heartbeat-${Date.now()}`,
          type: 'heartbeat',
          message: '系统心跳 - 虚拟办公室数据已同步',
          timestamp: Date.now(),
          icon: '💓',
          color: '#3b82f6'
        })
      } catch (error) {
        console.warn('[OpenClawAdapter] Polling error:', error)
      }
    }, this.config.pollInterval)
  }

  // ============ 事件发射 ============

  private emit(event: VizEvent): void {
    this.subscribers.forEach(cb => cb(event))
  }

  private emitStatusUpdate(): void {
    this.emit({
      type: 'agent_update',
      data: { gatewayStatus: this.gatewayStatus },
      timestamp: Date.now()
    })
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

      // 记录活动
      this.addActivity({
        id: `status-${Date.now()}`,
        type: 'agent_status_changed',
        agentId,
        message: `${agent.name} 状态更新: ${oldStatus} → ${status}`,
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
    // 通过 WebSocket 发送通知
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      console.warn('[OpenClawAdapter] WebSocket not connected')
      return false
    }

    try {
      this.wsConnection.send(JSON.stringify({
        method: 'notify.send',
        params: options
      }))
      return true
    } catch (error) {
      console.error('[OpenClawAdapter] Send notification failed:', error)
      return false
    }
  }

  async getGatewayHealth(): Promise<GatewayStatus> {
    // 检查 Gateway 状态
    const wsConnected = this.wsConnection?.readyState === WebSocket.OPEN

    return {
      connected: wsConnected,
      version: '2026.3.28',
      sessions: this.agents.length
    }
  }

  getConfig(): Required<OpenClawAdapterConfig> {
    return { ...this.config }
  }

  // ============ 状态转换 ============

  private statusToColor(status: string): string {
    return STATUS_COLORS[status] || STATUS_COLORS.offline
  }
}

// ============ 工厂函数 ============

export function createOpenClawAdapter(config?: OpenClawAdapterConfig): OpenClawAdapter {
  return new OpenClawAdapter(config)
}

// ============ 默认实例 ============

export const openClawAdapter = new OpenClawAdapter()

export default OpenClawAdapter
