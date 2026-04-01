// 3D任务看板组件 - v0.3.0
import React, { useState, useMemo } from 'react'
import useOfficeStore from '../../stores/officeStore'

// 3D任务卡片
function TaskCard3D({ task, onStatusChange, onDelete, compact = false }) {
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e'
  }
  
  const statusIcons = {
    pending: '⏳',
    'in-progress': '🔄',
    completed: '✅'
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#22c55e'
      case 'in-progress': return '#3b82f6'
      default: return '#71717a'
    }
  }
  
  return (
    <div style={{
      padding: compact ? '10px' : '14px',
      background: 'rgba(39, 39, 42, 0.9)',
      border: `1px solid ${getStatusColor(task.status)}40`,
      borderLeft: `3px solid ${getStatusColor(task.status)}`,
      borderRadius: '8px',
      marginBottom: '8px',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(59, 59, 62, 0.95)'
      e.currentTarget.style.transform = 'translateX(2px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(39, 39, 42, 0.9)'
      e.currentTarget.style.transform = 'translateX(0)'
    }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '6px'
      }}>
        <div style={{
          fontSize: compact ? '12px' : '13px',
          fontWeight: 600,
          color: task.status === 'completed' ? '#71717a' : '#fafafa',
          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
          flex: 1,
          lineHeight: 1.3
        }}>
          {task.title}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '4px',
          marginLeft: '8px'
        }}>
          {task.priority && (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              background: `${priorityColors[task.priority]}20`,
              color: priorityColors[task.priority],
              borderRadius: '4px',
              fontWeight: 600
            }}>
              {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
            </span>
          )}
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#71717a'
        }}>
          👤 {task.assignee}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '12px' }}>
            {statusIcons[task.status] || '📋'}
          </span>
          {task.status !== 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(task.id, 'completed')
              }}
              style={{
                padding: '2px 8px',
                fontSize: '10px',
                background: '#22c55e20',
                color: '#22c55e',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 3D任务看板主面板
function TaskBoard3D({ onClose }) {
  const { tasks, updateTaskStatus, deleteTask, members } = useOfficeStore()
  
  const [filter, setFilter] = useState('all') // all, pending, in-progress, completed
  const [deptFilter, setDeptFilter] = useState('all')
  
  // 按状态分组统计
  const stats = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }), [tasks])
  
  // 筛选任务
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => filter === 'all' || t.status === filter)
      .sort((a, b) => {
        // 优先级排序
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
      })
  }, [tasks, filter])
  
  const handleStatusChange = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus)
  }
  
  const handleDelete = (taskId) => {
    if (window.confirm('确定删除这个任务？')) {
      deleteTask(taskId)
    }
  }
  
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
          📋 3D任务看板
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
      
      {/* 统计栏 */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(113, 113, 122, 0.2)',
        overflowX: 'auto'
      }}>
        {[
          { key: 'all', label: '全部', color: '#a1a1aa' },
          { key: 'pending', label: '待处理', color: '#71717a' },
          { key: 'in-progress', label: '进行中', color: '#3b82f6' },
          { key: 'completed', label: '已完成', color: '#22c55e' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              background: filter === item.key ? `${item.color}30` : 'transparent',
              color: filter === item.key ? item.color : '#71717a',
              border: `1px solid ${filter === item.key ? item.color : 'rgba(113, 113, 122, 0.3)'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {item.label} ({stats[item.key]})
          </button>
        ))}
      </div>
      
      {/* 任务列表 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 20px'
      }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#71717a'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <div>暂无任务</div>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard3D 
              key={task.id} 
              task={task} 
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
      
      {/* 底部统计 */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(113, 113, 122, 0.2)',
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '11px',
        color: '#71717a'
      }}>
        <div>📊 共 {stats.all} 个任务</div>
        <div>✅ 已完成 {stats.completed}</div>
        <div>🔄 进行中 {stats['in-progress']}</div>
      </div>
    </div>
  )
}

export default TaskBoard3D
