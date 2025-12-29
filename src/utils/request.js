// src/utils/request.js
import Request from 'luch-request'
import { utilsConfig } from '@/config/utils'

const http = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 600000,
  header: {
    'Content-Type': 'application/json'
  }
})

// 是否正在刷新token的标记
let isRefreshing = false
// 重试队列
let requests = []

// 清除登录信息
const clearLoginInfo = () => {
    try {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('userId')
        uni.removeStorageSync('openId')
    } catch (e) { console.error('Clear login info failed', e) }
}

// 构造登录参数
const getLoginParams = (code) => ({
    appid: utilsConfig.appid,
    xcxCode: code,
    code: code,
    tenantId: utilsConfig.tenantId,
    clientId: utilsConfig.clientId,
    grantType: 'xcx',
    grant_type: 'xcx',
    client_id: utilsConfig.clientId,
    tenant_id: utilsConfig.tenantId
})

// 请求拦截器
http.interceptors.request.use(config => {
  // 添加通用头信息
  if (utilsConfig) {
      if (utilsConfig.clientId) config.header.clientid = utilsConfig.clientId
      if (utilsConfig.tenantId) config.header['tenant-id'] = utilsConfig.tenantId
  }
  
  // 添加 token (非登录接口)
  if (!config.url?.includes('/auth/login')) {
    const token = uni.getStorageSync('token')
    if (token) {
      config.header.Authorization = 'Bearer ' + token
    }
  }
  return config
}, error => Promise.reject(error))

// 响应拦截器
http.interceptors.response.use(async response => {
  const { code, msg } = response.data || {}
  
  // 正常响应
  if (code === 0 || code === 200) {
    return response.data
  } 
  
  // Token过期或无效处理
  if (code === 401 || (code === 3 && msg && /token/i.test(msg))) {
      const config = response.config
      
      if (!isRefreshing) {
          isRefreshing = true
          try {
              const newToken = await doSilentLogin()
              isRefreshing = false
              
              // 执行队列中的请求
              requests.forEach(cb => cb(newToken))
              requests = []
              
              // 重试当前请求
              config.header.Authorization = 'Bearer ' + newToken
              return http.request(config)
          } catch (e) {
              console.error('无感刷新Token失败:', e)
              isRefreshing = false
              requests = []
              clearLoginInfo()
              uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
              return Promise.reject(response.data)
          }
      } else {
          return new Promise((resolve) => {
              requests.push((token) => {
                  config.header.Authorization = 'Bearer ' + token
                  resolve(http.request(config))
              })
          })
      }
  }
  
  // 其他错误处理
  if (msg) {
    console.warn('请求业务错误:', msg)
    if (msg.includes('user') && msg.includes('null')) {
        clearLoginInfo()
        console.log('检测到无效Token导致后端异常，已自动清除Token')
    }
  }
  return response.data 
}, error => {
  console.log('响应拦截器错误处理:', error)
  return Promise.reject(error)
})

// 执行静默登录
export function doSilentLogin() {
    return new Promise((resolve, reject) => {
        uni.login({
            provider: 'weixin',
            success: (res) => {
                if (!res.code) return reject(new Error('wx.login未获取到code'))
                
                uni.request({
                    url: (import.meta.env.VITE_API_BASE_URL) + '/auth/login',
                    method: 'POST',
                    data: getLoginParams(res.code),
                    header: {
                        'Content-Type': 'application/json',
                        'clientid': utilsConfig.clientId,
                        'tenant-id': utilsConfig.tenantId
                    },
                    success: (loginRes) => {
                        if (loginRes.data?.code === 200) {
                            const { access_token, openid, expire_in, client_id } = loginRes.data.data
                            uni.setStorageSync('token', access_token)
                            uni.setStorageSync('openId', openid)
                            uni.setStorageSync('userInfo', {
                                openid,
                                clientId: client_id,
                                expireIn: expire_in,
                                loginTime: Date.now()
                            })
                            console.log('无感刷新Token成功')
                            resolve(access_token)
                        } else {
                            reject(new Error(loginRes.data?.msg || '登录接口失败'))
                        }
                    },
                    fail: reject
                })
            },
            fail: reject
        })
    })
}

// 通用请求方法
export default function request(method, url, data = {}, config = {}) {
    if (method === 'get') {
      return http.get(url, { params: data, ...config })
    }
    return http[method](url, data, config)
}
