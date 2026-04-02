import React, { useEffect, useRef } from 'react'

/**
 * 移动端 Bottom Sheet 面板包装器
 * 在桌面端保持原有行为，在移动端变为底部抽屉
 */
export default function BottomSheetPanel({ 
  children, 
  title, 
  isOpen, 
  onClose, 
  isFullscreen,
  onToggleFullscreen,
  className = '' 
}) {
  const sheetRef = useRef(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  
  // 拖拽关闭
  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY
  }
  
  const handleTouchMove = (e) => {
    if (!sheetRef.current) return
    
    currentYRef.current = e.touches[0].clientY
    const diff = currentYRef.current - startYRef.current
    
    // 向上拖拽超过阈值则关闭
    if (diff > 150) {
      onClose()
    } else if (diff < -50 && isFullscreen) {
      // 向下拖拽且在全屏模式则退出全屏
      onToggleFullscreen?.()
    }
  }
  
  // 点击遮罩关闭
  const handleOverlayClick = () => {
    onClose()
  }
  
  return (
    <>
      {/* 遮罩层 */}
      <div 
        className={`panel-overlay ${isOpen ? 'active' : ''}`}
        onClick={handleOverlayClick}
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`
          bottom-sheet 
          ${isOpen ? 'active' : ''} 
          ${isFullscreen ? 'panel-fullscreen active' : ''}
          ${className}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* 移动端显示把手 */}
        <div className="handle" />
        
        {/* 头部 */}
        <div className="bottom-sheet-header">
          <div className="panel-nav">
            <button className="panel-nav-back" onClick={onClose}>←</button>
            <span className="bottom-sheet-title">{title}</span>
          </div>
          <button className="bottom-sheet-close" onClick={onClose}>✕</button>
        </div>
        
        {/* 内容 */}
        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </>
  )
}
