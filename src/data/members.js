/**
 * 成员数据模块
 * 
 * 数据来源：members.config.js（配置驱动）
 * 
 * 本模块负责：
 * 1. 从配置加载数据
 * 2. 计算成员在空间中的位置
 * 3. 提供查询接口
 */

import { departments, members as configMembers, orgLayout, connections, theme } from './members.config'

// ============ 成员位置计算 ============

// 计算成员在3D空间中的位置
const calculateMemberPosition = (member, deptLayout, deptMembers, memberIndex) => {
  const dept = deptLayout.find(d => d.id === member.department)
  if (!dept) return { x: 0, y: 0, z: 0 }
  
  // 同一部门的成员横向排列
  const spacing = 1.8
  const offsetX = (deptMembers.length - 1) * spacing / 2
  
  return {
    x: memberIndex * spacing - offsetX,
    y: dept.y,
    z: 0
  }
}

// 处理成员数据，添加位置信息
const processedMembers = configMembers.map((member, index) => {
  const deptMembers = configMembers.filter(m => m.department === member.department)
  const memberIndex = deptMembers.indexOf(member)
  const position = calculateMemberPosition(member, orgLayout, deptMembers, memberIndex)
  
  return {
    ...member,
    position
  }
})

// ============ 导出处理后的数据 ============

export { departments, processedMembers as members, orgLayout, connections, theme }

// ============ 辅助函数 ============

/**
 * 获取所有报告（按时间倒序）
 */
export const getAllReports = (memberList = processedMembers) => {
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

/**
 * 按部门获取成员
 */
export const getMembersByDepartment = (departmentId) => {
  return processedMembers.filter(m => m.department === departmentId)
}

/**
 * 获取单个成员
 */
export const getMember = (memberId) => {
  return processedMembers.find(m => m.id === memberId)
}

/**
 * 获取组织统计数据
 */
export const getOrgStats = () => {
  const total = processedMembers.length
  const byStatus = {
    working: processedMembers.filter(m => m.status === 'working').length,
    idle: processedMembers.filter(m => m.status === 'idle').length,
    busy: processedMembers.filter(m => m.status === 'busy').length,
    offline: processedMembers.filter(m => m.status === 'offline').length
  }
  const byDepartment = {}
  
  Object.keys(departments).forEach(deptId => {
    byDepartment[deptId] = processedMembers.filter(m => m.department === deptId).length
  })
  
  return { total, byStatus, byDepartment }
}
