/**
 * useOpenClawAgent - React Hook for OpenClaw Integration
 *
 * 在虚拟办公室中使用 OpenClaw 的成员数据
 *
 * 使用方式:
 *
 * const { agents, gatewayStatus, sendNotification } = useOpenClawAgent()
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { openClawAdapter } from '../adapters/OpenClawAdapter'
import type { Agent, Activity, VizEvent } from '../adapters/types'

/**
 * OpenClaw 连接状态
 */
export interface OpenClawConnectionStatus {
  connected: boolean
  gatewayUrl: string
  version?: string
  uptime?: number
  lastCheck?: number
}

/**
 * useOpenClawAgent 返回类型
 */
export interface UseOpenClawAgentReturn {
  /** OpenClaw 连接状态 */
  connectionStatus: OpenClawConnectionStatus
  /** 团队成员列表 */
  agents: Agent[]
  /** 最近活动 */
  activities: Activity[]
  /** 加载状态 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
  /** 刷新数据 */
  refresh: () => Promise<void>
  /** 发送通知 */
  sendNotification: (message: string, platform?: string) => Promise<boolean>
  /** 更新成员状态 */
  updateAgentStatus: (agentId: string, status: Agent['status']) => void
  /** 切换适配器 */
  switchAdapter: (adapterId: 'openclaw' | 'local') => void
  /** 当前适配器 */
  currentAdapter: 'openclaw' | 'local'
}

/**
 * useOpenClawAgent Hook
 */
export function useOpenClawAgent(): UseOpenClawAgentReturn {
  const [connectionStatus, setConnectionStatus] = useState<OpenClawConnectionStatus>({
    connected: false,
    gatewayUrl: 'http://127.0.0.1:18789'
  })

  const [agents, setAgents] = useState<Agent[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentAdapter, setCurrentAdapter] = useState<'openclaw' | 'local'>('openclaw')

  const initializedRef = useRef(false)

  // ============ 初始化 ============

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const init = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 初始化 OpenClaw 适配器
        await openClawAdapter.initialize()

        // 订阅事件
        openClawAdapter.subscribe(handleVizEvent)

        // 加载初始数据
        const [loadedAgents, loadedActivities] = await Promise.all([
          openClawAdapter.getAgents(),
          openClawAdapter.getActivities()
        ])

        setAgents(loadedAgents)
        setActivities(loadedActivities)

        // 检查 Gateway 连接状态
        const health = await openClawAdapter.getGatewayHealth()
        setConnectionStatus(prev => ({
          ...prev,
          connected: health.connected,
          version: health.version,
          uptime: health.uptime,
          lastCheck: Date.now()
        }))

        setIsLoading(false)
      } catch (err) {
        console.error('[useOpenClawAgent] Init error:', err)
        setError(err instanceof Error ? err.message : '初始化失败')
        setIsLoading(false)
      }
    }

    init()

    // 清理
    return () => {
      openClawAdapter.disconnect()
    }
  }, [])

  // ============ 事件处理 ============

  const handleVizEvent = useCallback((event: VizEvent) => {
    switch (event.type) {
      case 'agent_update':
        if (event.data.agents) {
          setAgents(event.data.agents)
        } else if (event.data.agentId) {
          setAgents(prev =>
            prev.map(a =>
              a.id === event.data.agentId
                ? { ...a, status: event.data.newStatus }
                : a
            )
          )
        }
        break

      case 'activity_new':
        if (event.data) {
          setActivities(prev => [event.data, ...prev.slice(0, 49)])
        }
        break

      case 'task_update':
        // Task updates handled by store
        break
    }
  }, [])

  // ============ 刷新 ============

  const refresh = useCallback(async () => {
    try {
      const [loadedAgents, loadedActivities] = await Promise.all([
        openClawAdapter.getAgents(),
        openClawAdapter.getActivities()
      ])

      setAgents(loadedAgents)
      setActivities(loadedActivities)

      // 刷新连接状态
      const health = await openClawAdapter.getGatewayHealth()
      setConnectionStatus(prev => ({
        ...prev,
        connected: health.connected,
        lastCheck: Date.now()
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新失败')
    }
  }, [])

  // ============ 发送通知 ============

  const sendNotification = useCallback(
    async (message: string, platform?: string): Promise<boolean> => {
      return openClawAdapter.sendMessage({
        message,
        channel: platform
      })
    },
    []
  )

  // ============ 更新状态 ============

  const updateAgentStatus = useCallback(
    (agentId: string, status: Agent['status']) => {
      openClawAdapter.updateAgentStatus(agentId, status)
    },
    []
  )

  // ============ 切换适配器 ============

  const switchAdapter = useCallback((adapterId: 'openclaw' | 'local') => {
    setCurrentAdapter(adapterId)
    // 实际实现中会切换全局适配器
    console.log(`[useOpenClawAgent] Switched to ${adapterId} adapter`)
  }, [])

  // ============ 返回 ============

  return {
    connectionStatus,
    agents,
    activities,
    isLoading,
    error,
    refresh,
    sendNotification,
    updateAgentStatus,
    switchAdapter,
    currentAdapter
  }
}

// ============ 连接状态显示组件数据 ============

/**
 * 获取连接状态的颜色
 */
export function getConnectionColor(connected: boolean): string {
  return connected ? '#22c55e' : '#71717a'
}

/**
 * 获取连接状态的文字描述
 */
export function getConnectionLabel(connected: boolean): string {
  return connected ? '已连接' : '未连接'
}

/**
 * 格式化运行时间
 */
export function formatUptime(seconds: number): string {
  if (!seconds) return '-'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}天 ${hours}小时`
  if (hours > 0) return `${hours}小时 ${minutes}分钟`
  return `${minutes}分钟`
}

export default useOpenClawAgent
