import React, { useState, useRef, useEffect } from 'react'

function DraggablePanel({ children, initialPosition = { x: null, y: null }, style = {} }) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, panelX: 0, panelY: 0 })
  const panelRef = useRef(null)
  
  // 初始位置设置
  useEffect(() => {
    if (initialPosition.x !== null && initialPosition.y !== null) {
      setPosition(initialPosition)
    } else if (panelRef.current) {
      // 默认靠右
      setPosition({
        x: window.innerWidth - panelRef.current.offsetWidth - 16,
        y: 0
      })
    }
  }, [initialPosition])
  
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea')) {
      return
    }
    
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panelX: position.x,
      panelY: position.y
    }
  }
  
  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY
    
    let newX = dragRef.current.panelX + deltaX
    let newY = dragRef.current.panelY + deltaY
    
    // 边界限制
    if (panelRef.current) {
      const maxX = window.innerWidth - panelRef.current.offsetWidth
      const maxY = window.innerHeight - panelRef.current.offsetHeight
      
      newX = Math.max(0, Math.min(newX, maxX))
      newY = Math.max(0, Math.min(newY, maxY))
    }
    
    setPosition({ x: newX, y: newY })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])
  
  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: position.y !== null ? position.y : 0,
        left: position.x !== null ? position.x : 'auto',
        right: position.x === null ? 0 : 'auto',
        ...style,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  )
}

export default DraggablePanel
