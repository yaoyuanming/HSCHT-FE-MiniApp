import request, {
	uploadFile
} from '@/utils/request'


// 获取项目列表
export const getPorjectList = (params) => request('get', '/hospital/consumptionRecord/client/list', params)


// 获取套餐列表
export const MyPorjectList = (params) => request('get', '/hospital/enterprise/package/list', params)

// 获取套餐详情
export const getPorjectInfo = (params) => request('get', '/hospital/enterprise/package/' + params)


// 查询项目详情
export const PorjectInfo = (params) => request('get', '/hospital/enterprise/project/' + params)


// 获取排班预约
export const ShiftScheduling = (params) => request('get', '/hospital/enterprise/schedule/by-project-id/' + params)

// 客户预约
export const getUserReservation = (data) => request('post', '/hospital/reservation/client', data)