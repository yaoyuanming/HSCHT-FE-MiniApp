import request from '@/utils/request'

/**
 * AI会话创建参数
 * （原 CreateSessionRequest DTO，仅做说明，不在此处做 TS 类型定义）
 * - name?: string;          会话名称
 * - isTemporary?: number;   是否为临时会话 0 否 1 是
 * - provider?: string;      AI厂商
 * - model?: string;         模型
 * - systemPrompt?: string;  系统提示词
 */

/**
 * 创建会话
 * POST /unified/unified/session/createSession
 * @param data 会话创建参数
 * @returns Promise<any>
 */
export function createSession(data) {
  return request('post', '/unified/unified/session/createSession', data)
}

/**
 * 删除会话
 * DELETE /unified/unified/session/{sessionId}
 * @param sessionId 会话ID
 * @returns Promise<any>
 */
export function deleteSession(sessionId) {
  return request('delete', `/unified/unified/session/${sessionId}`)
}

/**
 * 获取用户会话列表
 * GET /unified/unified/session/getUserSessionList
 * @returns Promise<any>
 */
export function getUserSessionList() {
  return request('get', '/unified/unified/session/getUserSessionList')
}

/**
 * 根据会话ID获取会话信息
 * GET /unified/unified/session/{sessionId}
 * @param sessionId 会话ID
 * @returns Promise<any>
 */
export function getSessionInfo(sessionId) {
  return request('get', `/unified/unified/session/${sessionId}`)
}
