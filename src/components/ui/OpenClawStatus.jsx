/**
 * OpenClaw 连接状态面板
 *
 * 显示 OpenClaw Gateway 连接状态，
 * 允许切换数据适配器和发送通知。
 */

import React, { useState, useEffect } from 'react'
import { openClawAdapter } from '../../adapters/OpenClawAdapter'
import useOfficeStore from '../../stores/officeStore'

export default function OpenClawStatus({ onClose }) {
  const [status, setStatus] = useState({
    connected: false,
    gatewayUrl: 'http://127.0.0.1:18789',
    version: null,
    uptime: null
  })
  const [loading, setLoading] = useState(true)
  const [notificationText, setNotificationText] = useState('')
  const [sending, setSending] = useState(false)

  // 定时刷新状态
  useEffect(() => {
    const checkStatus = async () => {
      const health = await openClawAdapter.getGatewayHealth()
      setStatus(prev => ({
        ...prev,
        connected: health.connected,
        version: health.version,
        uptime: health.uptime
      }))
      setLoading(false)
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000)

    return () => clearInterval(interval)
  }, [])

  // 格式化运行时间
  const formatUptime = (seconds) => {
    if (!seconds) return '-'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}天 ${hours}小时`
    if (hours > 0) return `${hours}小时 ${mins}分钟`
    return `${mins}分钟`
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
      alert('通知发送失败，请检查 OpenClaw Gateway 连接')
    }
    setSending(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '16px',
      width: '340px',
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
              虚拟办公室数据源
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
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
      <div style={{ padding: '16px 20px' }}>
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
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
              连接状态
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: status.connected ? '#22c55e' : '#71717a',
                boxShadow: status.connected ? '0 0 8px #22c55e' : 'none'
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: status.connected ? '#22c55e' : '#71717a'
              }}>
                {loading ? '检测中...' : status.connected ? '已连接' : '未连接'}
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
              <div style={{ color: 'var(--color-text-tertiary)' }}>Gateway</div>
              <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                {status.gatewayUrl}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>版本</div>
              <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                {status.version || '-'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>运行时长</div>
              <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatUptime(status.uptime)}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>数据源</div>
              <div style={{ color: 'var(--color-text-primary)' }}>
                OpenClaw
              </div>
            </div>
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
                padding: '8px 12px',
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
                padding: '8px 12px',
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
                padding: '8px 12px',
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
            />
            <button
              onClick={handleSendNotification}
              disabled={sending || !notificationText.trim()}
              style={{
                padding: '8px 14px',
                background: sending ? 'var(--color-bg-tertiary)' : 'var(--color-accent)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px',
                cursor: sending ? 'not-allowed' : 'pointer'
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
            通知将通过 OpenClaw Gateway 发送到已连接的平台
          </div>
        </div>

        {/* Data Source Info */}
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
            <span style={{ fontSize: '12px', fontWeight: 600 }}>数据流</span>
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6
          }}>
            OpenClaw Gateway → 虚拟办公室适配器 → 3D 可视化场景
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
        OpenClaw Gateway v{status.version || '?'} | 端口 18789
      </div>
    </div>
  )
}
