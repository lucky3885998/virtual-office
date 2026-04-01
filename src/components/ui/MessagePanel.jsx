import React, { useState, useEffect } from 'react'
import useOfficeStore from '../../stores/officeStore'
import { members } from '../../data/members'

function MessagePanelContent() {
  const { messages, sendMessage, currentPermissions, toggleMessagePanel, activeChat, setActiveChat } = useOfficeStore()
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('announcement')
  const [targetDept, setTargetDept] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const handleSend = () => {
    if (!newMessage.trim()) return
    
    sendMessage({
      from: 'CEO-01',
      to: messageType === 'announcement' ? 'all' : messageType === 'department' ? targetDept : activeChat,
      content: newMessage,
      type: messageType
    })
    
    setNewMessage('')
  }
  
  const getMemberName = (id) => {
    const member = members.find(m => m.id === id)
    return member?.name || id
  }
  
  const announcements = messages.filter(m => m.type === 'announcement')
  const deptMessages = messages.filter(m => m.type === 'department')
  const directMessages = messages.filter(m => m.type === 'direct')
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent'
    }}>
      
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>💬</span>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>消息中心</span>
        </div>
        <button
          onClick={toggleMessagePanel}
          style={{
            width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(39, 39, 42, 0.6)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px', color: 'var(--color-text-tertiary)',
            cursor: 'pointer', fontSize: '12px'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 12px'
      }}>
        {[
          { id: 'announcement', label: '公告', icon: '📢', count: announcements.length },
          { id: 'department', label: '部门', icon: '👥', count: deptMessages.length },
          { id: 'direct', label: '私信', icon: '💬', count: directMessages.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveChat(tab.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: activeChat === tab.id ? 'var(--color-accent-muted)' : 'transparent',
              border: 'none',
              borderBottom: activeChat === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: activeChat === tab.id ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {tab.icon} {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {activeChat === 'announcement' && announcements.map(msg => (
          <div key={msg.id} style={{
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '10px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px', color: '#3b82f6' }}>
                📢 {getMemberName(msg.from)}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{msg.time}</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{msg.content}</div>
          </div>
        ))}
        
        {activeChat === 'department' && deptMessages.map(msg => (
          <div key={msg.id} style={{
            padding: '12px',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '10px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px', color: '#8b5cf6' }}>
                👥 {getMemberName(msg.from)} → {msg.to}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{msg.time}</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{msg.content}</div>
          </div>
        ))}
        
        {activeChat === 'direct' && directMessages.map(msg => (
          <div key={msg.id} style={{
            padding: '12px',
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '10px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px', color: '#22c55e' }}>
                💬 {getMemberName(msg.from)}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{msg.time}</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{msg.content}</div>
          </div>
        ))}
      </div>
      
      {currentPermissions.canSendMessage && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          background: 'rgba(9, 9, 11, 0.5)'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 8px',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-primary)',
                fontSize: '11px'
              }}
            >
              <option value="announcement">📢 发送公告</option>
              <option value="department">👥 部门消息</option>
              <option value="direct">💬 私信</option>
            </select>
            {messageType === 'department' && (
              <select
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  color: 'var(--color-text-primary)',
                  fontSize: '11px'
                }}
              >
                <option value="">选择部门</option>
                <option value="MKT">📢 市场部</option>
                <option value="SAL">💰 销售部</option>
                <option value="IT">💻 技术部</option>
                <option value="FIN">📊 财务部</option>
                <option value="OPR">📋 运营部</option>
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                fontSize: '12px'
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '8px 16px',
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessagePanelContent
