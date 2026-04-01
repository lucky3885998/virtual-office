import React, { useEffect, useState } from 'react'
import useOfficeStore, { ViewMode, UserRole } from '../../stores/officeStore'
import { departments } from '../../data/members'

// Notification Bell Button Component
function NotificationBell() {
  const unreadCount = useOfficeStore(state => state.notifications?.filter(n => !n.read).length || 0)
  const toggleNotificationPanel = useOfficeStore(state => state.toggleNotificationPanel)
  
  return (
    <button
      onClick={toggleNotificationPanel}
      style={{
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        position: 'relative',
        transition: 'all 0.15s'
      }}
      title="通知中心"
    >
      🔔
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          minWidth: '16px',
          height: '16px',
          background: '#ef4444',
          borderRadius: '100px',
          fontSize: '9px',
          fontWeight: 600,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px'
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

function Header({ time, date }) {
  const { 
    viewMode, 
    setViewMode, 
    filterDepartment,
    setFilterDepartment,
    members,
    currentRole,
    setRole,
    currentPermissions,
    exportReports,
    lastUpdateTime,
    simulateStatusUpdate,
    autoUpdateEnabled,
    toggleAutoUpdate,
    toggleTaskPanel,
    showTaskPanel,
    toggleMessagePanel,
    messages,
    tasks,
    reports
  } = useOfficeStore()
  
  // 实时数据计数
  const [msgCount, setMsgCount] = useState(messages.length)
  const [taskCount, setTaskCount] = useState(tasks.length)
  const [pendingTaskCount, setPendingTaskCount] = useState(0)
  
  // 数据更新时自动刷新计数
  useEffect(() => {
    setMsgCount(messages.length)
  }, [messages])
  
  useEffect(() => {
    setTaskCount(tasks.length)
    setPendingTaskCount(tasks.filter(t => t.status !== 'completed').length)
  }, [tasks])
  
  const stats = {
    total: members.length,
    working: members.filter(m => m.status === 'working').length,
    idle: members.filter(m => m.status === 'idle').length,
    busy: members.filter(m => m.status === 'busy').length,
    offline: members.filter(m => m.status === 'offline').length
  }
  
  const roleLabels = {
    [UserRole.ADMIN]: '管理员',
    [UserRole.MANAGER]: '经理',
    [UserRole.VIEWER]: '访客'
  }
  
  const roleColors = {
    [UserRole.ADMIN]: '#3b82f6',
    [UserRole.MANAGER]: '#8b5cf6',
    [UserRole.VIEWER]: '#6b7280'
  }
  
  const formatUpdateTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }
  
  return (
    <header className="header">
      {/* Brand */}
      <div className="header-brand">
        <div className="header-logo">🏢</div>
        <div>
          <div className="header-title">纳灵数字企业</div>
          <div className="header-subtitle">Virtual Office · v2.0</div>
        </div>
      </div>
      
      {/* Time Display */}
      <div className="header-time">
        <span style={{ marginRight: '12px', opacity: 0.6 }}>{date}</span>
        <span style={{ fontWeight: 500 }}>{time}</span>
      </div>
      
      {/* Stats */}
      <div className="header-stats">
        <div className="stat-item">
          <span className="stat-dot working"></span>
          <span className="stat-count">{stats.working}</span>
          <span className="stat-label">工作中</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-dot idle"></span>
          <span className="stat-count">{stats.idle}</span>
          <span className="stat-label">待命</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-dot busy"></span>
          <span className="stat-count">{stats.busy}</span>
          <span className="stat-label">忙碌</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-dot offline"></span>
          <span className="stat-count">{stats.offline}</span>
          <span className="stat-label">离线</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-count">{stats.total}</span>
          <span className="stat-label">成员</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="header-controls">
        {/* Role Switcher */}
        <select 
          className="ui-select"
          value={currentRole}
          onChange={(e) => setRole(e.target.value)}
          style={{ borderColor: roleColors[currentRole] + '40' }}
        >
          <option value={UserRole.ADMIN}>👑 {roleLabels[UserRole.ADMIN]}</option>
          <option value={UserRole.MANAGER}>📊 {roleLabels[UserRole.MANAGER]}</option>
          <option value={UserRole.VIEWER}>👁️ {roleLabels[UserRole.VIEWER]}</option>
        </select>
        
        {/* Department Filter */}
        <select 
          className="ui-select"
          value={filterDepartment || ''}
          onChange={(e) => setFilterDepartment(e.target.value || null)}
        >
          <option value="">全部部门</option>
          {Object.values(departments).map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.icon} {dept.name}
            </option>
          ))}
        </select>
        
        {/* View Mode */}
        <div className="ui-segment">
          <button
            onClick={() => setViewMode(ViewMode.ALL)}
            className={`ui-segment-btn ${viewMode === ViewMode.ALL ? 'active' : ''}`}
          >
            全部
          </button>
          <button
            onClick={() => setViewMode(ViewMode.DEPARTMENT)}
            className={`ui-segment-btn ${viewMode === ViewMode.DEPARTMENT ? 'active' : ''}`}
          >
            部门
          </button>
        </div>
        
        {/* Export Reports Buttons */}
        {currentPermissions.canExport && reports.length > 0 && (
          <>
            <button 
              className="ui-segment-btn" 
              onClick={() => exportReports('json')}
              title="导出报告JSON"
              style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
            >
              📑JSON
            </button>
            <button 
              className="ui-segment-btn" 
              onClick={() => exportReports('csv')}
              title="导出报告CSV"
              style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}
            >
              📋CSV
            </button>
          </>
        )}
        
        {/* Task Panel Toggle */}
        {currentPermissions.canViewAll && (
          <button 
            className="ui-segment-btn" 
            onClick={toggleTaskPanel}
            title={`任务管理 (可拖动) | ${pendingTaskCount}个待完成`}
            style={{ 
              background: showTaskPanel ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              color: showTaskPanel ? '#8b5cf6' : 'var(--color-text-tertiary)',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            📋{pendingTaskCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-4px', 
                right: '-4px',
                minWidth: '16px', 
                height: '16px',
                background: '#8b5cf6',
                borderRadius: '100px',
                fontSize: '9px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: '0 4px'
              }}>
                {pendingTaskCount}
              </span>
            )}
          </button>
        )}
        
        {/* Message Panel Toggle */}
        {currentPermissions.canSendMessage && (
          <button 
            className="ui-segment-btn" 
            onClick={toggleMessagePanel}
            title={`消息中心 (可拖动) | ${msgCount}条消息`}
            style={{ 
              background: msgCount > 0 ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: msgCount > 0 ? '#3b82f6' : 'var(--color-text-tertiary)',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            💬{msgCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-4px', 
                right: '-4px',
                minWidth: '16px', 
                height: '16px',
                background: '#3b82f6',
                borderRadius: '100px',
                fontSize: '9px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: '0 4px'
              }}>
                {msgCount}
              </span>
            )}
          </button>
        )}
        
        {/* Notification Bell Button */}
        <NotificationBell />
        
        {/* Simulate Update (Admin only) */}
        {currentPermissions.canChangeStatus && (
          <>
            <button 
              className="ui-segment-btn" 
              onClick={simulateStatusUpdate}
              title="手动更新状态"
              style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
            >
              🔄
            </button>
            <button 
              className="ui-segment-btn" 
              onClick={toggleAutoUpdate}
              title={autoUpdateEnabled ? '关闭自动更新' : '开启自动更新'}
              style={{ 
                background: autoUpdateEnabled ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                color: autoUpdateEnabled ? '#22c55e' : 'var(--color-text-tertiary)'
              }}
            >
              {autoUpdateEnabled ? '⏸️' : '▶️'}
            </button>
          </>
        )}
      </div>
      
      {/* Update Time */}
      <div style={{ 
        position: 'absolute', 
        bottom: '4px', 
        right: '16px', 
        fontSize: '9px', 
        color: 'var(--color-text-tertiary)',
        fontFamily: 'var(--font-mono)'
      }}>
        更新: {formatUpdateTime(lastUpdateTime)}
      </div>
    </header>
  )
}

export default Header
