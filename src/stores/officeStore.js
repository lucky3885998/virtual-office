import { create } from 'zustand'
import { members as configMembers, getAllReports } from '../data/members'

// ========== LocalStorage 持久化 ==========
const STORAGE_KEY = 'naling-virtual-office-data'

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return data
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e)
  }
  return null
}

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

// ========== 视图模式 ==========
export const ViewMode = {
  ALL: 'all',
  DEPARTMENT: 'dept',
  STATUS: 'status'
}

// ========== 状态类型 ==========
export const StatusType = {
  WORKING: 'working',
  IDLE: 'idle',
  BUSY: 'busy',
  OFFLINE: 'offline'
}

// ========== 用户角色 ==========
export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer'
}

// ========== 权限配置 ==========
const permissions = {
  [UserRole.ADMIN]: {
    canEdit: true,
    canExport: true,
    canViewAll: true,
    canChangeStatus: true,
    canManageMembers: true,
    canSendMessage: true,
    canCreateTask: true,
    canAssignTask: true
  },
  [UserRole.MANAGER]: {
    canEdit: true,
    canExport: true,
    canViewAll: true,
    canChangeStatus: true,
    canManageMembers: false,
    canSendMessage: true,
    canCreateTask: true,
    canAssignTask: true
  },
  [UserRole.VIEWER]: {
    canEdit: false,
    canExport: false,
    canViewAll: true,
    canChangeStatus: false,
    canManageMembers: false,
    canSendMessage: false,
    canCreateTask: false,
    canAssignTask: false
  }
}

// ========== 初始数据 ==========
const initialTasks = [
  { id: 'task-1', title: '完成Q2季度报告', assignee: 'CEO-01', assigner: 'CEO-01', department: 'CEO', priority: 'high', status: 'in-progress', deadline: '2026-04-05', startedAt: new Date().toISOString() },
  { id: 'task-2', title: '优化营销策略', assignee: 'MKT-01', assigner: 'COO-01', department: 'MKT', priority: 'medium', status: 'pending', deadline: '2026-04-10' },
  { id: 'task-3', title: '客户需求对接', assignee: 'SAL-02-01', assigner: 'COO-01', department: 'SAL', priority: 'high', status: 'in-progress', deadline: '2026-04-03', startedAt: new Date().toISOString() },
  { id: 'task-4', title: '系统安全审计', assignee: 'IT-01-02', assigner: 'CEO-01', department: 'IT', priority: 'high', status: 'in-progress', deadline: '2026-04-07', startedAt: new Date().toISOString() },
  { id: 'task-5', title: '财务报表整理', assignee: 'FIN-05', assigner: 'COO-01', department: 'FIN', priority: 'medium', status: 'pending', deadline: '2026-04-15' },
]

const initialMessages = [
  { id: 'msg-1', from: 'CEO-01', to: 'all', content: '各位同事，Q2季度会议将于明天上午10点召开，请准时参加。', time: '09:30', type: 'announcement' },
  { id: 'msg-2', from: 'COO-01', to: 'MKT', content: 'MKT部门请在本周内提交营销方案初稿。', time: '10:15', type: 'department' },
  { id: 'msg-3', from: 'IT-01-02', to: 'CEO-01', content: '安全审计报告已完成，已发送至您的邮箱。', time: '14:22', type: 'direct' },
  { id: 'msg-4', from: 'COO-01', to: 'all', content: '公司新项目正式启动，祝大家工作顺利！', time: '16:45', type: 'announcement' },
]

// ========== 加载持久化数据或使用初始数据 ==========
const savedData = loadFromStorage()

