// 默认布局配置
// 定义组织架构和部门结构

import { Department } from '../adapters/types'

/** 空间布局类型 */
export type LayoutType = 'org-tree' | 'grid' | 'circle' | 'custom'

/** 布局配置 */
export interface LayoutConfig {
  /** 布局类型 */
  type: LayoutType
  /** 层级间距 */
  levelSpacing: number
  /** 成员间距 */
  memberSpacing: number
  /** 会议室数量 */
  meetingRoomCount: number
  /** 是否显示连接线 */
  showConnections: boolean
  /** 是否显示部门标签 */
  showDepartmentLabels: boolean
  /** 是否显示脚底光环 */
  showFloorGlow: boolean
}

/** 默认布局配置 */
export const defaultLayoutConfig: LayoutConfig = {
  type: 'org-tree',
  levelSpacing: 3,
  memberSpacing: 1.8,
  meetingRoomCount: 3,
  showConnections: true,
  showDepartmentLabels: true,
  showFloorGlow: true
}

/** 部门层级定义 */
export interface DepartmentLevel {
  id: string
  name: string
  icon: string
  color: string
  y: number  // Y轴位置
  members: number  // 该层级的成员数量
}

/** 默认部门层级 */
export const defaultDepartmentLevels: DepartmentLevel[] = [
  { id: 'CEO', name: '总裁', icon: '👔', color: '#f59e0b', y: 8, members: 1 },
  { id: 'COO', name: '运营', icon: '🎯', color: '#3b82f6', y: 5, members: 1 },
  { id: 'MKT', name: '市场', icon: '📢', color: '#10b981', y: 2, members: 1 },
  { id: 'SAL', name: '销售', icon: '💰', color: '#8b5cf6', y: 2, members: 1 },
  { id: 'DEL', name: '交付', icon: '🚀', color: '#06b6d4', y: -1, members: 1 },
  { id: 'IT', name: '技术', icon: '💻', color: '#ec4899', y: -1, members: 1 },
  { id: 'FIN', name: '财务', icon: '📊', color: '#f97316', y: -4, members: 1 },
  { id: 'OPR', name: '运营', icon: '⚙️', color: '#84cc16', y: -4, members: 1 },
]

/** 连接线定义 */
export interface Connection {
  from: string
  to: string
}

export const defaultConnections: Connection[] = [
  { from: 'CEO', to: 'COO' },
  { from: 'COO', to: 'MKT' },
  { from: 'COO', to: 'SAL' },
  { from: 'MKT', to: 'DEL' },
  { from: 'SAL', to: 'IT' },
  { from: 'DEL', to: 'FIN' },
  { from: 'IT', to: 'OPR' },
]

/** 部门配置映射 */
export const defaultDepartments: Record<string, Department> = {
  'CEO': { id: 'CEO', name: '总裁办', icon: '👔', color: '#f59e0b' },
  'COO': { id: 'COO', name: '运营部', icon: '🎯', color: '#3b82f6' },
  'MKT': { id: 'MKT', name: '市场部', icon: '📢', color: '#10b981' },
  'SAL': { id: 'SAL', name: '销售部', icon: '💰', color: '#8b5cf6' },
  'DEL': { id: 'DEL', name: '交付部', icon: '🚀', color: '#06b6d4' },
  'IT': { id: 'IT', name: '技术部', icon: '💻', color: '#ec4899' },
  'FIN': { id: 'FIN', name: '财务部', icon: '📊', color: '#f97316' },
  'OPR': { id: 'OPR', name: '运维部', icon: '⚙️', color: '#84cc16' },
}
