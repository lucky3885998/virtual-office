import React, { useState, useEffect } from 'react'
import useOfficeStore from '../../stores/officeStore'
import { members } from '../../data/members'

function TaskPanelContent() {
  const { 
    tasks, addTask, updateTaskStatus, deleteTask, resetTask,
    taskFilter, setTaskFilter, currentPermissions, toggleTaskPanel, 
    executingTasks, members 
  } = useOfficeStore()
  const [newTask, setNewTask] = useState({ title: '', assignee: '', priority: 'medium', deadline: '' })
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // 计算每个成员正在执行的任务数量
  const getMemberExecutingCount = (memberId) => {
    return tasks.filter(t => t.assignee === memberId && t.status === 'in-progress').length
  }
  
  const filteredTasks = (() => {
    const currentUserId = 'CEO-01'
    switch (taskFilter) {
      case 'my': return tasks.filter(t => t.assignee === currentUserId)
      case 'pending': return tasks.filter(t => t.status === 'pending')
      case 'in-progress': return tasks.filter(t => t.status === 'in-progress')
      case 'completed': return tasks.filter(t => t.status === 'completed')
      default: return tasks
    }
  })()
  
  const handleAddTask = () => {
    if (!newTask.title || !newTask.assignee) return
    addTask({
      ...newTask,
      assigner: 'CEO-01',
      department: members.find(m => m.id === newTask.assignee)?.department || ''
    })
    setNewTask({ title: '', assignee: '', priority: 'medium', deadline: '' })
  }
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#eab308'
      case 'low': return '#22c55e'
      default: return '#6b7280'
    }
  }
  
  const getMemberName = (id) => members.find(m => m.id === id)?.name || id
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📋</span>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>任务管理</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>
            ({tasks.length}个任务)
          </span>
        </div>
        <button
          onClick={toggleTaskPanel}
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
      
      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 12px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'all', label: '全部' },
          { id: 'my', label: '我的' },
          { id: 'pending', label: '待处理' },
          { id: 'in-progress', label: '进行中' },
          { id: 'completed', label: '已完成' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTaskFilter(tab.id)}
            style={{
              padding: '10px 12px',
              background: taskFilter === tab.id ? 'var(--color-accent-muted)' : 'transparent',
              border: 'none',
              borderBottom: taskFilter === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: taskFilter === tab.id ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {filteredTasks.map(task => {
          const executing = executingTasks[task.id]
          const memberExecCount = getMemberExecutingCount(task.assignee)
          
          return (
            <div key={task.id} style={{
              padding: '12px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              marginBottom: '10px',
              borderLeft: `3px solid ${getPriorityColor(task.priority)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--color-text-primary)' }}>{task.title}</div>
                  {memberExecCount > 1 && (
                    <div style={{ fontSize: '10px', color: '#8b5cf6', marginTop: '2px' }}>
                      🔄 该成员正在执行 {memberExecCount} 个任务
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '100px',
                    background: getPriorityColor(task.priority) + '20',
                    color: getPriorityColor(task.priority)
                  }}>
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </span>
                  {currentPermissions.canEdit && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        fontSize: '10px',
                        padding: '2px'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  👤 {getMemberName(task.assignee)}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                  📅 {task.deadline}
                </span>
              </div>
              
              {/* 任务执行进度条 */}
              {task.status === 'in-progress' && executing && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '4px',
                    fontSize: '9px',
                    color: 'var(--color-text-tertiary)'
                  }}>
                    <span>⚙️ 执行中...</span>
                    <span>{Math.round(executing.progress)}%</span>
                  </div>
                  <div style={{
                    height: '4px',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${executing.progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {task.status === 'pending' && currentPermissions.canEdit && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'in-progress')}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#8b5cf6',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    ▶️ 开始执行
                  </button>
                )}
                {task.status === 'in-progress' && (
                  <div style={{
                    flex: 1,
                    padding: '6px 8px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '6px',
                    color: '#8b5cf6',
                    fontSize: '11px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    🔄 进行中 {executing ? `${Math.round(executing.progress)}%` : ''}
                  </div>
                )}
                {task.status === 'completed' && (
                  <>
                    <button
                      onClick={() => resetTask(task.id)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        borderRadius: '6px',
                        color: '#eab308',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      🔄 重新执行
                    </button>
                    <div style={{
                      flex: 1,
                      padding: '6px 8px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '6px',
                      color: '#22c55e',
                      fontSize: '11px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      ✅ 已完成
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
        
        {filteredTasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-text-tertiary)',
            fontSize: '13px'
          }}>
            暂无任务
          </div>
        )}
      </div>
      
      {/* Add Task Form */}
      {currentPermissions.canCreateTask && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          background: 'rgba(9, 9, 11, 0.5)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
            ➕ 新建任务
          </div>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="任务标题..."
            style={{
              width: '100%',
              padding: '8px 10px',
              marginBottom: '8px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              color: 'var(--color-text-primary)',
              fontSize: '12px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <select
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
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
              <option value="">选择负责人</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              style={{
                width: '80px',
                padding: '6px 8px',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-primary)',
                fontSize: '11px'
              }}
            >
              <option value="high">🔴 高</option>
              <option value="medium">🟡 中</option>
              <option value="low">🟢 低</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              style={{
                flex: 1,
                padding: '6px 8px',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-primary)',
                fontSize: '11px'
              }}
            />
            <button
              onClick={handleAddTask}
              style={{
                padding: '6px 16px',
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              添加
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskPanelContent
