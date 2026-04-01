// 本地数据适配器
// 将现有的本地数据转换为通用接口

import { BaseAdapter, AdapterConfig, Agent, Task, Message, Activity, VizEvent, STATUS_COLORS } from './types'

// 导入现有数据（这只是演示，实际使用时通过参数传入）
const LOCAL_AGENTS: Agent[] = [
  { id: 'CEO-01', name: '李明', title: '首席执行官', status: 'working', department: 'CEO', color: '#f59e0b' },
  { id: 'COO-01', name: '王芳', title: '首席运营官', status: 'working', department: 'COO', color: '#3b82f6' },
  { id: 'MKT-01', name: '张伟', title: '市场总监', status: 'idle', department: 'MKT', color: '#10b981' },
  { id: 'SAL-01', name: '刘洋', title: '销售总监', status: 'busy', department: 'SAL', color: '#8b5cf6' },
  { id: 'IT-01-01', name: '陈静', title: '高级工程师', status: 'working', department: 'IT', color: '#ec4899' },
  { id: 'IT-01-02', name: '赵强', title: '工程师', status: 'idle', department: 'IT', color: '#06b6d4' },
  { id: 'DEL-01', name: '孙丽', title: '交付经理', status: 'working', department: 'DEL', color: '#14b8a6' },
  { id: 'FIN-01', name: '周杰', title: '财务经理', status: 'offline', department: 'FIN', color: '#f97316' },
  { id: 'OPR-01', name: '吴敏', title: '运维工程师', status: 'working', department: 'OPR', color: '#84cc16' },
]

export class LocalAdapter implements BaseAdapter {
  private config: AdapterConfig = {}
  private subscribers: Set<(event: VizEvent) => void> = new Set()
  private agents: Agent[] = [...LOCAL_AGENTS]
  private tasks: Task[] = []
  private activities: Activity[] = []
  private intervalId: NodeJS.Timeout | null = null

  async initialize(config: AdapterConfig = {}): Promise<void> {
    this.config = config
    const interval = config.refreshInterval || 5000
    
    // 启动定时模拟
    this.intervalId = setInterval(() => {
      this.simulateStatusChange()
    }, interval)
    
    console.log('[LocalAdapter] Initialized')
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
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.subscribers.clear()
    console.log('[LocalAdapter] Disconnected')
  }

  // 设置代理数据
  setAgents(agents: Agent[]): void {
    this.agents = agents
    this.emit({
      type: 'agent_update',
      data: { agents },
      timestamp: Date.now()
    })
  }

  // 设置任务数据
  setTasks(tasks: Task[]): void {
    this.tasks = tasks
    this.emit({
      type: 'task_update',
      data: { tasks },
      timestamp: Date.now()
    })
  }

  // 更新单个代理状态
  updateAgentStatus(agentId: string, status: Agent['status']): void {
    const agent = this.agents.find(a => a.id === agentId)
    if (agent && agent.status !== status) {
      agent.status = status
      this.emit({
        type: 'agent_update',
        data: { agentId, status },
        timestamp: Date.now()
      })
    }
  }

  // 添加活动记录
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

  private emit(event: VizEvent): void {
    this.subscribers.forEach(cb => cb(event))
  }

  private simulateStatusChange(): void {
    if (this.agents.length === 0) return
    
    const randomAgent = this.agents[Math.floor(Math.random() * this.agents.length)]
    const statuses: Agent['status'][] = ['working', 'idle', 'busy', 'offline']
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    if (randomAgent.status !== newStatus) {
      const oldStatus = randomAgent.status
      randomAgent.status = newStatus
      
      this.emit({
        type: 'agent_update',
        data: { agentId: randomAgent.id, oldStatus, newStatus },
        timestamp: Date.now()
      })
      
      // 添加活动记录
      const statusLabels = { working: '工作中', idle: '待命', busy: '忙碌', offline: '离线' }
      this.addActivity({
        id: `activity-${Date.now()}`,
        type: 'agent_status_changed',
        agentId: randomAgent.id,
        message: `${randomAgent.name} 从 ${statusLabels[oldStatus]} 变为 ${statusLabels[newStatus]}`,
        timestamp: Date.now(),
        icon: '🔄',
        color: STATUS_COLORS[newStatus]
      })
    }
  }
}

// 默认实例
export const localAdapter = new LocalAdapter()

export default LocalAdapter
