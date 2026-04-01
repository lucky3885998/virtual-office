/**
 * Store 与 Service 桥接层
 * 
 * 职责：
 * 1. 初始化时从 Service 加载数据
 * 2. 订阅 Service 事件，更新 Store 状态
 * 3. 提供 Store Actions 调用 Service 方法
 */

import { orgService } from '../services/OrgService'
import { members, getAllReports } from '../data/members'

// Store 与 Service 的同步状态
let isSubscribed = false

/**
 * 初始化桥接 - 在 Store 创建后调用
 * 返回取消订阅函数
 */
export function initStoreBridge(store) {
  // 如果已经订阅，先取消
  if (isSubscribed) {
    return () => {}
  }
  
  // 订阅 Service 事件
  const unsubscribe = orgService.subscribe((event) => {
    const state = store.getState()
    
    switch (event.type) {
      case 'member_status_changed':
        // Service 更新了成员状态，同步到 Store
        const updatedMembers = state.members.map(m => {
          if (m.id === event.data.memberId) {
            return { ...m, status: event.data.newStatus }
          }
          return m
        })
        store.setState({
          members: updatedMembers,
          reports: getAllReports(updatedMembers),
          lastUpdateTime: new Date().toISOString()
        })
        break
        
      case 'task_created':
        // 新任务添加
        store.setState({
          tasks: [...state.tasks, event.data]
        })
        break
        
      case 'task_status_changed':
        // 任务状态更新
        store.setState({
          tasks: state.tasks.map(t => 
            t.id === event.data.taskId ? { ...t, status: event.data.newStatus } : t
          )
        })
        break
        
      case 'message_received':
        // 新消息
        store.setState({
          messages: [...state.messages, event.data]
        })
        break
        
      case 'activity_new':
        // 新活动
        store.setState({
          activities: [event.data, ...state.activities].slice(0, 50)
        })
        break
    }
  })
  
  isSubscribed = true
  
  return () => {
    unsubscribe()
    isSubscribed = false
  }
}

/**
 * 使用 Service 更新成员状态
 */
export function updateMemberStatusViaService(memberId, newStatus) {
  return orgService.updateMemberStatus(memberId, newStatus)
}

/**
 * 使用 Service 添加任务
 */
export function addTaskViaService(task) {
  return orgService.addTask(task)
}

/**
 * 使用 Service 更新任务状态
 */
export function updateTaskStatusViaService(taskId, newStatus) {
  return orgService.updateTaskStatus(taskId, newStatus)
}

/**
 * 使用 Service 发送消息
 */
export function sendMessageViaService(message) {
  return orgService.addMessage(message)
}

/**
 * 使用 Service 添加活动记录
 */
export function addActivityViaService(activity) {
  return orgService.addActivity(activity)
}

/**
 * 获取 Service 的统计数据
 */
export function getOrgStatsViaService() {
  return orgService.getOrgStats()
}

/**
 * 获取 Service 的报告列表
 */
export function getReportsViaService() {
  return orgService.getReports()
}
