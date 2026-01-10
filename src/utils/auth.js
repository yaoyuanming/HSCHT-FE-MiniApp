import {
	authLogin
} from '@/api/user'
import store from '@/store/index'
import { utilsConfig } from '@/config/utils'

/**
 * 完整的登录流程：wx.login + 登录接口 + 获取用户信息
 * @returns {Promise<boolean>} 整个流程是否成功
 */
export const completeLoginFlow = async () => {
	try {
		console.log('开始完整登录流程...')

		// 使用 wx.login 获取 code
		const loginResult = await new Promise((resolve, reject) => {
			uni.login({
				provider: 'weixin',
				success: (res) => {
					console.log('wx.login 成功，获取到code:', res.code)
					resolve(res.code)
				},
				fail: (err) => {
					console.error('wx.login 失败:', err)
					reject(new Error('获取登录凭证失败'))
				}
			})
		})

		if (!loginResult) {
			throw new Error('获取登录凭证失败')
		}

		// 调用登录接口
		const loginParams = {
			appId: utilsConfig.appid,
			xcxCode: loginResult,
			code: loginResult,
			tenantId: utilsConfig.tenantId,
			clientId: utilsConfig.clientId,
			grantType: 'xcx',
			// 兼容 snake_case 参数，防止后端解析失败
			grant_type: 'xcx',
			client_id: utilsConfig.clientId,
			tenant_id: utilsConfig.tenantId
		}

		console.log('调用登录接口 params:', loginParams)
		const response = await authLogin(loginParams)
		console.log('登录接口响应:', response)

		if (response.code === 200 && response.data) {
			const {
				access_token,
				openid,
				expire_in,
				client_id
			} = response.data
			
			// 存储token和基本信息
			store.dispatch('setToken', access_token)
			
			uni.setStorageSync('userInfo', {
				openid,
				clientId: client_id,
				expireIn: expire_in,
				loginTime: Date.now()
			})
			uni.setStorageSync('openId', openid)

			console.log('登录成功，开始获取用户信息...')

			// 获取用户详细信息
			await store.dispatch('fetchUserProfile')

			console.log('完整登录流程成功')
			return true
		} else {
			throw new Error(response.msg || '登录失败')
		}
	} catch (error) {
		console.error('完整登录流程失败:', error)
		return false
	}
}
