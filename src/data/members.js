// 纳灵数字企业 - 成员数据
// 版本: v0.1.0 | 更新: 2026-03-31

export const departments = {
  CEO: {
    id: 'CEO',
    name: '首席执行官',
    color: '#FFD700',
    icon: '👑'
  },
  COO: {
    id: 'COO',
    name: '首席运营官',
    color: '#3B82F6',
    icon: '⚡'
  },
  MKT: {
    id: 'MKT',
    name: '市场部',
    color: '#FF6B6B',
    icon: '📢'
  },
  SAL: {
    id: 'SAL',
    name: '销售部',
    color: '#10B981',
    icon: '💰'
  },
  DEL: {
    id: 'DEL',
    name: '交付部',
    color: '#8B5CF6',
    icon: '🎯'
  },
  IT: {
    id: 'IT',
    name: '信息部',
    color: '#06B6D4',
    icon: '💻'
  },
  FIN: {
    id: 'FIN',
    name: '财务部',
    color: '#F59E0B',
    icon: '📊'
  },
  OPR: {
    id: 'OPR',
    name: '运营部',
    color: '#EC4899',
    icon: '📋'
  }
}

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
    },
    position: { x: -4, y: 0, z: 2 }
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
    },
    position: { x: -2, y: 0, z: 2 }
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
    },
    position: { x: 0, y: 0, z: 0 }
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
    },
    position: { x: 1, y: 0, z: 0 }
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
    },
    position: { x: 2, y: 0, z: 0 }
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
    },
    position: { x: 3, y: 0, z: 0 }
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
    },
    position: { x: -1, y: 0, z: -2 }
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
    },
    position: { x: 0, y: 0, z: -2 }
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
    },
    position: { x: 1, y: 0, z: -2 }
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
    },
    position: { x: 2, y: 0, z: -2 }
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
    },
    position: { x: 3, y: 0, z: -2 }
  },
  {
    id: 'FIN-05',
    name: '06-财账',
    title: '财账组-首席财务官',
    department: 'FIN',
    status: 'idle',
    currentTask: '待命，等待财务任务',
    lastReport: {
      title: '完成财务部岗位说明',
      time: '2026-03-30 18:00',
      summary: '创建首席财务官岗位说明，1719字节'
    },
    position: { x: 2, y: 0, z: -4 }
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
    },
    position: { x: 3, y: 0, z: -4 }
  }
]

// 获取所有报告（按时间倒序）
export const getAllReports = (memberList = members) => {
  return memberList
    .filter(m => m.lastReport)
    .map(m => ({
      ...m.lastReport,
      memberId: m.id,
      memberName: m.name,
      memberTitle: m.title,
      department: m.department,
      status: m.status
    }))
    .sort((a, b) => new Date(b.time) - new Date(a.time))
}

// 按部门分组
export const getMembersByDepartment = (departmentId) => {
  return members.filter(m => m.department === departmentId)
}
