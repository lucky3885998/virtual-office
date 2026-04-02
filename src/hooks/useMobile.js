import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 移动端检测 Hook
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [touch鼎, setTouch鼎] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      setIsMobile(width <= 768)
      setIsTablet(width > 768 && width <= 1024)
      setIsLandscape(width > height)
      setTouch鼎(isTouchDevice)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', checkDevice)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [])

  return { isMobile, isTablet, isLandscape, touch鼎 }
}

/**
 * 触控手势 Hook (用于3D画布)
 * 支持: 单指拖拽平移, 双指捏合缩放
 */
export function useTouchGestures(onPan, onZoom, options = {}) {
  const {
    minZoom = 0.5,
    maxZoom = 2.0,
    minPan = { x: -20, y: -10 },
    maxPan = { x: 20, y: 10 }
  } = options
  
  const lastTouchRef = useRef(null)
  const lastPinchRef = useRef(null)
  const currentPanRef = useRef({ x: 0, y: 0 })
  const currentZoomRef = useRef(1)
  
  const handleTouchStart = useCallback((e) => {
    const touches = e.touches
    
    if (touches.length === 1) {
      lastTouchRef.current = {
        x: touches[0].clientX,
        y: touches[0].clientY
      }
    } else if (touches.length === 2) {
      const dx = touches[1].clientX - touches[0].clientX
      const dy = touches[1].clientY - touches[0].clientY
      lastPinchRef.current = {
        distance: Math.sqrt(dx * dx + dy * dy),
        centerX: (touches[0].clientX + touches[1].clientX) / 2,
        centerY: (touches[0].clientY + touches[1].clientY) / 2,
        zoom: currentZoomRef.current
      }
    }
  }, [])
  
  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const touches = e.touches
    
    if (touches.length === 1 && lastTouchRef.current) {
      const dx = (touches[0].clientX - lastTouchRef.current.x) * 0.02
      const dy = (touches[0].clientY - lastTouchRef.current.y) * 0.02
      
      currentPanRef.current.x = Math.max(minPan.x, Math.min(maxPan.x, currentPanRef.current.x - dx))
      currentPanRef.current.y = Math.max(minPan.y, Math.min(maxPan.y, currentPanRef.current.y + dy))
      
      onPan?.(currentPanRef.current)
      
      lastTouchRef.current = {
        x: touches[0].clientX,
        y: touches[0].clientY
      }
    } else if (touches.length === 2 && lastPinchRef.current) {
      const dx = touches[1].clientX - touches[0].clientX
      const dy = touches[1].clientY - touches[0].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      const scale = distance / lastPinchRef.current.distance
      const newZoom = Math.max(minZoom, Math.min(maxZoom, lastPinchRef.current.zoom * scale))
      
      currentZoomRef.current = newZoom
      onZoom?.(newZoom)
    }
  }, [onPan, onZoom, minZoom, maxZoom, minPan, maxPan])
  
  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = null
    lastPinchRef.current = null
  }, [])
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    currentPan: currentPanRef.current,
    currentZoom: currentZoomRef.current
  }
}

/**
 * Bottom Sheet 状态管理
 */
export function useBottomSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  
  const open = useCallback((panelId) => {
    setActivePanel(panelId)
    setIsOpen(true)
    setIsFullscreen(false)
  }, [])
  
  const close = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => {
      setActivePanel(null)
      setIsFullscreen(false)
    }, 300)
  }, [])
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])
  
  return {
    isOpen,
    isFullscreen,
    activePanel,
    open,
    close,
    toggleFullscreen
  }
}

/**
 * 设备像素比检测 (用于3D渲染优化)
 */
export function useDevicePixelRatio() {
  const [dpr, setDpr] = useState(1)
  
  useEffect(() => {
    const updateDPR = () => {
      // 移动端限制 DPR 以优化性能
      const isMobile = window.innerWidth <= 768
      const systemDpr = window.devicePixelRatio || 1
      const clampedDpr = isMobile ? Math.min(systemDpr, 1.5) : Math.min(systemDpr, 2)
      setDpr(clampedDpr)
    }
    
    updateDPR()
    window.addEventListener('resize', updateDPR)
    
    return () => window.removeEventListener('resize', updateDPR)
  }, [])
  
  return dpr
}

export default {
  useMobile,
  useTouchGestures,
  useBottomSheet,
  useDevicePixelRatio
}
