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
import MeetingRoomList from './components/ui/MeetingRoom'
import TaskBoard3D from './components/ui/TaskBoard3D'
import Collaboration from './components/ui/Collaboration'
import DataViz from './components/ui/DataViz'
import MobileToolbar from './components/ui/MobileToolbar'
import BottomSheetPanel from './components/ui/BottomSheetPanel'
import MobilePreview from './components/ui/MobilePreview'
import OpenClawStatus from './components/ui/OpenClawStatus'
import useOfficeStore from './stores/officeStore'
import { useMobile, useDevicePixelRatio } from './hooks/useMobile'

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
  // 移动端检测
  const { isMobile } = useMobile()
  const deviceDpr = useDevicePixelRatio()
  
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
  const showMeetingRoom = useOfficeStore(state => state.showMeetingRoom)
  const closeMeetingRoom = useOfficeStore(state => state.closeMeetingRoom)
  const showTaskBoard3D = useOfficeStore(state => state.showTaskBoard3D)
  const toggleTaskBoard3D = useOfficeStore(state => state.toggleTaskBoard3D)
  const showCollaboration = useOfficeStore(state => state.showCollaboration)
  const toggleCollaboration = useOfficeStore(state => state.toggleCollaboration)
  const showDataViz = useOfficeStore(state => state.showDataViz)
  const toggleDataViz = useOfficeStore(state => state.toggleDataViz)
  
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
          gl={{ antialias: !isMobile, alpha: false }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
        >
          <CameraController />
          <Suspense fallback={null}>
            <Scene isMobile={isMobile} />
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
      
      {/* Message Panel - 可拖动 (桌面) / Bottom Sheet (移动) */}
      {showMessagePanel && (
        isMobile ? (
          <BottomSheetPanel
            title="消息"
            isOpen={showMessagePanel}
            onClose={toggleMessagePanel}
          >
            <MessagePanel />
          </BottomSheetPanel>
        ) : (
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
        )
      )}
      
      {/* Task Panel - 可拖动 (桌面) / Bottom Sheet (移动) */}
      {showTaskPanel && (
        isMobile ? (
          <BottomSheetPanel
            title="任务"
            isOpen={showTaskPanel}
            onClose={toggleTaskPanel}
          >
            <TaskPanel />
          </BottomSheetPanel>
        ) : (
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
        )
      )}
      
      {/* Meeting Room Panel - 桌面 / 移动 */}
      {showMeetingRoom && (
        isMobile ? (
          <BottomSheetPanel
            title="会议室"
            isOpen={showMeetingRoom}
            onClose={closeMeetingRoom}
          >
            <MeetingRoomList onClose={closeMeetingRoom} />
          </BottomSheetPanel>
        ) : (
          <div style={{
            position: 'fixed',
            top: '70px',
            right: '16px',
            width: '380px',
            maxHeight: 'calc(100vh - 100px)',
            background: 'rgba(18, 18, 23, 0.98)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            zIndex: 400,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <MeetingRoomList onClose={closeMeetingRoom} />
          </div>
        )
      )}
      
      {/* Task Board 3D Panel */}
      {showTaskBoard3D && (
        isMobile ? (
          <BottomSheetPanel
            title="3D任务看板"
            isOpen={showTaskBoard3D}
            onClose={toggleTaskBoard3D}
            isFullscreen={false}
          >
            <TaskBoard3D onClose={toggleTaskBoard3D} />
          </BottomSheetPanel>
        ) : (
          <DraggablePanel
            initialPosition={{ x: null, y: null }}
            style={{
              position: 'fixed',
              top: '70px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '420px',
              maxHeight: 'calc(100vh - 100px)',
              background: 'rgba(18, 18, 23, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              zIndex: 400,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            <TaskBoard3D onClose={toggleTaskBoard3D} />
          </DraggablePanel>
        )
      )}
      
      {/* Collaboration Panel */}
      {showCollaboration && (
        isMobile ? (
          <BottomSheetPanel
            title="协作动态"
            isOpen={showCollaboration}
            onClose={toggleCollaboration}
          >
            <Collaboration onClose={toggleCollaboration} />
          </BottomSheetPanel>
        ) : (
          <DraggablePanel
            initialPosition={{ x: null, y: null }}
            style={{
              position: 'fixed',
              top: '70px',
              left: '16px',
              width: '340px',
              maxHeight: 'calc(100vh - 100px)',
              background: 'rgba(18, 18, 23, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              zIndex: 400,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            <Collaboration onClose={toggleCollaboration} />
          </DraggablePanel>
        )
      )}
      
      {/* Data Viz Panel */}
      {showDataViz && (
        isMobile ? (
          <BottomSheetPanel
            title="数据概览"
            isOpen={showDataViz}
            onClose={toggleDataViz}
          >
            <DataViz onClose={toggleDataViz} />
          </BottomSheetPanel>
        ) : (
          <DraggablePanel
            initialPosition={{ x: null, y: null }}
            style={{
              position: 'fixed',
              top: '70px',
              right: '16px',
              width: '360px',
              maxHeight: 'calc(100vh - 100px)',
              background: 'rgba(18, 18, 23, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              zIndex: 400,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            <DataViz onClose={toggleDataViz} />
          </DraggablePanel>
        )
      )}
      
      {/* Notification Panel - 可拖动 */}
      <NotificationPanel notifPanelPos={notifPanelPos} setNotifPanelPos={setNotifPanelPos} />
      
      {/* Status Bar */}
      <StatusBar />
      
      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel />
      
      {/* 移动端底部工具栏 */}
      <MobileToolbar />

      {/* 移动端预览调试窗口 */}
      <MobilePreview 
        isOpen={useOfficeStore(state => state.showMobilePreview)}
        onClose={() => useOfficeStore.getState().toggleMobilePreview()}
      />

      {/* OpenClaw 连接状态面板 */}
      {useOfficeStore(state => state.showOpenClawStatus) && (
        <OpenClawStatus
          onClose={() => useOfficeStore.getState().toggleOpenClawStatus()}
        />
      )}
    </div>
  )
}

export default App
