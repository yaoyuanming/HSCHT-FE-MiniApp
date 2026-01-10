import request from '@/utils/request'

// 首页管理
export const HomeConfig = () => request('get', '/master/home/my')

