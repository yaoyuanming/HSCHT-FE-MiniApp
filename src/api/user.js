import request from '@/utils/request'

// 登录接口
export const authLogin = (data) => request('post', '/auth/login', data)

// 获取个人信息接口
export const getUserProfile = () => request('get', '/system/user/profile')

// 手机号解密 (可选)
export const DecryptionMobilePhone = (data) => {
	return request('post', 'auth/Wx/decryptPhoneNumber', data)
}

// 微信支付
export const weixinPlay = (data) => request('post', '/billing/pay/wx/jsapi', data)

// 获取用户余额信息
export const getObtainUserBalance = (params) => {
	return request('get', '/billing/balance/userAccountInfo/getOwnBalanceAccountInfo')
}
// 客户消费记录
export const UserConsumptionRecord = (data) => {
	return request('post', '/hospital/consumptionRecord/client', data)
}


// 用户余额支付
export const UserBalancePayment = (data) => {
	return request('post', '/billing/balance/userAccountInfo/balancePayment', data)
}

// 个人套餐退款
export const UserProjectReuund = (data) => {
	return request('post', '/hospital/consumptionRecord/client/refund', data)
}