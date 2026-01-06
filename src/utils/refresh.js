// 下拉刷新工具函数

// 通用下拉刷新处理
export function handlePullDownRefresh(callback, delay = 1000) {
  return new Promise((resolve) => {
    // 显示刷新动画
    uni.showNavigationBarLoading()
    
    // 执行刷新回调
    if (typeof callback === 'function') {
      callback()
    }
    
    // 延迟停止刷新动画
    setTimeout(() => {
      uni.hideNavigationBarLoading()
      uni.stopPullDownRefresh()
      resolve()
    }, delay)
  })
}

// 带错误处理的下拉刷新
export async function handlePullDownRefreshWithError(callback, delay = 1000) {
  try {
    await handlePullDownRefresh(callback, delay)
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    })
  } catch (error) {
    console.error('下拉刷新失败:', error)
    uni.hideNavigationBarLoading()
    uni.stopPullDownRefresh()
    uni.showToast({
      title: '刷新失败，请重试',
      icon: 'error',
      duration: 2000
    })
  }
}

// 页面下拉刷新事件处理
export function onPullDownRefresh(callback, delay = 1000) {
  return () => {
    handlePullDownRefreshWithError(callback, delay)
  }
}

// 模拟数据刷新（用于演示）
export function mockRefreshData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('模拟数据刷新完成')
      resolve()
    }, 800)
  })
}

// 聊天页面专用刷新
export function refreshChatData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('聊天数据刷新完成')
      // 这里可以重新获取聊天记录
      resolve()
    }, 600)
  })
}

// 模板页面专用刷新
export function refreshTemplateData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('模板数据刷新完成')
      // 这里可以重新获取模板列表
      resolve()
    }, 500)
  })
}

// 用户信息刷新
export function refreshUserInfo() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('用户信息刷新完成')
      // 这里可以重新获取用户信息
      resolve()
    }, 400)
  })
} 