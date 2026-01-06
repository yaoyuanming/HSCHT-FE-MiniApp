import request from '@/utils/request'

/**
 * 获取会话历史消息
 * GET /unified/unified/message/history/{sessionId}
 * @param sessionId 会话ID
 * @param limit 限制数量，默认50
 * @returns Promise<any>
 */
export default function getMessageHistory(sessionId, limit = 50) {
  return request('get', `/unified/unified/message/history/${sessionId}`, {
    limit
  })
}
