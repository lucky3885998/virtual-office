import React from 'react'
import useOfficeStore from '../../stores/officeStore'
import DraggablePanel from './DraggablePanel'

function NotificationPanel({ notifPanelPos, setNotifPanelPos }) {
  const showNotificationPanel = useOfficeStore(state => state.showNotificationPanel)
  const toggleNotificationPanel = useOfficeStore(state => state.toggleNotificationPanel)
  const notifications = useOfficeStore(state => state.notifications)
  const markNotificationRead = useOfficeStore(state => state.markNotificationRead)
  const markAllNotificationsRead = useOfficeStore(state => state.markAllNotificationsRead)
  const clearNotifications = useOfficeStore(state => state.clearNotifications)
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_completed': return '✅'
      case 'announcement': return '📢'
      case 'message': return '💬'
      case 'system': return '⚙️'
      default: return '🔔'
    }
  }
  
  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_completed': return '#22c55e'
      case 'announcement': return '#3b82f6'
      case 'message': return '#8b5cf6'
      case 'system': return '#6b7280'
      default: return '#eab308'
    }
  }
  
  if (!showNotificationPanel) return null
  
  return (
    <DraggablePanel
      initialPosition={notifPanelPos}
      style={{
        width: '340px',
        maxHeight: '480px',
        background: 'rgba(18, 18, 23, 0.98)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(59, 130, 246, 0.05)',
          cursor: 'grab'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🔔</span>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>通知中心</span>
            {unreadCount > 0 && (
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                borderRadius: '100px',
                fontWeight: 500
              }}>
                {unreadCount} 未读
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={markAllNotificationsRead}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-accent)',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              全部已读
            </button>
            <button
              onClick={clearNotifications}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-tertiary)',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              清空
            </button>
            <button
              onClick={toggleNotificationPanel}
              style={{
                width: '24px', height: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(39, 39, 42, 0.6)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px', color: 'var(--color-text-tertiary)',
                cursor: 'pointer', fontSize: '11px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Notification List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
              fontSize: '13px'
            }}>
              暂无通知
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  background: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: getNotificationColor(notif.type) + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        color: 'var(--color-text-primary)'
                      }}>
                        {notif.title}
                      </span>
                      <span style={{ 
                        fontSize: '9px', 
                        color: 'var(--color-text-tertiary)'
                      }}>
                        {notif.time}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.4
                    }}>
                      {notif.content}
                    </div>
                  </div>
                  {!notif.read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      flexShrink: 0,
                      marginTop: '4px'
                    }} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        {notifications.length > 0 && (
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
              💡 按住标题栏拖动面板
            </span>
          </div>
        )}
      </div>
    </DraggablePanel>
  )
}

export default NotificationPanel
