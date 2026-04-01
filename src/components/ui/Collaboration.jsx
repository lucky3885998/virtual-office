// 实时协作组件 - v0.3.0
import React, { useState, useEffect, useRef } from 'react'
import useOfficeStore from '../../stores/officeStore'

// 活动日志条目
function ActivityItem({ activity }) {
  const icons = {
    'status_change': '🔄',
    'task_complete': '✅',
    'task_start': '🚀',
    'meeting_join': '🏛️',
    'meeting_leave': '🚪',
    'message': '💬',
    'report': '📝'
  }
  
  const icon = icons[activity.type] || '📌'
  
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      padding: '10px 0',
      borderBottom: '1px solid rgba(113, 113, 122, 0.15)'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: activity.color || '#3b82f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          color: '#fafafa',
          marginBottom: '2px',
          lineHeight: 1.3
        }}>
          {activity.message}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#71717a'
        }}>
          {activity.time}
        </div>
      </div>
    </div>
  )
}

// 在线成员状态
function OnlineMember({ member, isActive }) {
  const statusColors = {
    working: '#22c55e',
    idle: '#eab308',
    busy: '#ef4444',
    offline: '#71717a'
  }
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 0'
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: member.color || '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff'
        }}>
          {member.name?.charAt(0) || '?'}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: statusColors[member.status] || '#71717a',
          border: '2px solid rgba(18, 18, 23, 0.98)'
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#fafafa',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {member.name}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#71717a'
        }}>
          {member.department}
        </div>
      </div>
    </div>
  )
}

// 实时协作面板
function Collaboration({ onClose }) {
  const { members, reports, messages } = useOfficeStore()
  const [activities, setActivities] = useState([])
  const [activeTab, setActiveTab] = useState('activity') // activity, online
  
  // 生成模拟活动
  useEffect(() => {
    const sampleActivities = [
      { type: 'task_complete', message: 'CEO-01 完成了 Q2季度报告', time: '刚刚', color: '#f59e0b' },
      { type: 'meeting_join', message: 'COO-01 加入战略会议室', time: '2分钟前', color: '#3b82f6' },
      { type: 'status_change', message: 'MKT-01 状态更新为忙碌', time: '5分钟前', color: '#10b981' },
      { type: 'report', message: '新报告：市场部周报', time: '10分钟前', color: '#8b5cf6' },
      { type: 'task_start', message: 'IT-01-02 开始系统安全审计', time: '15分钟前', color: '#06b6d4' },
      { type: 'message', message: '3条新消息待查看', time: '20分钟前', color: '#ec4899' },
    ]
    setActivities(sampleActivities)
  }, [members, reports, messages])
  
  // 在线成员（按状态分组）
  const onlineMembers = members.filter(m => m.status !== 'offline')
  const workingMembers = onlineMembers.filter(m => m.status === 'working')
  const busyMembers = onlineMembers.filter(m => m.status === 'busy')
  const idleMembers = onlineMembers.filter(m => m.status === 'idle')
  
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(18, 18, 23, 0.98)'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(113, 113, 122, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#fafafa', fontSize: '16px' }}>
          👥 实时协作
        </h3>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#71717a',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      {/* 标签切换 */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(113, 113, 122, 0.2)'
      }}>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            background: activeTab === 'activity' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            color: activeTab === 'activity' ? '#8b5cf6' : '#71717a',
            border: `1px solid ${activeTab === 'activity' ? '#8b5cf6' : 'rgba(113, 113, 122, 0.3)'}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📋 活动日志
        </button>
        <button
          onClick={() => setActiveTab('online')}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            background: activeTab === 'online' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'online' ? '#3b82f6' : '#71717a',
            border: `1px solid ${activeTab === 'online' ? '#3b82f6' : 'rgba(113, 113, 122, 0.3)'}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🟢 在线 ({onlineMembers.length})
        </button>
      </div>
      
      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {activeTab === 'activity' ? (
          <div>
            <div style={{
              fontSize: '12px',
              color: '#71717a',
              marginBottom: '12px'
            }}>
              最近活动
            </div>
            {activities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        ) : (
          <div>
            {/* 工作中的成员 */}
            {workingMembers.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#22c55e',
                  fontWeight: 600,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                  工作中 ({workingMembers.length})
                </div>
                {workingMembers.map(member => (
                  <OnlineMember key={member.id} member={member} />
                ))}
              </div>
            )}
            
            {/* 忙碌的成员 */}
            {busyMembers.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#ef4444',
                  fontWeight: 600,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
                  忙碌中 ({busyMembers.length})
                </div>
                {busyMembers.map(member => (
                  <OnlineMember key={member.id} member={member} />
                ))}
              </div>
            )}
            
            {/* 待命的成员 */}
            {idleMembers.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#eab308',
                  fontWeight: 600,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }}></span>
                  待命 ({idleMembers.length})
                </div>
                {idleMembers.map(member => (
                  <OnlineMember key={member.id} member={member} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 底部统计 */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(113, 113, 122, 0.2)',
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '11px'
      }}>
        <div style={{ color: '#22c55e' }}>🟢 {workingMembers.length}</div>
        <div style={{ color: '#ef4444' }}>🔴 {busyMembers.length}</div>
        <div style={{ color: '#eab308' }}>🟡 {idleMembers.length}</div>
        <div style={{ color: '#71717a' }}>⚫ {members.filter(m => m.status === 'offline').length}</div>
      </div>
    </div>
  )
}

export default Collaboration
