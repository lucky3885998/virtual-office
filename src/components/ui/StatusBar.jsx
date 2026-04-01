import React from 'react'
import useOfficeStore from '../../stores/officeStore'

function StatusBar() {
  const executingTasks = useOfficeStore(state => state.executingTasks)
  const tasks = useOfficeStore(state => state.tasks)
  const members = useOfficeStore(state => state.members)
  const notifications = useOfficeStore(state => state.notifications)
  const unreadCount = useOfficeStore(state => state.unreadCount)
  const autoUpdateEnabled = useOfficeStore(state => state.autoUpdateEnabled)
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const busyMembers = members.filter(m => m.status === 'busy').length
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '28px',
      background: 'rgba(9, 9, 11, 0.9)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      fontSize: '10px',
      color: 'var(--color-text-tertiary)',
      zIndex: 100,
      fontFamily: 'var(--font-mono)'
    }}>
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#22c55e' }}>●</span>
          在线 {members.filter(m => m.status !== 'offline').length}/{members.length}
        </span>
        <span>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#ef4444' }}>●</span>
          忙碌 {busyMembers}
        </span>
        <span>|</span>
        <span>
          📋 任务: <span style={{ color: '#eab308' }}>{pendingTasks}</span>待处理 | <span style={{ color: '#8b5cf6' }}>{inProgressTasks}</span>进行中 | <span style={{ color: '#22c55e' }}>{completedTasks}</span>完成
        </span>
        {inProgressTasks > 0 && (
          <span style={{ color: '#8b5cf6' }}>
            ⚡ {Object.keys(executingTasks).length} 任务执行中
          </span>
        )}
      </div>
      
      {/* Center Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {unreadCount > 0 && (
          <span style={{ color: '#ef4444' }}>
            🔔 {unreadCount} 未读通知
          </span>
        )}
      </div>
      
      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>
          {autoUpdateEnabled ? (
            <span style={{ color: '#22c55e' }}>⏸️ 自动更新</span>
          ) : (
            <span style={{ color: '#71717a' }}>▶️ 手动模式</span>
          )}
        </span>
        <span>|</span>
        <span style={{ color: 'var(--color-text-tertiary)' }}>
          Ctrl+? 显示快捷键
        </span>
      </div>
    </div>
  )
}

export default StatusBar
