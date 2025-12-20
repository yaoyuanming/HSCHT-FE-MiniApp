// src/api/user.js
import request from '@/utils/request'

// 获取国家列表
export const getCountryList = () => {
	return request('get', '/services/country/list')
}
