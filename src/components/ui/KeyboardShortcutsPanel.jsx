import React, { useState, useEffect } from 'react'
import useOfficeStore from '../../stores/officeStore'

function KeyboardShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleTheme = useOfficeStore(state => state.toggleTheme)
  const toggleTaskPanel = useOfficeStore(state => state.toggleTaskPanel)
  const toggleMessagePanel = useOfficeStore(state => state.toggleMessagePanel)
  const toggleNotificationPanel = useOfficeStore(state => state.toggleNotificationPanel)
  
  const shortcuts = [
    { keys: ['Ctrl', 'T'], description: '打开/关闭任务面板' },
    { keys: ['Ctrl', 'M'], description: '打开/关闭消息面板' },
    { keys: ['Ctrl', 'N'], description: '打开/关闭通知面板' },
    { keys: ['Ctrl', '1'], description: '导航到 CEO' },
    { keys: ['Ctrl', '2'], description: '导航到 COO' },
    { keys: ['Ctrl', '3'], description: '导航到 市场部' },
    { keys: ['Ctrl', '4'], description: '导航到 销售部' },
    { keys: ['Ctrl', '5'], description: '导航到 运营部' },
    { keys: ['Home'], description: '回到中心位置' },
    { keys: ['Esc'], description: '关闭面板' },
  ]
  
  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault()
          setIsOpen(prev => !prev)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  if (!isOpen) return null
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 600,
    }} onClick={() => setIsOpen(false)}>
      <div style={{
        width: '400px',
        maxHeight: '80vh',
        background: 'rgba(18, 18, 23, 0.98)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        overflow: 'hidden',
        animation: 'slideUp 0.2s ease-out'
      }} onClick={e => e.stopPropagation()}>
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⌨️</span>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>键盘快捷键</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
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
        
        {/* Shortcuts List */}
        <div style={{ padding: '12px 16px', maxHeight: 'calc(80vh - 80px)', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {shortcuts.map((shortcut, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: '8px'
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {shortcut.description}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {shortcut.keys.map((key, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '3px 8px',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
              💡 按住 <kbd style={{ padding: '2px 6px', background: 'var(--color-bg-secondary)', borderRadius: '4px', fontSize: '10px' }}>Ctrl</kbd> + <kbd style={{ padding: '2px 6px', background: 'var(--color-bg-secondary)', borderRadius: '4px', fontSize: '10px' }}>?</kbd> 可随时打开此面板
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsPanel
