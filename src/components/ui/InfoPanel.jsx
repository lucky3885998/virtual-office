import React, { useState } from 'react'
import useOfficeStore from '../../stores/officeStore'
import { departments } from '../../data/members'

function InfoPanel() {
  const { selectedMember: member, closeInfoPanel, currentPermissions, updateMemberStatus, updateMemberTask } = useOfficeStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editTask, setEditTask] = useState('')
  const [editStatus, setEditStatus] = useState('')
  
  if (!member) return null
  
  const dept = departments[member.department]
  
  const statusBadge = {
    working: { class: 'badge-working', label: '工作中' },
    idle: { class: 'badge-idle', label: '待命' },
    busy: { class: 'badge-busy', label: '忙碌' },
    offline: { class: 'badge-offline', label: '离线' }
  }[member.status] || { class: 'badge-offline', label: '离线' }
  
  const handleSave = () => {
    if (editStatus && editStatus !== member.status) {
      updateMemberStatus(member.id, editStatus)
    }
    if (editTask) {
      updateMemberTask(member.id, editTask)
    }
    setIsEditing(false)
  }
  
  const handleStartEdit = () => {
    setEditTask(member.currentTask)
    setEditStatus(member.status)
    setIsEditing(true)
  }
  
  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <button className="info-panel-close" onClick={closeInfoPanel}>
          ✕
        </button>
        
        <div className="info-panel-profile">
          <div className={`info-panel-avatar ${member.status}`}>
            {dept?.icon || '👤'}
          </div>
          <div>
            <div className="info-panel-name">{member.name}</div>
            <div className="info-panel-title">{member.title}</div>
            <div className="info-panel-badges">
              <span className={`badge ${statusBadge.class}`}>{statusBadge.label}</span>
              <span style={{ fontSize: '12px', opacity: 0.6 }}>{dept?.icon} {dept?.name}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="info-panel-body">
        {/* 状态编辑 */}
        {currentPermissions.canChangeStatus && isEditing && (
          <div className="info-section">
            <div className="info-section-label">状态</div>
            <div className="info-section-content">
              <select 
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px'
                }}
              >
                <option value="working">工作中</option>
                <option value="idle">待命</option>
                <option value="busy">忙碌</option>
                <option value="offline">离线</option>
              </select>
            </div>
          </div>
        )}
        
        {/* 当前任务 */}
        <div className="info-section">
          <div className="info-section-label">📌 当前任务</div>
          <div className="info-section-content">
            {isEditing ? (
              <textarea
                value={editTask}
                onChange={(e) => setEditTask(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div className="info-section-text">{member.currentTask}</div>
            )}
          </div>
        </div>
        
        {/* 最新工作 */}
        {member.lastReport && (
          <div className="info-section">
            <div className="info-section-label">📊 最新工作</div>
            <div className="info-section-content">
              <div className="info-section-text" style={{ fontWeight: 500, marginBottom: '4px' }}>
                {member.lastReport.title}
              </div>
              <div className="info-section-text" style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                {member.lastReport.summary}
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                🕐 {member.lastReport.time}
              </div>
            </div>
          </div>
        )}
        
        {/* 编辑按钮 */}
        {currentPermissions.canEdit && !isEditing && (
          <button
            onClick={handleStartEdit}
            style={{
              padding: '8px 16px',
              background: 'var(--color-accent-muted)',
              border: '1px solid var(--color-accent)',
              borderRadius: '8px',
              color: 'var(--color-accent)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            ✏️ 编辑信息
          </button>
        )}
        
        {/* 保存/取消按钮 */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: 'var(--color-success)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              ✓ 保存
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-secondary)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✕ 取消
            </button>
          </div>
        )}
      </div>
      
      <div className="info-panel-footer">
        <span>ID: {member.id}</span>
        <span>{dept?.name}</span>
      </div>
    </div>
  )
}

export default InfoPanel
