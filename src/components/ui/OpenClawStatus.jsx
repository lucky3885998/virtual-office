/**
 * OpenClaw 连接状态面板
 *
 * 显示 OpenClaw Gateway 连接状态，
 * 允许切换数据适配器和发送通知。
 */

import React, { useState, useEffect, useCallback } from 'react'
import { openClawAdapter } from '../../adapters/OpenClawAdapter'
import useOfficeStore from '../../stores/officeStore'

export default function OpenClawStatus() {
  const [status, setStatus] = useState({
    connected: false,
    gatewayWs: 'ws://127.0.0.1:18789',
    version: '2026.3.28',
    sessions: 0
  })
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [notificationText, setNotificationText] = useState('')
  const [sending, setSending] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  // 订阅适配器事件
  useEffect(() => {
    const handleEvent = (event) => {
      if (event.type === 'agent_update') {
        if (event.data.agents) {
          setAgents(event.data.agents)
        }
        if (event.data.gatewayStatus) {
          setStatus(prev => ({ ...prev, ...event.data.gatewayStatus }))
        }
      }
    }

    openClawAdapter.subscribe(handleEvent)

    // 初始加载
    const init = async () => {
      const health = await openClawAdapter.getGatewayHealth()
      const loadedAgents = await openClawAdapter.getAgents()
      setStatus(prev => ({
        ...prev,
        connected: health.connected,
        version: health.version,
        sessions: health.sessions
      }))
      setAgents(loadedAgents)
      setLoading(false)
      setLastRefresh(new Date())
    }

    init()

    // 定时刷新状态
    const interval = setInterval(async () => {
      const health = await openClawAdapter.getGatewayHealth()
      const loadedAgents = await openClawAdapter.getAgents()
      setStatus(prev => ({
        ...prev,
        connected: health.connected,
        sessions: health.sessions
      }))
      setAgents(loadedAgents)
      setLastRefresh(new Date())
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // 格式化时间
  const formatTime = (date) => {
    if (!date) return '-'
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 状态颜色
  const statusColor = status.connected ? '#22c55e' : '#71717a'
  const statusLabel = status.connected ? '已连接' : '未连接'

  // 切换成员状态
  const handleStatusChange = (agentId, newStatus) => {
    openClawAdapter.updateAgentStatus(agentId, newStatus)
  }

  // 发送通知
  const handleSendNotification = async () => {
    if (!notificationText.trim()) return

    setSending(true)
    const success = await openClawAdapter.sendMessage({
      message: notificationText,
      channel: 'telegram'
    })

    if (success) {
      setNotificationText('')
      alert('通知发送成功!')
    } else {
      alert('通知发送失败 (WebSocket 未连接)')
    }
    setSending(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '16px',
      width: '360px',
      maxHeight: 'calc(100vh - 100px)',
      background: 'rgba(18, 18, 23, 0.98)',
      backdropFilter: 'blur(24px)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      zIndex: 400,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🦞</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>OpenClaw 连接</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
              虚拟办公室 Runtime 适配器
            </div>
          </div>
        </div>
        <button
          onClick={() => useOfficeStore.getState().toggleOpenClawStatus()}
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-tertiary)',
            border: 'none',
            borderRadius: '6px',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>

        {/* Connection Status */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(39, 39, 42, 0.5)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
              Gateway WebSocket
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: statusColor,
                boxShadow: status.connected ? `0 0 8px ${statusColor}` : 'none',
                animation: status.connected ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor }}>
                {loading ? '连接中...' : statusLabel}
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '11px'
          }}>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>WebSocket</div>
              <div style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px'
              }}>
                {status.gatewayWs}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>版本</div>
              <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                v{status.version}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>在线成员</div>
              <div style={{ color: 'var(--color-text-primary)' }}>
                {agents.length} 人
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>最后更新</div>
              <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatTime(lastRefresh)}
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-tertiary)',
            marginBottom: '8px'
          }}>
            团队成员 ({agents.length})
          </div>

          <div style={{
            background: 'rgba(39, 39, 42, 0.5)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {agents.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: '11px'
              }}>
                {loading ? '加载中...' : '暂无成员数据'}
              </div>
            ) : (
              agents.slice(0, 4).map((agent, index) => (
                <div key={agent.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderBottom: index < agents.length - 1 ? '1px solid var(--color-border)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: agent.color || '#71717a'
                    }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 500 }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                        {agent.title || agent.department}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['working', 'idle', 'busy'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(agent.id, s)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: 'none',
                          background: agent.status === s ? (
                            s === 'working' ? '#22c55e' :
                            s === 'idle' ? '#eab308' : '#ef4444'
                          ) : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-tertiary)',
            marginBottom: '8px'
          }}>
            快捷操作
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => openClawAdapter.updateAgentStatus('openclaw-main', 'working')}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '6px',
                color: '#22c55e',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              🟢 工作中
            </button>
            <button
              onClick={() => openClawAdapter.updateAgentStatus('openclaw-main', 'idle')}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                borderRadius: '6px',
                color: '#eab308',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              🟡 待命
            </button>
            <button
              onClick={() => openClawAdapter.updateAgentStatus('openclaw-main', 'busy')}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                color: '#ef4444',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              🔴 忙碌
            </button>
          </div>
        </div>

        {/* Send Notification */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-tertiary)',
            marginBottom: '8px'
          }}>
            发送通知
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={notificationText}
              onChange={e => setNotificationText(e.target.value)}
              placeholder="输入通知内容..."
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(39, 39, 42, 0.8)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                outline: 'none'
              }}
              onKeyDown={e => e.key === 'Enter' && handleSendNotification()}
            />
            <button
              onClick={handleSendNotification}
              disabled={sending || !notificationText.trim() || !status.connected}
              style={{
                padding: '8px 14px',
                background: sending ? 'var(--color-bg-tertiary)' : 'var(--color-accent)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px',
                cursor: sending || !notificationText.trim() ? 'not-allowed' : 'pointer',
                opacity: status.connected ? 1 : 0.5
              }}
            >
              {sending ? '...' : '发送'}
            </button>
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
            marginTop: '6px'
          }}>
            {!status.connected && '⚠️ WebSocket 未连接，通知功能不可用'}
            {status.connected && '通知将通过 OpenClaw Gateway 发送到已连接的平台'}
          </div>
        </div>

        {/* Data Flow Info */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px' }}>📡</span>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>数据流架构</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6
          }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div>🦞</div>
              <div>Gateway</div>
            </div>
            <div style={{ color: 'var(--color-text-tertiary)' }}>→</div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div>🔌</div>
              <div>适配器</div>
            </div>
            <div style={{ color: 'var(--color-text-tertiary)' }}>→</div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div>🏢</div>
              <div>虚拟办公室</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid var(--color-border)',
        fontSize: '10px',
        color: 'var(--color-text-tertiary)',
        fontFamily: 'var(--font-mono)'
      }}>
        OpenClaw v{status.version} | WebSocket: {status.gatewayWs}
      </div>
    </div>
  )
}
