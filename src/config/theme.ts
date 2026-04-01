// 默认主题配置
// 用户可以覆盖这些配置来自定义外观

export interface ThemeConfig {
  /** 主色调 */
  accentColor: string
  /** 背景色 */
  backgroundColor: string
  /** 文字主色 */
  textColor: string
  /** 文字次色 */
  textSecondaryColor: string
  /** 边框色 */
  borderColor: string
  /** 面板背景色 */
  panelColor: string
  /** 成功色 */
  successColor: string
  /** 警告色 */
  warningColor: string
  /** 错误色 */
  errorColor: string
  /** 信息色 */
  infoColor: string
}

export const defaultTheme: ThemeConfig = {
  accentColor: '#8b5cf6',
  backgroundColor: '#0a0a0f',
  textColor: '#fafafa',
  textSecondaryColor: '#a1a1aa',
  borderColor: 'rgba(113, 113, 122, 0.3)',
  panelColor: 'rgba(18, 18, 23, 0.98)',
  successColor: '#22c55e',
  warningColor: '#f59e0b',
  errorColor: '#ef4444',
  infoColor: '#3b82f6'
}

// CSS 变量名称
export const CSS_VARIABLES = {
  '--color-accent': 'accentColor',
  '--color-bg': 'backgroundColor',
  '--color-text': 'textColor',
  '--color-text-secondary': 'textSecondaryColor',
  '--color-border': 'borderColor',
  '--color-panel': 'panelColor',
  '--color-success': 'successColor',
  '--color-warning': 'warningColor',
  '--color-error': 'errorColor',
  '--color-info': 'infoColor'
} as const
