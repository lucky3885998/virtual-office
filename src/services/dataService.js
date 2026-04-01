// 实时数据服务 - v0.2.0
// 支持模拟数据源和真实API对接

import { useOfficeStore } from '../stores/officeStore'

// ========== 配置 ==========
const CONFIG = {
  // 数据刷新间隔（毫秒）
  refreshInterval: 5000,
  
  // 状态自动切换概率
  statusChangeProbability: 0.15,
  
  // 模拟消息间隔（毫秒）
  messageInterval: 45000,
  
  // API基础URL（真实对接时启用）
  apiBaseUrl: '',
  
  // 是否使用模拟数据
  useSimulation: true
}

// ========== 状态定义 ==========
const STATUSES = ['working', 'idle', 'busy', 'offline']

const STATUS_WEIGHTS = {
  working: 0.4,   // 40% 工作中
  idle: 0.3,      // 30% 待命
  busy: 0.2,      // 20% 忙碌
  offline: 0.1    // 10% 离线
}

// ========== 模拟任务数据 ==========
const SIMULATED_TASKS = [
  '优化营销文案',
  '处理客户咨询',
  '编写技术方案',
  '数据分析报告',
  '审核合同条款',
  '跟进项目进度',
  '协调资源分配',
  '召开部门会议',
  '培训新员工',
  '维护客户关系',
  '代码审查',
  '安全漏洞修复',
  '性能优化',
  '文档整理',
  '预算审核'
]

const PRIORITY_MAP = { high: '🔴高', medium: '🟡中', low: '🟢低' }

// ========== 工具函数 ==========
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)]

const weightedRandomChoice = (weights) => {
  const rand = Math.random()
  let cumulative = 0
  for (const [status, weight] of Object.entries(weights)) {
    cumulative += weight
    if (rand <= cumulative) return status
  }
  return 'working'
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// ========== 数据模拟器 ==========
class RealTimeSimulator {
  constructor() {
    this.intervalId = null
    this.messageIntervalId = null
    this.isRunning = false
    this.listeners = new Set()
  }

  // 订阅数据变化
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // 通知所有监听器
  notify(data) {
    this.listeners.forEach(cb => cb(data))
  }

  // 生成随机状态
  generateRandomStatus(currentStatus, member) {
    // 有进行中任务的成员更可能是忙碌
    if (member.currentTask && !member.currentTask.includes('待命')) {
      return Math.random() < 0.6 ? 'busy' : currentStatus
    }
    
    // 根据权重随机选择
    return weightedRandomChoice(STATUS_WEIGHTS)
  }

  // 生成模拟任务
  generateSimulatedTask(assignee) {
    const priorities = ['high', 'medium', 'low']
    const priority = randomChoice(priorities)
    
    return {
      id: generateId(),
      title: randomChoice(SIMULATED_TASKS),
      assignee,
      department: 'GENERAL',
      priority,
      status: 'pending',
      deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString()
    }
  }

  // 生成模拟消息
  generateSimulatedMessage(members) {
    const messageTemplates = [
      { template: '{name} 完成了任务: {task}', type: 'system' },
      { template: '{name} 将状态更新为: {status}', type: 'status' },
      { template: '新任务已分配给 {name}', type: 'task' },
      { template: '{name} 提交了工作报告', type: 'report' }
    ]
    
    const statusLabels = { working: '工作中', idle: '待命', busy: '忙碌', offline: '离线' }
    const randomMember = randomChoice(members)
    const randomTemplate = randomChoice(messageTemplates)
    
    const content = randomTemplate.template
      .replace('{name}', randomMember.name)
      .replace('{task}', randomChoice(SIMULATED_TASKS))
      .replace('{status}', statusLabels[randomChoice(STATUSES)])
    
    return {
      id: generateId(),
      from: 'system',
      to: 'all',
      content,
      type: randomTemplate.type,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: Date.now()
    }
  }

  // 执行数据更新
  tick() {
    const store = useOfficeStore.getState()
    const { members, tasks } = store
    
    // 1. 更新成员状态（随机）
    const statusUpdates = []
    members.forEach(member => {
      if (Math.random() < CONFIG.statusChangeProbability) {
        const newStatus = this.generateRandomStatus(member.status, member)
        if (newStatus !== member.status) {
          statusUpdates.push({ memberId: member.id, status: newStatus })
        }
      }
    })

    // 2. 更新任务进度（模拟）
    const taskUpdates = []
    const executingTasks = store.executingTasks
    Object.entries(executingTasks).forEach(([taskId, exec]) => {
      const elapsed = Date.now() - exec.startTime
      const progress = Math.min(100, (elapsed / exec.duration) * 100)
      if (progress >= 100) {
        taskUpdates.push({ taskId, status: 'completed' })
      }
    })

    // 3. 生成新任务（低概率）
    let newTask = null
    if (Math.random() < 0.1) {
      const randomMember = randomChoice(members)
      newTask = this.generateSimulatedTask(randomMember.id)
    }

    // 4. 通知更新
    if (statusUpdates.length > 0 || taskUpdates.length > 0 || newTask) {
      this.notify({
        type: 'data_update',
        statusUpdates,
        taskUpdates,
        newTask,
        timestamp: Date.now()
      })
    }
  }

  // 发送模拟消息
  sendSimulatedMessage() {
    const store = useOfficeStore.getState()
    const { members } = store
    
    const message = this.generateSimulatedMessage(members)
    this.notify({
      type: 'new_message',
      message,
      timestamp: Date.now()
    })
  }

  // 启动
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    
    // 主更新循环
    this.intervalId = setInterval(() => {
      this.tick()
    }, CONFIG.refreshInterval)
    
    // 消息模拟循环
    this.messageIntervalId = setInterval(() => {
      this.sendSimulatedMessage()
    }, CONFIG.messageInterval)

    console.log('[RealTimeService] Started with config:', CONFIG)
  }

  // 停止
  stop() {
    if (!this.isRunning) return
    
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    if (this.messageIntervalId) {
      clearInterval(this.messageIntervalId)
      this.messageIntervalId = null
    }
    
    console.log('[RealTimeService] Stopped')
  }

  // 更新配置
  updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig)
    
    // 如果服务正在运行，需要重启以应用新配置
    if (this.isRunning) {
      this.stop()
      this.start()
    }
  }

  // 获取当前配置
  getConfig() {
    return { ...CONFIG }
  }
}