const useOfficeStore = create((set, get) => ({
  // ========== 成员数据 ==========
  // 初始为配置数据，运行时会被 OpenClaw 数据覆盖
  members: savedData?.members || configMembers,
  
  // OpenClaw 数据源标志
  openClawDataSource: false,
  
  // 当前用户角色
  
  // 当前用户角色
  currentRole: savedData?.currentRole || UserRole.ADMIN,
  
  // 当前用户权限
  currentPermissions: permissions[savedData?.currentRole || UserRole.ADMIN],
  
  // ========== 选中的成员 ==========
  selectedMember: null,
  
  // ========== 视图模式 ==========
  viewMode: ViewMode.ALL,
  
  // ========== 筛选 ==========
  filterDepartment: null,
  filterStatus: null,
  
  // ========== 报告 ==========
  reports: savedData?.reports || getAllReports(savedData?.members || members),
  
  // ========== 信息面板 ==========
  showInfoPanel: false,
  panelPosition: { x: 0, y: 0 },
  
  // ========== 时间戳 ==========
  lastUpdateTime: new Date().toISOString(),
  autoUpdateInterval: 5000,
  autoUpdateEnabled: true,
  
  // ========== 任务管理 ==========
  tasks: savedData?.tasks || initialTasks,
  taskFilter: 'all',
  
  // ========== 执行中的任务 { taskId: { startTime, duration, progress } } ==========
  executingTasks: savedData?.executingTasks || {},
  
  // ========== 通讯系统 ==========
  messages: savedData?.messages || initialMessages,
  unreadCount: savedData?.unreadCount || 0,
  activeChat: null,
  showMessagePanel: false,
  
  // ========== 导航系统 ==========
  cameraTarget: { x: 0, y: 2 },
  isNavigating: false,
  
  // ========== 面板状态 ==========
  showTaskPanel: false,
  showMobilePreview: false,
  showOpenClawStatus: false,
  
  // ========== 主题设置 ==========
  theme: savedData?.theme || 'dark', // 'dark' or 'light'
  
  // ========== 通知系统 ==========
  notifications: savedData?.notifications || [],
  notificationTimer: null,
  
  // ========== 持久化保存 ==========
  _saveToStorage: () => {
    const state = get()
    const dataToSave = {
      members: state.members,
      currentRole: state.currentRole,
      tasks: state.tasks,
      executingTasks: state.executingTasks,
      reports: state.reports,
      messages: state.messages,
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      theme: state.theme
    }
    saveToStorage(dataToSave)
  },
  
  // ========== 角色切换 ==========
  setRole: (role) => {
    set({
      currentRole: role,
      currentPermissions: permissions[role] || permissions[UserRole.VIEWER]
    })
    get()._saveToStorage()
  },
  
  // ========== 成员选择 ==========
  selectMember: (memberId, position) => {
    const member = get().members.find(m => m.id === memberId)
    set({
      selectedMember: member || null,
      showInfoPanel: !!member,
      panelPosition: position || { x: 0, y: 0 }
    })
  },
  
  closeInfoPanel: () => set({ showInfoPanel: false, selectedMember: null }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setFilterDepartment: (deptId) => set({ filterDepartment: deptId }),
  
  setFilterStatus: (status) => set({ filterStatus: status }),
  
  // ========== 更新成员状态 ==========
  updateMemberStatus: (memberId, status) => set((state) => {
    if (!state.currentPermissions.canChangeStatus) return state
    const newMembers = state.members.map(m => 
      m.id === memberId ? { ...m, status } : m
    )
    return {
      members: newMembers,
      reports: getAllReports(newMembers),
      lastUpdateTime: new Date().toISOString()
    }
  }),
  
  // ========== 更新成员任务 ==========
  updateMemberTask: (memberId, task) => set((state) => {
    if (!state.currentPermissions.canEdit) return state
    return {
      members: state.members.map(m => 
        m.id === memberId ? { ...m, currentTask: task } : m
      )
    }
  }),

  // ========== 从 OpenClaw 完全替换成员数据 ==========
  setMembersFromOpenClaw: (openClawMembers) => set({
    members: openClawMembers,
    openClawDataSource: true
  }),

  // ========== 从 OpenClaw 同步单个成员数据 ==========
  updateMemberFromOpenClaw: (memberId, openClawData) => set((state) => {
    // 如果是 OpenClaw 数据源，直接更新对应成员
    if (state.openClawDataSource) {
      return {
        members: state.members.map(m => 
          m.id === memberId 
            ? { 
                ...m, 
                status: openClawData.status || m.status,
                statusColor: openClawData.statusColor || m.statusColor,
                openClawData: openClawData.openClawData,
                currentTask: openClawData.currentTask || m.currentTask
              }
            : m
        )
      }
    }
    return state
  }),
  
  // ========== 添加报告 ==========
  addReport: (memberId, report) => set((state) => {
    if (!state.currentPermissions.canEdit) return state
    const newMembers = state.members.map(m => 
      m.id === memberId 
        ? { ...m, lastReport: { ...report, time: new Date().toISOString().slice(0, 16).replace('T', ' ') } }
        : m
    )
    return {
      members: newMembers,
      reports: getAllReports(newMembers),
      lastUpdateTime: new Date().toISOString()
    }
  }),
  
  // ========== 模拟状态更新 ==========
  simulateStatusUpdate: () => set((state) => {
    if (!state.currentPermissions.canChangeStatus) return state
    
    const statuses = ['working', 'idle', 'busy', 'offline']
    
    // 每次更新1-3个成员的状态
    const updateCount = Math.floor(Math.random() * 3) + 1
    const memberIndices = []
    
    for (let i = 0; i < updateCount; i++) {
      const idx = Math.floor(Math.random() * state.members.length)
      if (!memberIndices.includes(idx)) {
        memberIndices.push(idx)
      }
    }
    
    const newMembers = state.members.map((m, idx) => {
      if (memberIndices.includes(idx)) {
        // 根据是否有进行中任务来决定状态
        const memberTasks = state.tasks.filter(t => t.assignee === m.id && t.status === 'in-progress')
        let newStatus
        
        if (memberTasks.length > 0) {
          // 有进行中任务，80%概率忙碌，20%概率工作
          newStatus = Math.random() < 0.8 ? 'busy' : 'working'
        } else {
          // 没有任务，根据权重选择
          const rand = Math.random()
          if (rand < 0.5) newStatus = 'working'
          else if (rand < 0.75) newStatus = 'idle'
          else if (rand < 0.9) newStatus = 'busy'
          else newStatus = 'offline'
        }
        
        return { ...m, status: newStatus }
      }
      return m
    })
    
    return {
      members: newMembers,
      reports: getAllReports(newMembers),
      lastUpdateTime: new Date().toISOString()
    }
  }),
  
  toggleAutoUpdate: () => set((state) => ({ autoUpdateEnabled: !state.autoUpdateEnabled })),
  
  setAutoUpdateInterval: (interval) => set({ autoUpdateInterval: interval }),
  
  // ========== 任务管理 Actions ==========
  addTask: (task) => set((state) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'pending'
    }
    return { tasks: [...state.tasks, newTask] }
  }),
  
  updateTaskStatus: (taskId, status) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return state
    
    const now = new Date().toISOString()
    
    // 完成任务
    if (status === 'completed' && task.status !== 'completed') {
      const assignee = state.members.find(m => m.id === task.assignee)
      const priorityLabel = task.priority === 'high' ? '🔴高' : task.priority === 'medium' ? '🟡中' : '🟢低'
      const timeStr = new Date().toISOString().slice(0, 16).replace('T', ' ')
      
      const newReport = {
        title: `✅ 完成任务: ${task.title}`,
        summary: `优先级: ${priorityLabel} | 负责人: ${assignee?.name || task.assignee}`,
        status: 'completed',
        taskId: task.id,
        time: timeStr
      }
      
      // 检查该成员是否还有其他进行中的任务
      const memberOtherTasks = state.tasks.filter(t => 
        t.assignee === task.assignee && t.id !== taskId && t.status === 'in-progress'
      )
      
      const updatedMembers = state.members.map(m => {
        if (m.id === task.assignee) {
          return { ...m, lastReport: { ...newReport, time: timeStr }, status: memberOtherTasks.length > 0 ? 'busy' : 'working' }
        }
        return m
      })
      
      // 移除执行中的任务
      const newExecutingTasks = { ...state.executingTasks }
      delete newExecutingTasks[taskId]
      
      // 生成通知
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'task_completed',
        title: '任务完成',
        content: `${assignee?.name || '未知成员'}完成了任务: ${task.title}`,
        time: timeStr,
        read: false
      }
      
      return {
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed', completedAt: now } : t),
        executingTasks: newExecutingTasks,
        members: updatedMembers,
        reports: getAllReports(updatedMembers),
        notifications: [notification, ...state.notifications].slice(0, 50),
        lastUpdateTime: now
      }
    }
    
    // 开始任务
    if (status === 'in-progress') {
      const duration = task.priority === 'high' ? 15000 : task.priority === 'medium' ? 25000 : 40000
      
      // 更新成员状态为忙碌（支持多并行，不再检查是否已有任务）
      const updatedMembers = state.members.map(m => 
        m.id === task.assignee ? { ...m, status: 'busy' } : m
      )
      
      return {
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'in-progress', startedAt: now } : t),
        executingTasks: {
          ...state.executingTasks,
          [taskId]: { startTime: Date.now(), duration, progress: 0 }
        },
        members: updatedMembers,
        lastUpdateTime: now
      }
    }
    
    // 其他状态变更
    return {
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }
  }),
  
  // 恢复任务到待处理（重新执行）
  resetTask: (taskId) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return state
    
    // 移除执行中的任务记录
    const newExecutingTasks = { ...state.executingTasks }
    delete newExecutingTasks[taskId]
    
    // 检查该成员是否还有其他进行中的任务
    const memberOtherTasks = state.tasks.filter(t => 
      t.assignee === task.assignee && t.id !== taskId && t.status === 'in-progress'
    )
    
    const updatedMembers = state.members.map(m => {
      if (m.id === task.assignee && memberOtherTasks.length === 0) {
        return { ...m, status: 'working' }
      }
      return m
    })
    
    return {
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'pending', startedAt: null, completedAt: null } : t),
      executingTasks: newExecutingTasks,
      members: updatedMembers,
      lastUpdateTime: new Date().toISOString()
    }
  }),
  
  deleteTask: (taskId) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId)
    const newExecutingTasks = { ...state.executingTasks }
    delete newExecutingTasks[taskId]
    
    // 检查该成员是否还有其他进行中的任务
    const memberOtherTasks = state.tasks.filter(t => 
      t.assignee === task?.assignee && t.id !== taskId && t.status === 'in-progress'
    )
    
    const updatedMembers = state.members.map(m => {
      if (m.id === task?.assignee && memberOtherTasks.length === 0) {
        return { ...m, status: 'working' }
      }
      return m
    })
    
    return {
      tasks: state.tasks.filter(t => t.id !== taskId),
      executingTasks: newExecutingTasks,
      members: updatedMembers,
      lastUpdateTime: new Date().toISOString()
    }
  }),
  
  // ========== 更新任务进度（定时器调用）==========
  _updateTaskProgress: () => set((state) => {
    const now = new Date()
    const updates = []
    const newExecuting = { ...state.executingTasks }
    
    // 计算每个任务的进度
    for (const [taskId, exec] of Object.entries(newExecuting)) {
      const elapsed = Date.now() - exec.startTime
      const progress = Math.min(100, (elapsed / exec.duration) * 100)
      newExecuting[taskId] = { ...exec, progress }
      
      if (progress >= 100) {
        updates.push(taskId)
      }
    }
    
    if (updates.length === 0) {
      return { executingTasks: newExecuting }
    }
    
    // 完成到期的任务
    const timeStr = now.toISOString().slice(0, 16).replace('T', ' ')
    const updatedTasks = state.tasks.map(t => {
      if (updates.includes(t.id) && t.status === 'in-progress') {
        return { ...t, status: 'completed', completedAt: now.toISOString() }
      }
      return t
    })
    
    // 更新成员状态并生成报告
    const updatedMembers = state.members.map(m => {
      const completedTasks = updatedTasks.filter(t => t.assignee === m.id && updates.includes(t.id))
      const otherTasks = updatedTasks.filter(t => t.assignee === m.id && t.status === 'in-progress' && !updates.includes(t.id))
      
      if (completedTasks.length > 0) {
        const lastCompleted = completedTasks[completedTasks.length - 1]
        const priorityLabel = lastCompleted.priority === 'high' ? '🔴高' : lastCompleted.priority === 'medium' ? '🟡中' : '🟢低'
        
        const newReport = {
          title: `✅ 完成任务: ${lastCompleted.title}`,
          summary: `优先级: ${priorityLabel} | 负责人: ${m.name}`,
          status: 'completed',
          taskId: lastCompleted.id,
          time: timeStr
        }
        
        // 如果还有其他进行中的任务，保持忙碌
        return { ...m, status: otherTasks.length > 0 ? 'busy' : 'working', lastReport: newReport }
      }
      return m
    })
    
    // 生成通知
    const newNotifications = updates.map(taskId => {
      const task = updatedTasks.find(t => t.id === taskId)
      const assignee = state.members.find(m => m.id === task?.assignee)
      return {
        id: `notif-${Date.now()}-${taskId}`,
        type: 'task_completed',
        title: '任务完成',
        content: `${assignee?.name || '未知成员'}完成了任务: ${task?.title}`,
        time: timeStr,
        read: false
      }
    })
    
    // 清理完成的执行任务
    for (const id of updates) {
      delete newExecuting[id]
    }
    
    return {
      tasks: updatedTasks,
      executingTasks: newExecuting,
      members: updatedMembers,
      reports: getAllReports(updatedMembers),
      notifications: [...newNotifications, ...state.notifications].slice(0, 50),
      lastUpdateTime: now.toISOString()
    }
  }),
  
  setTaskFilter: (filter) => set({ taskFilter: filter }),
  
  // ========== 消息系统 Actions ==========
  sendMessage: (message) => set((state) => {
    if (!state.currentPermissions.canSendMessage) return state
    
    const newMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    
    // 生成通知
    const notification = {
      id: `notif-${Date.now()}`,
      type: message.type === 'announcement' ? 'announcement' : 'message',
      title: message.type === 'announcement' ? '📢 新公告' : '💬 新消息',
      content: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
      time: newMessage.time,
      read: false
    }
    
    return {
      messages: [...state.messages, newMessage],
      unreadCount: state.unreadCount + 1,
      notifications: [notification, ...state.notifications].slice(0, 50)
    }
  }),
  
  toggleMessagePanel: () => set((state) => ({
    showMessagePanel: !state.showMessagePanel,
    unreadCount: state.showMessagePanel ? state.unreadCount : 0
  })),
  
  showNotificationPanel: false,
  
  toggleNotificationPanel: () => set((state) => ({
    showNotificationPanel: !state.showNotificationPanel
  })),
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    return { theme: newTheme }
  }),
  
  toggleTaskPanel: () => set((state) => ({ showTaskPanel: !state.showTaskPanel })),
  
  showTaskBoard3D: false,
  toggleTaskBoard3D: () => set((state) => ({ showTaskBoard3D: !state.showTaskBoard3D })),
  
  showCollaboration: false,
  toggleCollaboration: () => set((state) => ({ showCollaboration: !state.showCollaboration })),
  
  showDataViz: false,
  toggleDataViz: () => set((state) => ({ showDataViz: !state.showDataViz })),

  toggleMobilePreview: () => set((state) => ({ showMobilePreview: !state.showMobilePreview })),

  toggleOpenClawStatus: () => set((state) => ({ showOpenClawStatus: !state.showOpenClawStatus })),

  setActiveChat: (chat) => set({ activeChat: chat }),
  
  // ========== 导航系统 Actions ==========
  navigateTo: (x, y) => set({
    cameraTarget: { x, y },
    isNavigating: true
  }),
  
  finishNavigation: () => set({ isNavigating: false }),
  
  // ========== 虚拟会议室系统 ==========
  currentMeetingRoom: null,
  meetingRooms: {}, // { roomId: [memberId, ...] }
  showMeetingRoom: false,
  
  openMeetingRoom: () => set({ showMeetingRoom: true }),
  
  closeMeetingRoom: () => set({ showMeetingRoom: false }),
  
  joinMeetingRoom: (roomId) => set((state) => {
    // 找到当前用户（这里用第一个成员作为代表）
    const currentUser = state.members[0]
    if (!currentUser) return state
    
    // 如果已经在其他会议室，先离开
    const newMeetingRooms = { ...state.meetingRooms }
    if (state.currentMeetingRoom && newMeetingRooms[state.currentMeetingRoom]) {
      newMeetingRooms[state.currentMeetingRoom] = newMeetingRooms[state.currentMeetingRoom].filter(
        m => m.id !== currentUser.id
      )
    }
    
    // 加入新会议室
    if (!newMeetingRooms[roomId]) {
      newMeetingRooms[roomId] = []
    }
    
    // 检查是否已在该会议室
    const alreadyInRoom = newMeetingRooms[roomId].some(m => m.id === currentUser.id)
    if (!alreadyInRoom) {
      newMeetingRooms[roomId] = [...newMeetingRooms[roomId], currentUser]
    }
    
    // 生成通知
    const roomNames = { 'room-1': '战略会议室', 'room-2': '协作空间', 'room-3': '创意工坊' }
    const notification = {
      id: `notif-meeting-${Date.now()}`,
      type: 'meeting',
      title: '🏛️ 加入会议室',
      content: `已加入 ${roomNames[roomId] || roomId}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      read: false
    }
    
    return {
      currentMeetingRoom: roomId,
      meetingRooms: newMeetingRooms,
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1
    }
  }),
  
  leaveMeetingRoom: () => set((state) => {
    if (!state.currentMeetingRoom) return state
    
    const currentUser = state.members[0]
    if (!currentUser) return state
    
    const newMeetingRooms = { ...state.meetingRooms }
    if (newMeetingRooms[state.currentMeetingRoom]) {
      newMeetingRooms[state.currentMeetingRoom] = newMeetingRooms[state.currentMeetingRoom].filter(
        m => m.id !== currentUser.id
      )
    }
    
    // 生成通知
    const notification = {
      id: `notif-meeting-${Date.now()}`,
      type: 'meeting',
      title: '🚪 离开会议室',
      content: `已离开会议室`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      read: false
    }
    
    return {
      currentMeetingRoom: null,
      meetingRooms: newMeetingRooms,
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1
    }
  }),
  
  // ========== 通知系统 Actions ==========
  markNotificationRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
  })),
  
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  
  // 启动通知模拟
  startNotificationSimulation: () => {
    const state = get()
    if (state.notificationTimer) return
    
    // 模拟定期系统公告
    const timer = setInterval(() => {
      const currentState = useOfficeStore.getState()
      const notifications = []
      const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
      
      // 随机生成1-2条通知
      const notificationCount = Math.floor(Math.random() * 2) + 1
      
      for (let i = 0; i < notificationCount; i++) {
        const notifTypes = [
          { type: 'system', title: '📢 系统通知', content: '🌟 保持积极心态，高效完成今日任务！' },
          { type: 'system', title: '📊 工作动态', content: '💼 销售部门已完成本月KPI目标！' },
          { type: 'task', title: '✅ 任务完成', content: '🎉 IT部门完成了系统安全检查' },
          { type: 'status', title: '👤 状态更新', content: '🔄 多名同事状态已更新' },
          { type: 'system', title: '☕ 休息提醒', content: '☕ 适当休息，保持高效！' },
          { type: 'report', title: '📋 新报告', content: '📝 市场部提交了本周工作报告' },
          { type: 'system', title: '📅 会议提醒', content: '⏰ 部门例会将在15分钟后开始' },
        ]
        
        const randomNotif = notifTypes[Math.floor(Math.random() * notifTypes.length)]
        
        notifications.push({
          id: `notif-${Date.now()}-${i}`,
          type: randomNotif.type,
          title: randomNotif.title,
          content: randomNotif.content,
          time: now,
          read: false
        })
      }
      
      useOfficeStore.setState({
        notifications: [...notifications, ...currentState.notifications].slice(0, 50),
        unreadCount: currentState.unreadCount + notificationCount
      })
    }, 15000) // 每15秒发送模拟通知
    
    set({ notificationTimer: timer })
  },
  
  // 停止通知模拟
  stopNotificationSimulation: () => {
    const timer = get().notificationTimer
    if (timer) {
      clearInterval(timer)
      set({ notificationTimer: null })
    }
  },
  
  // ========== 初始化通知模拟 ==========
  initializeNotifications: () => {
    const state = get()
    // 添加一条欢迎通知
    const welcomeNotification = {
      id: `notif-welcome-${Date.now()}`,
      type: 'system',
      title: '🎉 欢迎使用',
      content: '纳灵数字企业虚拟办公室已启动，每15秒推送实时动态。点击右上角 LIVE 开关可控制实时更新。',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      read: false
    }
    
    if (state.notifications.length === 0) {
      useOfficeStore.setState({
        notifications: [welcomeNotification],
        unreadCount: 1
      })
    }
    
    state.startNotificationSimulation()
    state._saveToStorage()
  },
  
  // ========== 导出报告 ==========
  exportReports: (format = 'json') => {
    const state = get()
    const reports = state.reports
    const tasks = state.tasks.filter(t => t.status === 'completed')
    const members = state.members
    
    if (format === 'json') {
      const exportData = {
        exportTime: new Date().toISOString(),
        companyName: '纳灵数字企业',
        summary: {
          totalReports: reports.length,
          totalTasksCompleted: tasks.length,
          totalMembers: members.length
        },
        reports: reports.map(r => ({
          ...r,
          taskDetails: r.taskId ? tasks.find(t => t.id === r.taskId) : null
        }))
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `工作报告_${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      const headers = ['时间', '成员', '部门', '任务标题', '优先级', '状态', '报告内容']
      const rows = reports.map(r => [
        r.time || '',
        r.memberName || '',
        r.department || '',
        r.title?.replace('✅ 完成任务: ', '') || '',
        r.summary?.match(/优先级: (🔴高|🟡中|🟢低)/)?.[1] || '',
        r.status || '',
        r.summary || ''
      ])
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
        .join('\n')
      
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `工作报告_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }
  },
  
  // ========== 数据重置 ==========
  resetData: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({
      members: members,
      tasks: initialTasks,
      executingTasks: {},
      reports: getAllReports(members),
      messages: initialMessages,
      notifications: [],
      unreadCount: 0
    })
  }
}))

export default useOfficeStore
