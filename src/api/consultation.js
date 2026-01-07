import request from '@/utils/request'

// 新增咨询 (创建新对话)
export const addConsultation = (data) => {
  return request('post', '/services/consultation', data)
}

// 新增咨询消息 (发送消息)
export const addConsultationMessage = (data) => {
  return request('post', '/services/consultationMessage', data)
}

// 查询咨询对话列表
export const getConsultationMessageList = (params) => {
  return request('get', '/services/consultationMessage/list', params)
}

// 查询用户咨询列表
export const getUserConsultationList = (params) => {
  return request('get', '/services/consultation/list', params)
}
