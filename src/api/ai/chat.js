import request from '@/utils/request'
import { utilsConfig } from '@/config/utils'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getHeaders = () => {
  const token = uni.getStorageSync('token');
  const headers = {
    'Content-Type': 'application/json',
    'clientid': utilsConfig.clientId,
    'tenant-id': utilsConfig.tenantId
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
};

/**
 * 获取所有可用模型
 * GET /unified/ai/models
 * 返回按厂商分组的模型列表
 * @returns Promise<any>
 */
export function getAvailableModels() {
  return request('get', '/unified/ai/models', {}, {
      header: getHeaders()
  })
}

/**
 * 获取所有AI厂商状态
 * GET /unified/ai/providers
 * @returns Promise<any>
 */
export function getProviders() {
  return request('get', '/unified/ai/providers', {}, {
      header: getHeaders()
  })
}

/**
 * 健康检查
 * GET /unified/ai/health
 * @returns Promise<any>
 */
export function getHealth() {
  return request('get', '/unified/ai/health', {}, {
      header: getHeaders()
  })
}

/**
 * 统一AI同步对话
 * POST /unified/ai/chat/sync
 * @param data
 * @returns Promise<any>
 */
export function sendAIChatSync(data) {
  return request('post', '/unified/ai/chat/sync', data, {
      header: getHeaders()
  })
}

// 流式对话函数 (模拟 SSE 客户端行为)
export const sendAIChatStreaming = (data, onChunk, onComplete, onError) => {
    let buffer = '';
    let hasReceivedChunks = false;

    // SSE 数据处理逻辑
    const processChunk = (chunkData) => {
        let chunk = '';
        if (typeof chunkData === 'string') {
            chunk = chunkData;
        } else {
            // ArrayBuffer 处理
            const uint8Array = new Uint8Array(chunkData);
            try {
                if (typeof TextDecoder !== 'undefined') {
                     chunk = new TextDecoder('utf-8').decode(uint8Array, { stream: true });
                } else {
                     chunk = String.fromCharCode.apply(null, uint8Array);
                     chunk = decodeURIComponent(escape(chunk)); 
                }
            } catch (e) {
                 chunk = String.fromCharCode.apply(null, uint8Array);
            }
        }
        
        buffer += chunk;
        
        // 尝试按双换行分割 (标准 SSE 消息分隔符，兼容 \r\n)
        // 使用正则匹配连续的换行符
        const lines = buffer.split(/\r?\n\r?\n/);
        // 保留最后一个可能未完成的块
        buffer = lines.pop();
        
        for (const block of lines) {
            if (!block.trim()) continue;
            //打印结果输出的结果
            // console.log('Processing SSE Line:', block);

            const rawLines = block.split(/\r?\n/);
            let event = null;
            const dataLines = [];

            for (const rawLine of rawLines) {
                if (!rawLine) continue;
                const line = rawLine.startsWith(' ') ? rawLine.slice(1) : rawLine;

                if (line.startsWith('event:')) {
                    event = line.slice('event:'.length).trim();
                    continue;
                }

                if (line.startsWith('data:')) {
                    let value = line.slice('data:'.length);
                    if (value.startsWith(' ')) value = value.slice(1);
                    dataLines.push(value);
                }
            }

            const dataStr = dataLines.join('\n');
            if (!event && dataLines.length === 0) continue;

            if (dataLines.length > 0) {
                try {
                    const dataObj = JSON.parse(dataStr);
                    if (event) dataObj.event = event;
                    onChunk && onChunk(dataObj);
                } catch (e) {
                    onChunk && onChunk({
                        event: event,
                        data: dataStr
                    });
                }
            } else {
                onChunk && onChunk({ event });
            }
        }
    };

    const requestTask = uni.request({
        url: `${BASE_URL}/unified/ai/chat/stream`,
        method: 'POST',
        header: getHeaders(),
        data: {
            message: data.query || data.message,
            sessionId: data.conversation_id || data.sessionId || '',
            provider: data.provider,
            model: data.model,
            systemPrompt: data.systemPrompt,
            stream: true
        },
        enableChunked: true, // 开启流式传输
        responseType: 'arraybuffer', // 明确指定返回 ArrayBuffer，兼容性更好
        timeout: 120000, // 设置超时时间为 10 分钟
        success: (res) => {
            // 请求完成
            if (res.statusCode !== 200) {
                 onError && onError(res);
                 return;
            }
            
            // 如果没有收到过 chunk (例如 H5 端或不支持 chunk 的环境)，尝试解析 res.data
            if (!hasReceivedChunks && res.data) {
                // console.log('Fallback to full response parsing', typeof res.data);
                processChunk(res.data);
                
                // 处理 buffer 中剩余的内容 (如果最后没有 \n\n)
                if (buffer && buffer.trim()) {
                    processChunk(buffer + '\n\n');
                    buffer = '';
                }
            }
            
            onComplete && onComplete();
        },
        fail: (err) => {
            onError && onError(err);
        }
    });

    // 处理 SSE 数据流
    requestTask.onChunkReceived((res) => {
        hasReceivedChunks = true;
        processChunk(res.data);
    });
    
    return requestTask;
}
