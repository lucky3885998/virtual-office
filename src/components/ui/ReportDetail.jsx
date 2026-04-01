import React, { useState } from 'react'
import useOfficeStore from '../../stores/officeStore'
import { departments } from '../../data/members'

function ReportDetail({ report, onClose }) {
  const [expanded, setExpanded] = useState(false)
  const tasks = useOfficeStore(state => state.tasks)
  
  if (!report) return null
  
  const statusLabels = {
    working: '💼工作中',
    idle: '😌空闲',
    busy: '🔥忙碌中',
    offline: '📴离线'
  }
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#eab308'
      case 'low': return '#22c55e'
      default: return '#6b7280'
    }
  }
  
  const isTaskReport = report.taskId
  const task = isTaskReport ? tasks.find(t => t.id === report.taskId) : null
  
  const getExecutionDuration = () => {
    if (!task?.startedAt || !task?.completedAt) return null
    const start = new Date(task.startedAt)
    const end = new Date(task.completedAt)
    const durationMs = end - start
    const seconds = Math.round(durationMs / 1000)
    if (seconds < 60) return `${seconds}秒`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      
      <div style={{
        width: '460px',
        maxWidth: '90vw',
        maxHeight: '85vh',
        background: 'rgba(18, 18, 23, 0.98)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          background: 'rgba(59, 130, 246, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                {isTaskReport ? '📋 任务完成报告' : '📝 工作报告'}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {report.title || report.content}
              </div>
            </div>
            <button onClick={onClose} style={{
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(39, 39, 42, 0.6)', border: '1px solid var(--color-border)',
              borderRadius: '8px', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: '14px'
            }}>✕</button>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(85vh - 160px)' }}>
          {/* Member Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--color-bg-tertiary)', borderRadius: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${report.status === 'busy' ? '#ef4444' : report.status === 'working' ? '#22c55e' : '#3b82f6'}, #8b5cf6)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 700, color: 'white'
            }}>
              {report.memberName?.charAt(0) || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{report.memberName}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {report.memberTitle} · {departments[report.department]?.icon} {departments[report.department]?.name}
              </div>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 500,
              background: report.status === 'busy' ? 'rgba(239, 68, 68, 0.15)' : report.status === 'working' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: report.status === 'busy' ? '#ef4444' : report.status === 'working' ? '#22c55e' : '#3b82f6'
            }}>
              {statusLabels[report.status] || report.status}
            </div>
          </div>
          
          {/* Summary */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>报告摘要</div>
            <div style={{ padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: '8px', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
              {report.summary || report.content || '暂无详细描述'}
            </div>
          </div>
          
          {/* Task Details - Clickable to Expand */}
          {isTaskReport && (
            <div style={{ marginBottom: '16px' }}>
              <div onClick={() => setExpanded(!expanded)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '11px', fontWeight: 600, color: expanded ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: expanded ? '8px' : '0',
                cursor: 'pointer', padding: '10px 14px',
                background: expanded ? 'rgba(59, 130, 246, 0.12)' : 'var(--color-bg-tertiary)',
                borderRadius: '10px', border: `1px solid ${expanded ? 'rgba(59, 130, 246, 0.3)' : 'var(--color-border)'}`,
                transition: 'all 0.2s'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>📎</span>
                  <span>执行成果详情</span>
                  {task && (
                    <span style={{
                      fontSize: '9px', padding: '2px 8px', borderRadius: '100px', fontWeight: 500,
                      background: task.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                      color: task.status === 'completed' ? '#22c55e' : '#8b5cf6'
                    }}>
                      {task.status === 'completed' ? '✅已完成' : '进行中'}
                    </span>
                  )}
                </span>
                <span style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </div>
              
              {expanded && (
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '10px', border: '1px solid var(--color-border)', marginTop: '8px' }}>
                  {task ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{task.title}</span>
                        <span style={{
                          fontSize: '10px', padding: '3px 8px', borderRadius: '100px', fontWeight: 500,
                          background: getPriorityColor(task.priority) + '20', color: getPriorityColor(task.priority)
                        }}>
                          {task.priority === 'high' ? '🔴高' : task.priority === 'medium' ? '🟡中' : '🟢低'}优先级
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>📅 截止日期</div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{task.deadline || '未设置'}</div>
                        </div>
                        
                        <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>⏱️ 执行时长</div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#22c55e' }}>{getExecutionDuration() || '未知'}</div>
                        </div>
                        
                        <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>🚀 开始时间</div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                            {task.startedAt ? new Date(task.startedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '未开始'}
                          </div>
                        </div>
                        
                        <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>✅ 完成时间</div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#22c55e' }}>
                            {task.completedAt ? new Date(task.completedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '进行中'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress */}
                      <div style={{ marginTop: '14px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>📊 执行进度</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, height: '8px', background: 'var(--color-bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: '100%', height: '100%',
                              background: task.status === 'completed' ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: task.status === 'completed' ? '#22c55e' : '#8b5cf6' }}>
                            {task.status === 'completed' ? '✅ 完成' : '🔄 进行中'}
                          </span>
                        </div>
                        
                        {/* Steps */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                          {['待处理', '进行中', '已完成'].map((label, i) => {
                            const stepDone = (i === 0 && task.status !== 'pending') || (i === 1 && task.status !== 'pending' && task.status !== 'in-progress') || (i === 2 && task.status === 'completed')
                            const stepActive = (i === 0 && task.status === 'pending') || (i === 1 && task.status === 'in-progress') || (i === 2 && task.status === 'completed')
                            return (
                              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '12px', height: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: stepDone ? '#22c55e' : stepActive ? '#8b5cf6' : 'var(--color-bg-tertiary)',
                                  border: !stepDone && !stepActive ? '2px solid var(--color-border)' : 'none',
                                  fontSize: '8px', color: 'white'
                                }}>
                                  {stepDone && '✓'}
                                </div>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{label}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '20px' }}>
                      任务已删除或不存在
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Time */}
          <div style={{ padding: '12px 14px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>🕐</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                报告时间: <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{report.time}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
            borderRadius: '8px', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
          }}>关闭</button>
        </div>
      </div>
    </div>
  )
}

export default ReportDetail
