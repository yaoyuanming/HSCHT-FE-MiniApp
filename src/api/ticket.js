import request from '@/utils/request'

// 提交工单
export const submitTicket = (data) => {
  return request('post', '/services/ticket', data)
}

// 获取工单列表
export const getTicketList = (params) => {
  return request('get', '/services/ticket/list', params)
}

// 获取工单详情
export const getTicketDetail = (id) => {
  return request('get', `/services/ticket/${id}`)
}

// 获取工单日志列表
export const getTicketActivityLogList = (id) => {
  // Add timestamp to prevent caching
  return request('get', `/services/activityLog/getLogInfo/${id}`, { _t: Date.now() })
}

// 新增工单日志（回复）
export const addTicketActivityLog = (data) => {
  return request('post', '/services/activityLog', data)
}