// ========== API客户端（真实对接时使用）==========
class APIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[APIClient] Request failed:', error)
      throw error
    }
  }

  // 成员API
  async getMembers() {
    return this.request('/api/members')
  }

  async getMemberStatus(memberId) {
    return this.request(`/api/members/${memberId}/status`)
  }

  // 任务API
  async getTasks() {
    return this.request('/api/tasks')
  }

  async updateTaskStatus(taskId, status) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  // 消息API
  async getMessages() {
    return this.request('/api/messages')
  }

  async sendMessage(message) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(message)
    })
  }
}

// ========== 单例导出 ==========
export const realtimeSimulator = new RealTimeSimulator()
export const apiClient = new APIClient(CONFIG.apiBaseUrl)

// ========== React Hook ==========
import { useEffect, useRef, useCallback } from 'react'

export function useRealTimeData(options = {}) {
  const { 
    onStatusUpdate, 
    onTaskUpdate, 
    onNewMessage,
    onDataUpdate,
    enabled = true 
  } = options
  
  const callbacksRef = useRef({ onStatusUpdate, onTaskUpdate, onNewMessage, onDataUpdate })
  
  // 更新回调引用
  useEffect(() => {
    callbacksRef.current = { onStatusUpdate, onTaskUpdate, onNewMessage, onDataUpdate }
  }, [onStatusUpdate, onTaskUpdate, onNewMessage, onDataUpdate])

  useEffect(() => {
    if (!enabled) {
      realtimeSimulator.stop()
      return
    }

    // 订阅数据变化
    const unsubscribe = realtimeSimulator.subscribe((data) => {
      const { type, statusUpdates, taskUpdates, newTask, message } = data

      switch (type) {
        case 'data_update':
          // 处理数据更新
          if (statusUpdates?.length > 0) {
            statusUpdates.forEach(({ memberId, status }) => {
              useOfficeStore.getState().updateMemberStatus(memberId, status)
            })
          }
          
          if (taskUpdates?.length > 0) {
            taskUpdates.forEach(({ taskId, status }) => {
              useOfficeStore.getState().updateTaskStatus(taskId, status)
            })
          }
          
          if (newTask) {
            useOfficeStore.getState().addTask(newTask)
          }
          
          callbacksRef.current.onDataUpdate?.(data)
          break

        case 'new_message':
          useOfficeStore.getState().sendMessage(message)
          callbacksRef.current.onNewMessage?.(message)
          break
      }
    })

    // 启动服务
    realtimeSimulator.start()

    return () => {
      unsubscribe()
      realtimeSimulator.stop()
    }
  }, [enabled])
}

// ========== 默认导出 ==========
export default {
  realtimeSimulator,
  apiClient,
  useRealTimeData,
  CONFIG
}
