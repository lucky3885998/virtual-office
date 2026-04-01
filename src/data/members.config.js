/**
 * 成员数据配置文件
 * 
 * 如何配置你自己的数据：
 * 1. 修改 departments 对象 - 定义你的部门
 * 2. 修改 members 数组 - 添加你的成员
 * 3. 每个成员需要指定 department（对应 departments 中的 key）
 */

// ============ 部门定义 ============
// key: 部门代码 (必须唯一)
// name: 部门显示名称
// icon: 部门图标 (emoji)
// color: 部门主题色

export const departments = {
  CEO: { id: 'CEO', name: '总裁办', icon: '👑', color: '#FFD700' },
  COO: { id: 'COO', name: '运营部', icon: '⚡', color: '#3B82F6' },
  MKT: { id: 'MKT', name: '市场部', icon: '📢', color: '#FF6B6B' },
  SAL: { id: 'SAL', name: '销售部', icon: '💰', color: '#10B981' },
  DEL: { id: 'DEL', name: '交付部', icon: '🎯', color: '#8B5CF6' },
  IT: { id: 'IT', name: '技术部', icon: '💻', color: '#06B6D4' },
  FIN: { id: 'FIN', name: '财务部', icon: '📊', color: '#F59E0B' },
  OPR: { id: 'OPR', name: '运营部', icon: '📋', color: '#EC4899' }
}

// ============ 成员定义 ============
// id: 成员ID (必须唯一)
// name: 成员名称
// title: 职位名称
// department: 所属部门 (对应 departments 的 key)
// status: 当前状态 (working | idle | busy | offline)
// currentTask: 当前任务 (可选)
// lastReport: 最新报告 (可选)

