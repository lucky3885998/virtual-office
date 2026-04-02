/**
 * useOpenClawSync - OpenClaw 数据同步 Hook
 *
 * 从 OpenClaw 获取真实成员数据，完全替换虚拟办公室的成员列表
 * 虚拟办公室的成员由 OpenClaw 真实数据驱动
 *
 * 数据来源: http://localhost:18792/api/agents
 */

import { useEffect, useRef, useCallback } from 'react'
import useOfficeStore from '../stores/officeStore'

const BRIDGE_URL = 'http://localhost:18792'
const POLL_INTERVAL = 10000 // 10秒

// 状态到颜色的映射
const STATUS_COLORS = {
  working: '#22c55e',
  idle: '#eab308',
  busy: '#ef4444',
  offline: '#71717a'
}

// 部门配置
const DEPARTMENTS = {
  COO: { id: 'COO', name: '运营部', icon: '⚡', color: '#3B82F6' },
  IT: { id: 'IT', name: '技术部', icon: '💻', color: '#06B6D4' },
  MKT: { id: 'MKT', name: '市场部', icon: '📢', color: '#FF6B6B' },
  SAL: { id: 'SAL', name: '销售部', icon: '💰', color: '#10B981' }
}

// 根据 Agent 数据分配部门
function assignDepartment(agent) {
  if (agent.isMain) return 'COO'
  if (agent.isSubAgent) return 'IT'
  if (agent.channel === 'telegram') return 'COO'
  if (agent.channel === 'discord') return 'COO'
  if (agent.channel === 'whatsapp') return 'SAL'
  return 'COO'
}

// 转换 OpenClaw Agent 为办公室成员
function transformAgent(agent) {
  const dept = assignDepartment(agent)
  const deptInfo = DEPARTMENTS[dept] || DEPARTMENTS.COO

  return {
    id: agent.id,
    name: agent.name,
    title: agent.isMain ? 'AI 首席运营官' : 
           agent.isSubAgent ? 'AI 任务助手' : 
           agent.subtitle || '团队成员',
    department: dept,
    status: agent.status,
    statusColor: STATUS_COLORS[agent.status] || STATUS_COLORS.offline,
    position: null, // 后面由布局引擎计算
    currentTask: agent.isMain ? `${agent.skillsCount || 0} 个技能激活` :
                agent.isSubAgent ? `${agent.totalTasks || 0} 个任务 (${agent.doneTasks || 0} 成功)` :
                '在线',
    lastReport: null,
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
      updatedAt: agent.updatedAt,
      subtitle: agent.subtitle
    }
  }
}

export function useOpenClawSync() {
  const initialized = useRef(false)
  const setMembersFromOpenClaw = useOfficeStore(state => state.setMembersFromOpenClaw)

  const sync = useCallback(async () => {
    try {
      const response = await fetch(`${BRIDGE_URL}/api/agents`, {
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        console.warn('[OpenClawSync] Bridge error:', response.status)
        return
      }

      const data = await response.json()
      const agents = data.agents || []

      if (!agents.length) {
        console.warn('[OpenClawSync] No agents found')
        return
      }

      // 转换为办公室成员
      const members = agents.map(transformAgent)

      // 完全替换成员列表
      setMembersFromOpenClaw(members)

      console.log('[OpenClawSync] Updated:', members.length, 'members from OpenClaw')
    } catch (error) {
      console.warn('[OpenClawSync] Error:', error.message)
    }
  }, [setMembersFromOpenClaw])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    console.log('[OpenClawSync] Starting OpenClaw-driven office...')

    // 立即同步
    sync()

    // 定时同步
    const interval = setInterval(sync, POLL_INTERVAL)

    return () => {
      clearInterval(interval)
      console.log('[OpenClawSync] Stopped')
    }
  }, [sync])
}

export default useOpenClawSync
