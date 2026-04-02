/**
 * useOpenClawSync - OpenClaw 数据同步 Hook
 *
 * 将 OpenClaw 真实数据融合到虚拟办公室的虚构角色中
 *
 * 映射关系:
 * - OpenClaw main session → COO 部门 Lucky 角色
 * - OpenClaw subagents → IT-01-01 架构组 角色
 */

import { useEffect, useRef } from 'react'
import useOfficeStore from '../stores/officeStore'

// Bridge API 地址
const BRIDGE_URL = 'http://localhost:18792'
const POLL_INTERVAL = 10000 // 10秒

// OpenClaw → 虚拟办公室角色 映射
const AGENT_MAPPING = {
  'openclaw-main': 'COO',         // Lucky-COO → COO部门 Lucky
  'subagents-openai': 'IT-01-01'   // AI任务助手 → IT架构组
}

// 状态映射
const STATUS_MAP = {
  working: 'working',
  idle: 'idle',
  busy: 'busy',
  offline: 'offline'
}

/**
 * 同步 OpenClaw 数据到虚构角色
 */
export function useOpenClawSync() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    console.log('[OpenClawSync] Starting sync...')

    let intervalId = null

    const sync = async () => {
      try {
        // 从 Bridge 获取 agents 数据
        const response = await fetch(`${BRIDGE_URL}/api/agents`, {
          signal: AbortSignal.timeout(5000)
        })

        if (!response.ok) {
          console.warn('[OpenClawSync] Bridge request failed:', response.status)
          return
        }

        const data = await response.json()
        const agents = data.agents || []

        // 遍历映射，同步数据
        agents.forEach(agent => {
          const memberId = AGENT_MAPPING[agent.id]
          if (!memberId) return

          // 更新 store 中的成员状态
          useOfficeStore.getState().updateMemberFromOpenClaw?.(memberId, {
            // 基础状态
            status: STATUS_MAP[agent.status] || 'offline',
            // OpenClaw 原始数据（供详情展示）
            openClawData: {
              id: agent.id,
              name: agent.name,
              model: agent.model,
              totalTokens: agent.totalTokens,
              costUsd: agent.costUsd,
              skills: agent.skills,
              skillsCount: agent.skillsCount,
              lastChannel: agent.lastChannel,
              // 子代理数据
              totalTasks: agent.totalTasks,
              doneTasks: agent.doneTasks,
              failedTasks: agent.failedTasks,
              // 时间
              updatedAt: agent.updatedAt,
              syncedAt: Date.now()
            }
          })
        })

        console.log('[OpenClawSync] Synced', agents.length, 'agents')
      } catch (error) {
        console.warn('[OpenClawSync] Sync error:', error.message)
      }
    }

    // 立即同步一次
    sync()

    // 定时同步
    intervalId = setInterval(sync, POLL_INTERVAL)

    return () => {
      if (intervalId) clearInterval(intervalId)
      console.log('[OpenClawSync] Stopped')
    }
  }, [])
}

/**
 * 添加 OpenClaw 同步字段到 members.config.js
 *
 * 在 members.config.js 中，为需要同步的成员添加 openClawMapping 字段：
 *
 * {
 *   id: 'COO',
 *   name: 'Lucky',
 *   department: 'COO',
 *   status: 'idle',
 *   openClawMapping: 'openclaw-main',  // ← 添加这个
 *   ...
 * }
 */
export default useOpenClawSync