export const members = [
  {
    id: 'CEO',
    name: '连春树',
    title: '首席执行官',
    department: 'CEO',
    status: 'working',
    currentTask: '战略决策与资源整合',
    lastReport: {
      title: '完成数字团队组建',
      time: '2026-03-30 23:00',
      summary: '确认13个数字工作单元就绪，数字团队正式运营'
    }
  },
  {
    id: 'COO',
    name: 'Lucky',
    title: '首席运营官',
    department: 'COO',
    status: 'working',
    currentTask: '数字团队运营统筹',
    lastReport: {
      title: '全员工作状态报告',
      time: '2026-03-30 23:50',
      summary: '完成全员工作状态汇总，数字团队运营正式启动'
    }
  },
  {
    id: 'MKT-01',
    name: '01-文案',
    title: '文案组-首席内容官',
    department: 'MKT',
    status: 'idle',
    currentTask: '待命，等待内容任务',
    lastReport: {
      title: '完成文案工作手册',
      time: '2026-03-30 18:00',
      summary: '创建文案工作手册，含7个模板，3374字节'
    }
  },
  {
    id: 'MKT-03',
    name: '03-设计',
    title: '设计组-首席设计师',
    department: 'MKT',
    status: 'idle',
    currentTask: '待命，等待设计任务',
    lastReport: {
      title: '完成设计组岗位说明',
      time: '2026-03-30 18:00',
      summary: '创建首席设计师岗位说明，2245字节'
    }
  },
  {
    id: 'SAL-02-01',
    name: '02-获客',
    title: '获客组-首席获客官',
    department: 'SAL',
    status: 'idle',
    currentTask: '待命，等待获客任务',
    lastReport: {
      title: '完成获客组岗位说明',
      time: '2026-03-30 18:00',
      summary: '创建首席获客官岗位说明，1440字节'
    }
  },
  {
    id: 'SAL-03-02',
    name: '03-客服',
    title: '客服组-首席客服官',
    department: 'SAL',
    status: 'idle',
    currentTask: '待命，等待客服任务',
    lastReport: {
      title: '完成客服组岗位说明',
      time: '2026-03-30 18:00',
      summary: '创建首席客服官岗位说明，1623字节'
    }
  },
  {
    id: 'DEL-04-01',
    name: '04-方案',
    title: '方案组-首席方案官',
    department: 'DEL',
    status: 'idle',
    currentTask: '待命，等待方案任务',
    lastReport: {
      title: '完成方案组岗位说明',
      time: '2026-03-30 18:00',
      summary: '创建首席方案官岗位说明，1995字节'
    }
  },
  {
    id: 'DEL-05-02',
    name: '05-管项',
    title: '项目组-首席项目官',
    department: 'DEL',
    status: 'idle',
    currentTask: '待命，等待项目任务',
    lastReport: {
      title: '完成项目组岗位说明',
      time: '2026-03-30 18:00',
      summary: '创建首席项目官岗位说明，1511字节'
    }
  },
  {
    id: 'IT-01-01',
    name: '01-架构',
    title: '全栈组-首席架构师',
    department: 'IT',
    status: 'busy',
    currentTask: '开发虚拟办公室3D看板',
    lastReport: {
      title: '启动虚拟办公室项目',
      time: '2026-03-31 00:15',
      summary: '开始搭建虚拟办公室3D可视化看板项目'
    }
  },
  {
    id: 'IT-01-02',
    name: '02-安全',
    title: '安全组-首席安全官',
    department: 'IT',
    status: 'working',
    currentTask: '网络安全检查与修复',
    lastReport: {
      title: '完成网络安全检查',
      time: '2026-03-30 23:50',
      summary: '本机网络安全状况良好，发现5个高风险端口需处理'
    }
  },
  {
    id: 'IT-01-03',
    name: '03-情报',
    title: '情报组-首席情报官',
    department: 'IT',
    status: 'working',
    currentTask: '收集市场情报',
    lastReport: {
      title: '完成市场情报简报',
      time: '2026-03-30 23:40',
      summary: '2026年创业服务市场规模1450亿元，纳灵差异化机会明确'
    }
  },
  {
    id: 'FIN-05',
    name: '06-财账',
    title: '财账组-首席财务官',
    department: 'FIN',
    status: 'offline',
    currentTask: '待命，等待财务任务',
    lastReport: {
      title: '完成财务部岗位说明',
      time: '2026-03-30 18:00',
      summary: '创建首席财务官岗位说明，1719字节'
    }
  },
  {
    id: 'OPR-06-01',
    name: '07-行政',
    title: '综合组-首席行政官',
    department: 'OPR',
    status: 'idle',
    currentTask: '待命，等待运营任务',
    lastReport: {
      title: '完成运营部岗位说明',
      time: '2026-03-30 18:00',
      summary: '创建首席行政官岗位说明，2988字节'
    }
  }
]

// ============ 布局配置 ============
// 定义组织架构的层级和位置
// id: 部门代码 (对应 departments 和 members 中的 department)
// level: 层级 (0 = 最高层)
// x: X轴位置
// y: Y轴位置（层级高度）

export const orgLayout = [
  { id: 'CEO', level: 0, x: 0, y: 8 },
  { id: 'COO', level: 1, x: 0, y: 5 },
  { id: 'MKT', level: 2, x: -2, y: 2 },
  { id: 'SAL', level: 2, x: 2, y: 2 },
  { id: 'DEL', level: 3, x: -3, y: -1 },
  { id: 'IT', level: 3, x: 3, y: -1 },
  { id: 'FIN', level: 4, x: -4, y: -4 },
  { id: 'OPR', level: 4, x: 4, y: -4 }
]

// 部门间连接线定义
export const connections = [
  { from: 'CEO', to: 'COO' },
  { from: 'COO', to: 'MKT' },
  { from: 'COO', to: 'SAL' },
  { from: 'MKT', to: 'DEL' },
  { from: 'SAL', to: 'IT' },
  { from: 'DEL', to: 'FIN' },
  { from: 'IT', to: 'OPR' }
]

// ============ 颜色主题 ============
export const theme = {
  // 状态颜色
  statusColors: {
    working: '#22c55e',
    idle: '#eab308',
    busy: '#ef4444',
    offline: '#71717a'
  },
  // UI 颜色
  ui: {
    background: '#0a0a0f',
    accent: '#8b5cf6',
    text: '#fafafa',
    textSecondary: '#a1a1aa',
    border: 'rgba(113, 113, 122, 0.3)'
  }
}
