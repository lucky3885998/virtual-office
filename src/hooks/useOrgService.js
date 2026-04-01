/**
 * useOrgService Hook
 * 
 * 组件可以通过这个 Hook 访问 Service 层的数据和操作
 * 
 * 使用方式：
 * 
 * const { members, stats, updateStatus } = useOrgService()
 */

import { useState, useEffect, useCallback } from 'react'
import { orgService } from '../services/OrgService'

export function useOrgService() {
  const [members, setMembers] = useState([])
  const [stats, setStats] = useState({ total: 0, byStatus: {}, byDepartment: {} })
  const [activities, setActivities] = useState([])
  
  // 初始化数据
  useEffect(() => {
    setMembers(orgService.getMembers())
    setStats(orgService.getOrgStats())
    setActivities(orgService.getActivities())
  }, [])
  
  // 订阅 Service 事件
  useEffect(() => {
    const unsubscribe = orgService.subscribe((event) => {
      switch (event.type) {
        case 'member_status_changed':
          setMembers([...orgService.getMembers()])
          setStats(orgService.getOrgStats())
          break
        case 'task_created':
        case 'task_status_changed':
          // 任务更新，不需要更新成员
          break
        case 'activity_new':
          setActivities(orgService.getActivities())
          break
      }
    })
    
    return unsubscribe
  }, [])
  
  // 操作方法
  const updateMemberStatus = useCallback((memberId, newStatus) => {
    return orgService.updateMemberStatus(memberId, newStatus)
  }, [])
  
  const addTask = useCallback((task) => {
    return orgService.addTask(task)
  }, [])
  
  const updateTaskStatus = useCallback((taskId, newStatus) => {
    return orgService.updateTaskStatus(taskId, newStatus)
  }, [])
  
  const sendMessage = useCallback((message) => {
    return orgService.addMessage(message)
  }, [])
  
  const addActivity = useCallback((activity) => {
    return orgService.addActivity(activity)
  }, [])
  
  return {
    // 数据
    members,
    stats,
    activities,
    
    // 方法
    updateMemberStatus,
    addTask,
    updateTaskStatus,
    sendMessage,
    addActivity,
    
    // 工具
    getStatusColor: (status) => orgService.getStatusColor(status),
    getStatusEmoji: (status) => orgService.getStatusEmoji(status),
    getReports: () => orgService.getReports()
  }
}

export default useOrgService
