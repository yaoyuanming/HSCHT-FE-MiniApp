import request from '@/utils/request'

// 查询活动列表
export const getActivityList = (params) => {
  return request('get', '/services/activity/list', params)
}

// 获取活动详细信息
export const getActivityDetail = (id) => {
  return request('get', `/services/activity/${id}`)
}
