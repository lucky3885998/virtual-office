/**
 * useOfficeMembersFromOpenClaw - OpenClaw 真实成员数据 Hook
 *
 * 从 OpenClaw sessions 数据动态生成虚拟办公室成员
 * 完全替代静态的 members.config.js
 */

import { useState, useEffect, useCallback } from 'react'

// Bridge API 地址
const BRIDGE_URL = 'http://localhost:18792'
const POLL_INTERVAL = 10000 // 10秒

// 部门配置（从 OpenClaw 数据动态分配）
function assignDepartment(agent) {
  if (agent.isMain) return 'COO'
  if (agent.isSubAgent) return 'IT'
  if (agent.channel === 'telegram') return 'COO'
  if (agent.channel === 'discord') return 'COO'
  if (agent.channel === 'whatsapp') return 'SAL'
  return 'OPR'
}

// 状态颜色
function statusToColor(status) {
  const colors = {
    working: '#22c55e',
    idle: '#eab308',
    busy: '#ef4444',
    offline: '#71717a'
  }
  return colors[status] || colors.offline
}

// 从 OpenClaw 数据转换为办公室成员
function transformAgentToMember(agent) {
  const dept = assignDepartment(agent)
  const deptConfig = DEPARTMENTS[dept] || DEPARTMENTS.OPR

  return {
    id: agent.id,
    name: agent.name,
    title: agent.title || agent.subtitle || getTitleFromAgent(agent),
    department: dept,
    status: agent.status,
    statusColor: statusToColor(agent.status),
    // OpenClaw 原始数据
    openClawData: {
      id: agent.id,
      model: agent.model,
      totalTokens: agent.totalTokens,
      costUsd: agent.costUsd,
      skills: agent.skills,
      skillsCount: agent.skillsCount,
      lastChannel: agent.lastChannel,
      totalTasks: agent.totalTasks,
      doneTasks: agent.doneTasks,
      failedTasks: agent.failedTasks,
      updatedAt: agent.updatedAt
    },
    // 当前任务（动态生成）
    currentTask: getCurrentTask(agent),
    // 位置信息后面由 layout engine 计算
    position: null
  }
}

function getTitleFromAgent(agent) {
  if (agent.isMain) return 'AI 首席运营官'
  if (agent.isSubAgent) return 'AI 任务助手'
  if (agent.channel) return `${agent.channel} 会话`
  return '团队成员'
}

function getCurrentTask(agent) {
  if (agent.isMain) {
    return `${agent.skillsCount || 0} 个技能激活`
  }
  if (agent.isSubAgent) {
    return `${agent.totalTasks || 0} 个任务 (${agent.doneTasks || 0} 成功)`
  }
  return '在线'
}

// 部门定义
export const DEPARTMENTS = {
  CEO: { id: 'CEO', name: '总裁办', icon: '👑', color: '#FFD700' },
  COO: { id: 'COO', name: '运营部', icon: '⚡', color: '#3B82F6' },
  IT: { id: 'IT', name: '技术部', icon: '💻', color: '#06B6D4' },
  SAL: { id: 'SAL', name: '销售部', icon: '💰', color: '#10B981' },
  MKT: { id: 'MKT', name: '市场部', icon: '📢', color: '#FF6B6B' },
  DEL: { id: 'DEL', name: '交付部', icon: '🎯', color: '#8B5CF6' },
  FIN: { id: 'FIN', name: '财务部', icon: '📊', color: '#F59E0B' },
  OPR: { id: 'OPR', name: '运营部', icon: '📋', color: '#EC4899' }
}

// 部门布局
export const DEPT_LAYOUT = [
  { id: 'CEO', x: 0, y: 4 },
  { id: 'COO', x: 0, y: 2 },
  { id: 'IT', x: -4, y: 0 },
  { id: 'MKT', x: 4, y: 0 },
  { id: 'SAL', x: -4, y: -2 },
  { id: 'DEL', x: 4, y: -2 },
  { id: 'FIN', x: -4, y: -4 },
  { id: 'OPR', x: 4, y: -4 }
]

/**
 * Hook: 获取 OpenClaw 驱动的办公室成员
 */
export function useOfficeMembersFromOpenClaw() {
  const [members, setMembers] = useState([])
  const [departments, setDepartments] = useState(DEPARTMENTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  // 计算成员位置
  const computePositions = useCallback((memberList) => {
    if (!memberList.length) return []

    // 按部门分组
    const deptGroups = {}
    memberList.forEach(m => {
      if (!deptGroups[m.department]) deptGroups[m.department] = []
      deptGroups[m.department].push(m)
    })

    // 为每个成员计算位置
    return memberList.map(member => {
      const deptLayout = DEPT_LAYOUT.find(d => d.id === member.department) || { x: 0, y: 0 }
      const sameDeptMembers = deptGroups[member.department]
      const indexInDept = sameDeptMembers.indexOf(member)
      const totalInDept = sameDeptMembers.length

      // 同一部门横向排列
      const spacing = 2.0
      const offsetX = (totalInDept - 1) * spacing / 2

      return {
        ...member,
        position: {
          x: deptLayout.x + indexInDept * spacing - offsetX,
          y: deptLayout.y,
          z: 0
        }
      }
    })
  }, [])

  // 获取真实数据
  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`${BRIDGE_URL}/api/agents`, {
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const agents = data.agents || []

      if (!agents.length) {
        setError('No agents found')
        return
      }

      // 转换
      const transformed = agents.map(transformAgentToMember)
      const withPositions = computePositions(transformed)

      setMembers(withPositions)
      setDepartments(DEPARTMENTS)
      setError(null)
      setLastSync(new Date())
      setLoading(false)

      console.log('[OfficeMembers] Updated:', withPositions.length, 'members')
    } catch (err) {
      console.warn('[OfficeMembers] Fetch error:', err.message)
      setError(err.message)
    }
  }, [computePositions])

  // 初始加载 + 定时刷新
  useEffect(() => {
    fetchMembers()

    const interval = setInterval(fetchMembers, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchMembers])

  return {
    members,
    departments,
    loading,
    error,
    lastSync,
    refresh: fetchMembers
  }
}

export default useOfficeMembersFromOpenClaw
