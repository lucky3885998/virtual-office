/**
 * 组织数据服务
 * 
 * 职责：
 * 1. 管理成员数据（CRUD）
 * 2. 管理任务数据
 * 3. 管理消息数据
 * 4. 提供数据查询接口
 * 5. 触发数据变更事件
 */

import { members as configMembers, getAllReports as getConfigReports, getOrgStats as getConfigStats } from '../data/members'
import { STATUS_COLORS, STATUS_EMOJI } from '../adapters/types'

class OrgService {
  constructor() {
    this.listeners = new Set()
    this.data = {
      members: [...configMembers],
      tasks: [],
      messages: [],
      activities: []
    }
  }

  // ============ 订阅机制 ============

  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  emit(event) {
    this.listeners.forEach(cb => cb(event))
  }

  // ============ 成员管理 ============

  getMembers() {
    return [...this.data.members]
  }

  getMember(id) {
    return this.data.members.find(m => m.id === id)
  }

  getMembersByDepartment(deptId) {
    return this.data.members.filter(m => m.department === deptId)
  }

  getMembersByStatus(status) {
    return this.data.members.filter(m => m.status === status)
  }

  updateMemberStatus(id, newStatus) {
    const member = this.data.members.find(m => m.id === id)
    if (!member) return false

    const oldStatus = member.status
    if (oldStatus === newStatus) return false

    member.status = newStatus
    
    // 触发更新事件
    this.emit({
      type: 'member_status_changed',
      data: { memberId: id, oldStatus, newStatus },
      timestamp: Date.now()
    })

    return true
  }

  // ============ 任务管理 ============

  getTasks() {
    return [...this.data.tasks]
  }

  getTasksByAssignee(assigneeId) {
    return this.data.tasks.filter(t => t.assignee === assigneeId)
  }

  addTask(task) {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      status: task.status || 'pending',
      createdAt: new Date().toISOString()
    }
    this.data.tasks.push(newTask)
    
    this.emit({
      type: 'task_created',
      data: newTask,
      timestamp: Date.now()
    })
    
    return newTask
  }

  updateTaskStatus(taskId, newStatus) {
    const task = this.data.tasks.find(t => t.id === taskId)
    if (!task) return false

    task.status = newStatus
    if (newStatus === 'completed') {
      task.completedAt = new Date().toISOString()
    }
    
    this.emit({
      type: 'task_status_changed',
      data: { taskId, oldStatus: task.status, newStatus },
      timestamp: Date.now()
    })
    
    return true
  }

  // ============ 消息管理 ============

  getMessages(limit = 50) {
    return this.data.messages.slice(-limit)
  }

  addMessage(message) {
    const newMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: Date.now()
    }
    this.data.messages.push(newMessage)
    
    this.emit({
      type: 'message_received',
      data: newMessage,
      timestamp: Date.now()
    })
    
    return newMessage
  }

  // ============ 活动记录 ============

  getActivities(limit = 20) {
    return this.data.activities.slice(-limit)
  }

  addActivity(activity) {
    const newActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: Date.now()
    }
    this.data.activities.push(newActivity)
    
    if (this.data.activities.length > 100) {
      this.data.activities.shift()
    }
    
    return newActivity
  }

  // ============ 统计数据 ============

  getOrgStats() {
    const members = this.data.members
    return {
      total: members.length,
      byStatus: {
        working: members.filter(m => m.status === 'working').length,
        idle: members.filter(m => m.status === 'idle').length,
        busy: members.filter(m => m.status === 'busy').length,
        offline: members.filter(m => m.status === 'offline').length
      },
      byDepartment: this.getDepartmentStats()
    }
  }

  getDepartmentStats() {
    const depts = {}
    this.data.members.forEach(m => {
      if (!depts[m.department]) {
        depts[m.department] = { total: 0, members: [] }
      }
      depts[m.department].total++
      depts[m.department].members.push(m)
    })
    return depts
  }

  // ============ 报告管理 ============

  getReports() {
    return this.data.members
      .filter(m => m.lastReport)
      .map(m => ({
        ...m.lastReport,
        memberId: m.id,
        memberName: m.name,
        memberTitle: m.title,
        department: m.department,
        status: m.status
      }))
      .sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  // ============ 状态颜色/图标 ============

  getStatusColor(status) {
    return STATUS_COLORS[status] || '#71717a'
  }

  getStatusEmoji(status) {
    return STATUS_EMOJI[status] || '❓'
  }
}

// 单例导出
export const orgService = new OrgService()
export default OrgService
