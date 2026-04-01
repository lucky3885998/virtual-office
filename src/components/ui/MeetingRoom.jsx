// 虚拟会议室组件 - v0.3.0
import React from 'react'
import useOfficeStore from '../../stores/officeStore'

// 会议室预设配置
const MEETING_ROOMS_CONFIG = {
  'room-1': {
    id: 'room-1',
    name: '战略会议室',
    icon: '🏛️',
    color: '#f59e0b',
    capacity: 5,
    description: '用于高层战略决策和重要会议'
  },
  'room-2': {
    id: 'room-2',
    name: '协作空间',
    icon: '💬',
    color: '#3b82f6',
    capacity: 8,
    description: '用于日常协作和小组讨论'
  },
  'room-3': {
    id: 'room-3',
    name: '创意工坊',
    icon: '💡',
    color: '#10b981',
    capacity: 6,
    description: '用于头脑风暴和创意讨论'
  }
}

// 会议室列表面板
function MeetingRoomList({ onClose }) {
  const { meetingRooms, joinMeetingRoom, leaveMeetingRoom, currentMeetingRoom } = useOfficeStore()
  
  return (
    <div style={{
      padding: '20px',
      height: '100%',
      overflow: 'auto',
      background: 'rgba(18, 18, 23, 0.98)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#fafafa', fontSize: '16px' }}>
          🏛️ 虚拟会议室
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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.values(MEETING_ROOMS_CONFIG).map(room => {
          const participants = meetingRooms[room.id] || []
          const isInRoom = currentMeetingRoom === room.id
          
          return (
            <div 
              key={room.id}
              style={{
                padding: '16px',
                background: isInRoom ? `${room.color}15` : 'rgba(39, 39, 42, 0.8)',
                border: `1px solid ${isInRoom ? room.color : 'rgba(113, 113, 122, 0.3)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                if (isInRoom) {
                  leaveMeetingRoom()
                } else if (participants.length < room.capacity) {
                  joinMeetingRoom(room.id)
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>{room.icon}</span>
                <div>
                  <div style={{ color: '#fafafa', fontWeight: 600, fontSize: '14px' }}>
                    {room.name}
                  </div>
                  <div style={{ color: '#71717a', fontSize: '11px' }}>
                    {room.description}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#71717a', fontSize: '12px' }}>
                  <span style={{ color: room.color, fontWeight: 600 }}>{participants.length}</span>
                  <span> / {room.capacity} 人</span>
                </div>
                
                <div style={{
                  padding: '4px 12px',
                  background: isInRoom ? room.color : 'rgba(113, 113, 122, 0.3)',
                  borderRadius: '6px',
                  color: isInRoom ? '#fff' : '#71717a',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {isInRoom ? '离开' : (participants.length >= room.capacity ? '已满' : '加入')}
                </div>
              </div>
              
              {/* 参与者头像 */}
              {participants.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {participants.map(p => (
                    <div 
                      key={p.id}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: p.color || '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#fff',
                        border: '2px solid rgba(0,0,0,0.3)'
                      }}
                      title={p.name}
                    >
                      {p.name?.charAt(0) || '?'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* 当前会议状态 */}
      {currentMeetingRoom && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px'
        }}>
          <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '8px' }}>
            🔴 正在会议中
          </div>
          <div style={{ color: '#a1a1aa', fontSize: '12px' }}>
            当前在 {MEETING_ROOMS_CONFIG[currentMeetingRoom]?.name}，点击上方卡片离开会议
          </div>
        </div>
      )}
    </div>
  )
}

export { MeetingRoomList, MEETING_ROOMS_CONFIG }
export default MeetingRoomList
