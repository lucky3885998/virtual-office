/**
 * useOpenClawSync - OpenClaw 数据同步 Hook
 *
 * 从 OpenClaw 获取真实成员数据，混合填充虚拟办公室
 * 真实成员自动显示，虚构成员填充空部门
 */

import { useEffect, useRef, useCallback } from 'react'
import useOfficeStore from '../stores/officeStore'

const BRIDGE_URL = 'http://localhost:18792'
const POLL_INTERVAL = 10000

// 状态到颜色的映射
const STATUS_COLORS = {
  working: '#22c55e',
  idle: '#eab308',
  busy: '#ef4444',
  offline: '#71717a'
}

// 部门配置（全部部门）
const DEPARTMENTS = {
  CEO: { id: 'CEO', name: '总裁办', icon: '👑', color: '#FFD700' },
  COO: { id: 'COO', name: '运营部', icon: '⚡', color: '#3B82F6' },
  IT: { id: 'IT', name: '技术部', icon: '💻', color: '#06B6D4' },
  MKT: { id: 'MKT', name: '市场部', icon: '📢', color: '#FF6B6B' },
  SAL: { id: 'SAL', name: '销售部', icon: '💰', color: '#10B981' },
  DEL: { id: 'DEL', name: '交付部', icon: '🎯', color: '#8B5CF6' },
  FIN: { id: 'FIN', name: '财务部', icon: '📊', color: '#F59E0B' },
  OPR: { id: 'OPR', name: '运营部', icon: '📋', color: '#EC4899' }
}

// 虚构成员模板（填充空部门）
const FICTIONAL_MEMBERS = [
  // CEO
  { id: 'fictional-CEO-01', name: '虚构-CEO', title: '首席执行官', department: 'CEO', status: 'offline', statusColor: '#71717a', openClawData: null },
  // COO - 通常由 OpenClaw 填充
  // IT - 通常由 OpenClaw 填充
  // MKT
  { id: 'fictional-MKT-01', name: '虚构-营销', title: '市场总监', department: 'MKT', status: 'offline', statusColor: '#71717a', openClawData: null },
  { id: 'fictional-MKT-02', name: '虚构-策划', title: '营销策划', department: 'MKT', status: 'offline', statusColor: '#71717a', openClawData: null },
  // SAL
  { id: 'fictional-SAL-01', name: '虚构-销售', title: '销售总监', department: 'SAL', status: 'offline', statusColor: '#71717a', openClawData: null },
  { id: 'fictional-SAL-02', name: '虚构-客服', title: '客户经理', department: 'SAL', status: 'offline', statusColor: '#71717a', openClawData: null },
  // DEL
  { id: 'fictional-DEL-01', name: '虚构-交付', title: '交付经理', department: 'DEL', status: 'offline', statusColor: '#71717a', openClawData: null },
  // FIN
  { id: 'fictional-FIN-01', name: '虚构-财务', title: '财务总监', department: 'FIN', status: 'offline', statusColor: '#71717a', openClawData: null },
  // OPR
  { id: 'fictional-OPR-01', name: '虚构-运营', title: '运营经理', department: 'OPR', status: 'offline', statusColor: '#71717a', openClawData: null },
]

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

  return {
    id: agent.id,
    name: agent.name,
    title: agent.isMain ? 'AI 首席运营官' : 
           agent.isSubAgent ? 'AI 任务助手' : 
           agent.subtitle || '团队成员',
    department: dept,
    status: agent.status,
    statusColor: STATUS_COLORS[agent.status] || STATUS_COLORS.offline,
    position: null,
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
      updatedAt: agent.updatedAt
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

      // 转换真实成员
      const realMembers = agents.map(transformAgent)

      // 收集已有成员的部门
      const filledDepts = new Set(realMembers.map(m => m.department))

      // 过滤虚构成员：只添加空部门的虚构成员
      const fillerMembers = FICTIONAL_MEMBERS.filter(f => !filledDepts.has(f.department))

      // 合并：真实成员优先 + 虚构成员填充
      const allMembers = [...realMembers, ...fillerMembers]

      // 完全替换成员列表
      setMembersFromOpenClaw(allMembers)

      console.log(`[OpenClawSync] ${realMembers.length} real + ${fillerMembers.length} fictional = ${allMembers.length} total members`)
    } catch (error) {
      console.warn('[OpenClawSync] Error:', error.message)
    }
  }, [setMembersFromOpenClaw])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    console.log('[OpenClawSync] Starting hybrid OpenClaw-driven office...')

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
