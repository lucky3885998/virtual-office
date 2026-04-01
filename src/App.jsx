import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import Scene from './components/canvas/VirtualOffice'
import Header from './components/ui/Header'
import InfoPanel from './components/ui/InfoPanel'
import WorkReportPanel from './components/ui/WorkReportPanel'
import MessagePanel from './components/ui/MessagePanel'
import TaskPanel from './components/ui/TaskPanel'
import NotificationPanel from './components/ui/NotificationPanel'
import MiniMap from './components/ui/MiniMap'
import DraggablePanel from './components/ui/DraggablePanel'
import StatusBar from './components/ui/StatusBar'
import KeyboardShortcutsPanel from './components/ui/KeyboardShortcutsPanel'
import useOfficeStore from './stores/officeStore'
import { useRealTimeData, realtimeSimulator } from './services/dataService'

function CameraController() {
  const { camera, size } = useThree()
  const cameraTarget = useOfficeStore(state => state.cameraTarget)
  const isNavigating = useOfficeStore(state => state.isNavigating)
  const finishNavigation = useOfficeStore(state => state.finishNavigation)
  
  useEffect(() => {
    const baseZoom = Math.min(size.width, size.height) / 16
    const zoom = Math.max(30, Math.min(70, baseZoom))
    
    camera.zoom = zoom
    camera.position.set(0, 2, 15)
    camera.lookAt(0, 2, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])
  
  // 导航动画
  useEffect(() => {
    if (isNavigating) {
      const targetX = cameraTarget.x * 0.5
      const targetY = cameraTarget.y * 0.5
      
      let steps = 0
      const maxSteps = 20
      
      const animate = () => {
        if (steps < maxSteps) {
          const progress = steps / maxSteps
          const easeProgress = 1 - Math.pow(1 - progress, 3)
          
          camera.position.x += (targetX - camera.position.x) * easeProgress * 0.1
          camera.position.y += (targetY - camera.position.y) * easeProgress * 0.1
          camera.lookAt(targetX, targetY + 2, 0)
          camera.updateProjectionMatrix()
          
          steps++
          requestAnimationFrame(animate)
        } else {
          finishNavigation()
        }
      }
      
      animate()
    }
  }, [isNavigating, cameraTarget, finishNavigation, camera])
  
  return null
}

function App() {
  const showInfoPanel = useOfficeStore(state => state.showInfoPanel)
  const panelPosition = useOfficeStore(state => state.panelPosition)
  const closeInfoPanel = useOfficeStore(state => state.closeInfoPanel)
  const simulateStatusUpdate = useOfficeStore(state => state.simulateStatusUpdate)
  const autoUpdateEnabled = useOfficeStore(state => state.autoUpdateEnabled)
  const autoUpdateInterval = useOfficeStore(state => state.autoUpdateInterval)
  const currentPermissions = useOfficeStore(state => state.currentPermissions)
  const showMessagePanel = useOfficeStore(state => state.showMessagePanel)
  const showTaskPanel = useOfficeStore(state => state.showTaskPanel)
  const executingTasks = useOfficeStore(state => state.executingTasks)
  const _updateTaskProgress = useOfficeStore(state => state._updateTaskProgress)
  const initializeNotifications = useOfficeStore(state => state.initializeNotifications)
  const _saveToStorage = useOfficeStore(state => state._saveToStorage)
  const navigateTo = useOfficeStore(state => state.navigateTo)
  const toggleTaskPanel = useOfficeStore(state => state.toggleTaskPanel)
  const toggleMessagePanel = useOfficeStore(state => state.toggleMessagePanel)
  
  const [isExiting, setIsExiting] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [time, setTime] = useState(new Date())
  const infoPanelRef = useRef(null)
  const updateTimerRef = useRef(null)
  const taskTimerRef = useRef(null)
  const saveTimerRef = useRef(null)
  
  // 面板位置状态
  const [msgPanelPos, setMsgPanelPos] = useState({ x: null, y: null })
  const [taskPanelPos, setTaskPanelPos] = useState({ x: null, y: null })
  const [notifPanelPos, setNotifPanelPos] = useState({ x: null, y: null })
  
  // 初始化通知系统
  useEffect(() => {
    initializeNotifications()
  }, [initializeNotifications])
  
  // 启动实时数据服务
  useRealTimeData({
    enabled: autoUpdateEnabled,
    onDataUpdate: (data) => {
      console.log('[RealTime] Data updated:', data)
    },
    onNewMessage: (message) => {
      console.log('[RealTime] New message:', message)
    }
  })
  
  // 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // 自动保存到LocalStorage（每10秒）
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      _saveToStorage()
    }, 10000)
    
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current)
      }
    }
  }, [_saveToStorage])
  
  // 页面关闭前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      _saveToStorage()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [_saveToStorage])
  
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 避免在输入框中触发
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return
      }
      
      const key = e.key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      
      // Ctrl/Cmd + 1-3: 快速导航到部门
      if (ctrl && key === '1') {
        e.preventDefault()
        navigateTo(0, 7) // CEO
      } else if (ctrl && key === '2') {
        e.preventDefault()
        navigateTo(0, 4.5) // COO
      } else if (ctrl && key === '3') {
        e.preventDefault()
        navigateTo(-5, 2) // MKT
      } else if (ctrl && key === '4') {
        e.preventDefault()
        navigateTo(5, 2) // SAL
      } else if (ctrl && key === '5') {
        e.preventDefault()
        navigateTo(5, -3) // OPR
      }
      
      // Ctrl/Cmd + T: 打开/关闭任务面板
      if (ctrl && key === 't') {
        e.preventDefault()
        toggleTaskPanel()
      }
      
      // Ctrl/Cmd + M: 打开/关闭消息面板
      if (ctrl && key === 'm') {
        e.preventDefault()
        toggleMessagePanel()
      }
      
      // Ctrl/Cmd + N: 打开通知面板
      if (ctrl && key === 'n') {
        e.preventDefault()
        useOfficeStore.getState().toggleNotificationPanel()
      }
      
      // Escape: 关闭所有面板
      if (key === 'escape') {
        closeInfoPanel()
        useOfficeStore.getState().toggleNotificationPanel() // close if open
      }
      
      // Home: 回到中心位置
      if (key === 'home') {
        e.preventDefault()
        navigateTo(0, 2)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // 自动更新成员状态
  useEffect(() => {
    if (updateTimerRef.current) {
      clearInterval(updateTimerRef.current)
    }
    
    if (currentPermissions.canChangeStatus && autoUpdateEnabled && autoUpdateInterval > 0) {
      updateTimerRef.current = setInterval(() => {
        simulateStatusUpdate()
      }, autoUpdateInterval)
    }
    
    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current)
      }
    }
  }, [currentPermissions, autoUpdateEnabled, autoUpdateInterval, simulateStatusUpdate])
  
  // 任务执行模拟（每秒更新进度）
  useEffect(() => {
    if (taskTimerRef.current) {
      clearInterval(taskTimerRef.current)
    }
    
    taskTimerRef.current = setInterval(() => {
      _updateTaskProgress()
    }, 1000)
    
    return () => {
      if (taskTimerRef.current) {
        clearInterval(taskTimerRef.current)
      }
    }
  }, [_updateTaskProgress])
  
  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPanel && infoPanelRef.current && !infoPanelRef.current.contains(e.target)) {
        closeInfoPanel()
      }
    }
    
    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPanel, closeInfoPanel])
  
  useEffect(() => {
    if (showInfoPanel) {
      setIsExiting(false)
      setShowPanel(true)
    } else if (showPanel) {
      setIsExiting(true)
      const timer = setTimeout(() => {
        setShowPanel(false)
        setIsExiting(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [showInfoPanel])
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }
  
  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
  }
  
  // 计算面板位置
  const getPanelStyle = () => {
    if (!panelPosition || panelPosition.x === 0) {
      return { top: '70px', right: '16px' }
    }
    
    const panelWidth = 340
    const panelHeight = 400
    const margin = 8
    
    let top = panelPosition.y - panelHeight - margin
    let left = panelPosition.x
    
    if (top < 60) {
      top = panelPosition.y + 50
    }
    
    if (left + panelWidth > window.innerWidth - margin) {
      left = window.innerWidth - panelWidth - margin
    }
    if (left < margin) {
      left = margin
    }
    
    return {
      top: `${top}px`,
      left: `${left}px`,
      right: 'auto'
    }
  }
  
  return (
    <div className="app-container">
      <Header time={formatTime(time)} date={formatDate(time)} />
      
      <main className="main-canvas">
        <Canvas
          orthographic
          camera={{ position: [0, 2, 15], zoom: 45 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <CameraController />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
        
        {/* Mini Map */}
        <MiniMap />
        
        {showPanel && (
          <div ref={infoPanelRef} className={isExiting ? 'info-panel-exit' : ''} style={{ position: 'fixed', ...getPanelStyle() }}>
            <InfoPanel />
          </div>
        )}
      </main>
      
      <WorkReportPanel />
      
      {/* Message Panel - 可拖动 */}
      {showMessagePanel && (
        <DraggablePanel 
          initialPosition={msgPanelPos}
          style={{
            width: '380px',
            height: '100vh',
            background: 'rgba(18, 18, 23, 0.98)',
            backdropFilter: 'blur(24px)',
            borderLeft: '1px solid var(--color-border)',
            zIndex: 300,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <MessagePanel />
        </DraggablePanel>
      )}
      
      {/* Task Panel - 可拖动 */}
      {showTaskPanel && (
        <DraggablePanel 
          initialPosition={taskPanelPos}
          style={{
            width: '400px',
            height: '100vh',
            background: 'rgba(18, 18, 23, 0.98)',
            backdropFilter: 'blur(24px)',
            borderLeft: '1px solid var(--color-border)',
            zIndex: 300,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <TaskPanel />
        </DraggablePanel>
      )}
      
      {/* Notification Panel - 可拖动 */}
      <NotificationPanel notifPanelPos={notifPanelPos} setNotifPanelPos={setNotifPanelPos} />
      
      {/* Status Bar */}
      <StatusBar />
      
      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel />
    </div>
  )
}

export default App
