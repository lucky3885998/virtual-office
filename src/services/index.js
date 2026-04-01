/**
 * 服务层统一导出
 * 
 * 本目录包含业务逻辑服务：
 * - OrgService: 组织数据管理
 * 
 * 原则：
 * - 服务层负责数据管理
 * - Store 负责 UI 状态
 * - 组件可以同时使用两者
 */

export { orgService } from './OrgService'
export { localAdapter } from '../adapters/DataAdapter'
