import React from 'react'
import useOfficeStore from '../../stores/officeStore'

/**
 * 移动端底部工具栏
 */
export default function MobileToolbar() {
  const {
    toggleMessagePanel,
    toggleTaskPanel,
    toggleNotificationPanel,
    showMeetingRoom,
    toggleMeetingRoom,
    showTaskBoard3D,
    toggleTaskBoard3D,
    toggleDataViz,
    toggleCollaboration
  } = useOfficeStore()

  const toolbarItems = [
    { id: 'message', icon: '💬', label: '消息', onClick: toggleMessagePanel },
    { id: 'task', icon: '📋', label: '任务', onClick: toggleTaskPanel },
    { id: 'meeting', icon: '🏢', label: '会议室', onClick: toggleMeetingRoom },
    { id: 'board', icon: '📊', label: '看板', onClick: toggleTaskBoard3D },
    { id: 'data', icon: '📈', label: '数据', onClick: toggleDataViz },
    { id: 'notify', icon: '🔔', label: '通知', onClick: toggleNotificationPanel },
  ]

  return (
    <div className="mobile-toolbar" style={{ display: 'none' }}>
      {toolbarItems.map(item => (
        <button
          key={item.id}
          className="mobile-toolbar-btn ripple"
          onClick={item.onClick}
        >
          <span className="icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
