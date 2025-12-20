import request from '@/utils/request'

// 获取服务类型列表
export const getServiceTypeList = (params) => {
  return request('get', '/services/type/list', params)
}

// 获取服务文章列表
export const getServiceArticleList = (params) => {
  return request('get', '/services/article/list', params)
}

// 获取服务文章详情
export const getServiceArticleDetail = (id) => {
  return request('get', `/services/article/${id}`)
}
