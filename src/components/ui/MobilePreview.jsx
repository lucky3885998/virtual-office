import React, { useState, useRef, useEffect } from 'react'

const DEVICES = [
  { id: 'iphone-14', name: 'iPhone 14', width: 390, height: 844, icon: '📱' },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, icon: '📱' },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, icon: '📱' },
  { id: 'ipad-pro', name: 'iPad Pro 11"', width: 834, height: 1194, icon: '�_tablet' },
  { id: 'ipad-mini', name: 'iPad Mini', width: 768, height: 1024, icon: '📱' },
  { id: 'galaxy-s21', name: 'Galaxy S21', width: 360, height: 800, icon: '📱' },
]

export default function MobilePreview({ isOpen, onClose }) {
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0])
  const [orientation, setOrientation] = useState('portrait') // portrait | landscape
  const [showControls, setShowControls] = useState(true)
  const [dpr, setDpr] = useState(3)
  const containerRef = useRef(null)
  const iframeRef = useRef(null)

  // 获取当前 URL 的移动端视图
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  // 宽高根据方向切换
  const displayWidth = orientation === 'portrait' ? selectedDevice.width : selectedDevice.height
  const displayHeight = orientation === 'portrait' ? selectedDevice.height : selectedDevice.width

  // 缩放比例：让预览窗口适应屏幕
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
    }
  }, [isOpen])

  // 计算缩放
  const scaleX = containerSize.width > 0 ? (containerSize.width - 80) / displayWidth : 1
  const scaleY = containerSize.height > 0 ? (containerSize.height - 160) / displayHeight : 1
  const scale = Math.min(scaleX, scaleY, 1) // 不放大，只缩小

  const rotateDevice = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')
  }

  if (!isOpen) return null

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* 控制栏 */}
      {showControls && (
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 16px',
          background: 'rgba(24, 24, 27, 0.95)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
        }}>
          {/* 设备选择 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📱</span>
            <select
              value={selectedDevice.id}
              onChange={e => setSelectedDevice(DEVICES.find(d => d.id === e.target.value))}
              style={{
                background: 'rgba(39,39,42,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '6px 28px 6px 10px',
                fontSize: 12,
                color: '#fafafa',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              {DEVICES.map(d => (
                <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
              ))}
            </select>
          </div>

          {/* 方向切换 */}
          <button
            onClick={rotateDevice}
            style={{
              padding: '6px 12px',
              background: orientation === 'landscape' ? '#3b82f6' : 'rgba(39,39,42,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#fafafa',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {orientation === 'portrait' ? '📱' : '📱'} {orientation === 'portrait' ? '竖屏' : '横屏'}
          </button>

          {/* DPR 模拟 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#71717a' }}>DPR:</span>
            {[1, 2, 3].map(v => (
              <button
                key={v}
                onClick={() => setDpr(v)}
                style={{
                  padding: '4px 8px',
                  background: dpr === v ? '#3b82f6' : 'rgba(39,39,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: '#fafafa',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {v}x
              </button>
            ))}
          </div>

          {/* 关闭 */}
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              color: '#ef4444',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            关闭预览
          </button>
        </div>
      )}

      {/* 手机外框 */}
      <div
        style={{
          position: 'relative',
          width: displayWidth,
          height: displayHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* 手机边框 */}
        <div style={{
          position: 'absolute',
          inset: -12,
          borderRadius: orientation === 'portrait' ? '48px' : '32px',
          background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #27272a 100%)',
          border: '3px solid #3f3f46',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 24px 80px rgba(0,0,0,0.8),
            0 0 60px rgba(59,130,246,0.1)
          `,
        }}>
          {/* 刘海/灵动岛 */}
          {orientation === 'portrait' && (
            <div style={{
              position: 'absolute',
              top: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: displayWidth * 0.35,
              height: 28,
              background: '#18181b',
              borderRadius: '0 0 20px 20px',
              border: '2px solid #3f3f46',
              borderTop: 'none',
            }} />
          )}

          {/* 侧边按键 */}
          <div style={{
            position: 'absolute',
            right: -16,
            top: '30%',
            width: 4,
            height: 60,
            background: '#3f3f46',
            borderRadius: '0 2px 2px 0',
          }} />
          <div style={{
            position: 'absolute',
            right: -16,
            top: '40%',
            width: 4,
            height: 40,
            background: '#3f3f46',
            borderRadius: '0 2px 2px 0',
          }} />

          {/* Home Indicator */}
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: displayWidth * 0.4,
            height: 5,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 3,
          }} />
        </div>

        {/* 屏幕内容 - 使用 iframe 加载当前页面 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: orientation === 'portrait' ? '38px' : '24px',
          overflow: 'hidden',
          background: '#09090b',
        }}>
          <iframe
            ref={iframeRef}
            src={currentUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              transform: `scale(${1 / dpr})`,
              transformOrigin: 'top left',
            }}
            title="Mobile Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>

        {/* 屏幕信息标签 */}
        <div style={{
          position: 'absolute',
          bottom: -45,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px',
          background: 'rgba(24,24,27,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          fontSize: 11,
          color: '#71717a',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap',
        }}>
          {selectedDevice.name} • {displayWidth}×{displayHeight} • DPR {dpr}
        </div>
      </div>

      {/* 底部提示 */}
      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 20,
          fontSize: 11,
          color: '#60a5fa',
        }}>
          💡 当前为桌面预览，移动端效果建议用真机测试
        </div>
      )}
    </div>
  )
}
