import React from 'react'
import useOfficeStore from '../../stores/officeStore'
import { departments } from '../../data/members'

// 组织架构布局数据
const orgLayout = [
  { id: 'CEO', x: 0, y: 7, level: 0 },
  { id: 'COO', x: 0, y: 4.5, level: 1 },
  { id: 'MKT', x: -5, y: 2, level: 2 },
  { id: 'SAL', x: 5, y: 2, level: 2 },
  { id: 'DEL', x: -5, y: -0.5, level: 3 },
  { id: 'IT', x: 5, y: -0.5, level: 3 },
  { id: 'FIN', x: -5, y: -3, level: 4 },
  { id: 'OPR', x: 5, y: -3, level: 4 },
]

function MiniMap({ onClose }) {
  const { members, navigateTo } = useOfficeStore()
  
  // Map bounds
  const mapWidth = 120
  const mapHeight = 100
  const padding = 8
  
  // World bounds
  const worldMinX = -8
  const worldMaxX = 8
  const worldMinY = -5
  const worldMaxY = 10
  
  const worldToMap = (x, y) => {
    const mapX = padding + ((x - worldMinX) / (worldMaxX - worldMinX)) * (mapWidth - padding * 2)
    const mapY = mapHeight - padding - ((y - worldMinY) / (worldMaxY - worldMinY)) * (mapHeight - padding * 2)
    return { x: mapX, y: mapY }
  }
  
  // 统计各部门人数
  const getDeptMemberCount = (deptId) => members.filter(m => m.dept === deptId).length
  
  // 部门状态颜色
  const getDeptStatusColor = (deptId) => {
    const deptMembers = members.filter(m => m.department === deptId)
    const working = deptMembers.filter(m => m.status === 'working').length
    const total = deptMembers.length
    if (total === 0) return '#6b7280'
    const ratio = working / total
    if (ratio >= 0.7) return '#22c55e'
    if (ratio >= 0.4) return '#eab308'
    return '#ef4444'
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '170px',
      right: '16px',
      width: `${mapWidth + 20}px`,
      background: 'rgba(18, 18, 23, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '10px',
      zIndex: 150,
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Title */}
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        🗺️ 导航地图
      </div>
      
      {/* Map Canvas */}
      <svg width={mapWidth} height={mapHeight} style={{ display: 'block' }}>
        {/* Background */}
        <rect
          x={0} y={0}
          width={mapWidth} height={mapHeight}
          fill="rgba(9, 9, 11, 0.5)"
          rx={6}
        />
        
        {/* Connection Lines */}
        {[
          ['CEO', 'COO'],
          ['COO', 'MKT'], ['COO', 'SAL'],
          ['MKT', 'DEL'], ['SAL', 'IT'],
          ['DEL', 'FIN'], ['IT', 'OPR'],
        ].map(([from, to]) => {
          const fromDept = orgLayout.find(d => d.id === from)
          const toDept = orgLayout.find(d => d.id === to)
          if (!fromDept || !toDept) return null
          const fromPos = worldToMap(fromDept.x, fromDept.y)
          const toPos = worldToMap(toDept.x, toDept.y)
          return (
            <line
              key={`${from}-${to}`}
              x1={fromPos.x} y1={fromPos.y}
              x2={toPos.x} y2={toPos.y}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth={1}
            />
          )
        })}
        
        {/* Department Nodes */}
        {orgLayout.map(dept => {
          const pos = worldToMap(dept.x, dept.y)
          const color = getDeptStatusColor(dept.id)
          const deptData = departments[dept.id]
          const count = members.filter(m => m.department === dept.id).length
          
          return (
            <g key={dept.id}>
              {/* Node Circle */}
              <circle
                cx={pos.x} cy={pos.y} r={dept.level === 0 ? 8 : 6}
                fill={color}
                opacity={0.8}
                style={{ cursor: 'pointer' }}
                onClick={() => navigateTo(dept.x, dept.y)}
              />
              {/* Department Icon */}
              <text
                x={pos.x} y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={dept.level === 0 ? 6 : 5}
                fill="white"
                pointerEvents="none"
              >
                {deptData?.icon || '📦'}
              </text>
              {/* Count Badge */}
              {count > 0 && (
                <g>
                  <circle
                    cx={pos.x + (dept.level === 0 ? 5 : 4)}
                    cy={pos.y - (dept.level === 0 ? 5 : 4)}
                    r={4}
                    fill="var(--color-accent)"
                  />
                  <text
                    x={pos.x + (dept.level === 0 ? 5 : 4)}
                    y={pos.y - (dept.level === 0 ? 5 : 4)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={5}
                    fill="white"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {count}
                  </text>
                </g>
              )}
            </g>
          )
        })}
        
        {/* Center Crosshair */}
        <g opacity={0.5}>
          <line x1={mapWidth/2 - 3} y1={mapHeight/2} x2={mapWidth/2 + 3} y2={mapHeight/2} stroke="#3b82f6" strokeWidth={1} />
          <line x1={mapWidth/2} y1={mapHeight/2 - 3} x2={mapWidth/2} y2={mapHeight/2 + 3} stroke="#3b82f6" strokeWidth={1} />
          <circle cx={mapWidth/2} cy={mapHeight/2} r={2} fill="#3b82f6" />
        </g>
      </svg>
      
      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '8px',
        fontSize: '9px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ color: 'var(--color-text-tertiary)' }}>在线</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }} />
          <span style={{ color: 'var(--color-text-tertiary)' }}>待命</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ color: 'var(--color-text-tertiary)' }}>忙碌</span>
        </div>
      </div>
    </div>
  )
}

export default MiniMap
