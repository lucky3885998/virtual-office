import React, { useState } from 'react'
import useOfficeStore from '../../stores/officeStore'
import { departments } from '../../data/members'
import ReportDetail from './ReportDetail'

function WorkReportPanel() {
  const reports = useOfficeStore(state => state.reports)
  const { selectMember } = useOfficeStore()
  const [selectedReport, setSelectedReport] = useState(null)
  
  const statusColors = {
    working: 'var(--color-success)',
    idle: 'var(--color-warning)',
    busy: 'var(--color-danger)',
    offline: 'var(--color-text-tertiary)'
  }
  
  const handleCardClick = (e, report) => {
    e.stopPropagation()
    setSelectedReport(report)
  }
  
  const handleMemberClick = (e, memberId) => {
    const rect = e.currentTarget.getBoundingClientRect()
    selectMember(memberId, { x: rect.left, y: rect.top })
  }
  
  return (
    <>
      <div className="report-panel">
        <div className="report-panel-header">
          <div className="report-panel-title">
            <span>📋</span>
            <span>工作简报</span>
            <span className="report-panel-count">· {reports.length} 条动态</span>
          </div>
        </div>
        
        <div className="report-list">
          {reports.slice(0, 12).map((report, index) => (
            <div 
              key={`${report.memberId}-${index}`}
              className="report-card"
              onClick={(e) => handleCardClick(e, report)}
              style={{ cursor: 'pointer' }}
            >
              <div className="report-card-header">
                <div className="report-card-member">
                  <span 
                    className="report-card-status" 
                    style={{ background: statusColors[report.status] }}
                  ></span>
                  <span className="report-card-name">{report.memberName}</span>
                  <span className="report-card-dept">{departments[report.department]?.icon}</span>
                </div>
                <span className="report-card-time">
                  {report.time.split(' ')[1] || report.time}
                </span>
              </div>
              <div className="report-card-title">{report.title}</div>
              <div className="report-card-summary">{report.summary}</div>
            </div>
          ))}
          
          {reports.length === 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              color: 'var(--color-text-tertiary)',
              fontSize: '13px'
            }}>
              暂无工作简报
            </div>
          )}
        </div>
      </div>
      
      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetail 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </>
  )
}

export default WorkReportPanel
