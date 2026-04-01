// 数据可视化组件 - v0.3.0
import React, { useState, useMemo } from 'react'
import useOfficeStore from '../../stores/officeStore'

// 3D柱状图组件
function Bar3D({ value, maxValue, color, label, width = 0.4, depth = 0.4 }) {
  const height = useMemo(() => (value / maxValue) * 3, [value, maxValue])
  
  return (
    <group position={[0, height / 2, 0]}>
      {/* 柱子 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>
      {/* 顶部高亮 */}
      <mesh position={[0, height / 2 + 0.05, 0]}>
        <boxGeometry args={[width * 0.8, 0.1, depth * 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// 环形图表
function DonutChart({ data, size = 2 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0
  
  return (
    <group rotation={[-Math.PI / 6, 0, 0]}>
      {data.map((item, index) => {
        const angle = (item.value / total) * Math.PI * 2
        const midAngle = currentAngle + angle / 2
        
        const outerRadius = size
        const innerRadius = size * 0.6
        
        // 计算弧线的中点
        const x = Math.cos(midAngle) * (outerRadius + innerRadius) / 2
        const z = Math.sin(midAngle) * (outerRadius + innerRadius) / 2
        
        currentAngle += angle
        
        return (
          <group key={index} rotation={[0, currentAngle - angle / 2 - Math.PI / 2, 0]}>
            <mesh>
              <torusGeometry args={[size * 0.8, size * 0.15, 8, 32]} />
              <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.3} />
            </mesh>
          </group>
        )
      })}
      {/* 中心 */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[size * 0.5, size * 0.5, 0.3, 32]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
    </group>
  )
}

// 数据统计面板
function DataStats() {
  const { members, tasks, reports } = useOfficeStore()
  
  // 成员状态统计
  const statusStats = useMemo(() => {
    const stats = { working: 0, idle: 0, busy: 0, offline: 0 }
    members.forEach(m => { if (stats[m.status] !== undefined) stats[m.status]++ })
    return [
      { label: '工作中', value: stats.working, color: '#22c55e' },
      { label: '待命', value: stats.idle, color: '#eab308' },
      { label: '忙碌', value: stats.busy, color: '#ef4444' },
      { label: '离线', value: stats.offline, color: '#71717a' }
    ]
  }, [members])
  
  // 部门统计
  const deptStats = useMemo(() => {
    const depts = {}
    members.forEach(m => { depts[m.department] = (depts[m.department] || 0) + 1 })
    return Object.entries(depts).map(([dept, count]) => ({
      label: dept,
      value: count,
      color: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 6)]
    }))
  }, [members])
  
  // 任务统计
  const taskStats = useMemo(() => {
    const stats = { pending: 0, 'in-progress': 0, completed: 0 }
    tasks.forEach(t => { if (stats[t.status] !== undefined) stats[t.status]++ })
    return [
      { label: '待处理', value: stats.pending, color: '#71717a' },
      { label: '进行中', value: stats['in-progress'], color: '#3b82f6' },
      { label: '已完成', value: stats.completed, color: '#22c55e' }
    ]
  }, [tasks])
  
  // 计算总计
  const totalMembers = members.length
  const totalTasks = tasks.length
  const totalReports = reports.length
  
  return (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(18, 18, 23, 0.98)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#fafafa', fontSize: '14px', fontWeight: 600 }}>
        📊 实时数据统计
      </h3>
      
      {/* 总计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {[
          { label: '成员', value: totalMembers, icon: '👥', color: '#3b82f6' },
          { label: '任务', value: totalTasks, icon: '📋', color: '#f59e0b' },
          { label: '报告', value: totalReports, icon: '📝', color: '#10b981' }
        ].map(item => (
          <div key={item.label} style={{
            padding: '12px',
            background: `${item.color}15`,
            border: `1px solid ${item.color}30`,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '10px', color: '#71717a' }}>{item.label}</div>
          </div>
        ))}
      </div>
      
      {/* 状态分布 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '8px' }}>成员状态分布</div>
        <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          {statusStats.map(stat => (
            <div 
              key={stat.label}
              style={{
                flex: stat.value,
                background: stat.color,
                minWidth: stat.value > 0 ? '4px' : '0'
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
          {statusStats.map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stat.color }}></span>
              <span style={{ fontSize: '10px', color: '#a1a1aa' }}>{stat.label} {stat.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 任务状态 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '8px' }}>任务状态分布</div>
        <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          {taskStats.map(stat => (
            <div 
              key={stat.label}
              style={{
                flex: stat.value || 0.1,
                background: stat.color,
                minWidth: '4px'
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
          {taskStats.map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stat.color }}></span>
              <span style={{ fontSize: '10px', color: '#a1a1aa' }}>{stat.label} {stat.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 部门分布 */}
      <div>
        <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '8px' }}>部门成员分布</div>
        {deptStats.map((stat, index) => (
          <div key={stat.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px'
          }}>
            <div style={{ 
              width: '40px', 
              fontSize: '10px', 
              color: '#71717a',
              textAlign: 'right'
            }}>
              {stat.label}
            </div>
            <div style={{ flex: 1, height: '6px', background: 'rgba(113, 113, 122, 0.2)', borderRadius: '3px' }}>
              <div style={{
                width: `${(stat.value / totalMembers) * 100}%`,
                height: '100%',
                background: stat.color,
                borderRadius: '3px'
              }} />
            </div>
            <div style={{ width: '20px', fontSize: '10px', color: '#a1a1aa' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 3D数据可视化面板
function DataViz({ onClose }) {
  const [activeView, setActiveView] = useState('stats') // stats, charts
  
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
          📈 数据可视化
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
          onClick={() => setActiveView('stats')}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            background: activeView === 'stats' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeView === 'stats' ? '#3b82f6' : '#71717a',
            border: `1px solid ${activeView === 'stats' ? '#3b82f6' : 'rgba(113, 113, 122, 0.3)'}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📊 统计概览
        </button>
        <button
          onClick={() => setActiveView('charts')}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            background: activeView === 'charts' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            color: activeView === 'charts' ? '#8b5cf6' : '#71717a',
            border: `1px solid ${activeView === 'charts' ? '#8b5cf6' : 'rgba(113, 113, 122, 0.3)'}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📉 3D图表
        </button>
      </div>
      
      {/* 内容 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeView === 'stats' ? (
          <DataStats />
        ) : (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#71717a'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>3D图表展示</div>
            <div style={{ fontSize: '11px' }}>将在未来的WebGL更新中添加</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataViz
