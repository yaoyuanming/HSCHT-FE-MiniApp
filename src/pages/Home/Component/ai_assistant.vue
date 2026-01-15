<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="nav-left" @click="goBack">
					<uni-icons type="arrow-left" size="24" color="#fff"></uni-icons>
				</view>
				<text class="nav-title">我要咨询</text>
				<view class="nav-right">
					<uni-icons type="help" size="24" color="#fff" style="margin-right: 15px;"></uni-icons>
					<uni-icons type="gear" size="24" color="#fff"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 聊天内容区域 -->
		<scroll-view 
			class="chat-content" 
			scroll-y 
			:scroll-top="scrollTop"
			:scroll-with-animation="false"
			:style="{ top: (statusBarHeight + 44) + 'px' }"
		>
			<view class="chat-padding">
				<view class="ai-notice">回答由AI生成，仅供参考</view>
				
				<!-- 消息列表 -->
				<view class="chat-message" :class="msg.role" v-for="(msg, index) in messages" :key="index">
					<view class="avatar" v-if="msg.role === 'assistant'">
						<image src="/static/ai.png" mode="scaleToFill" style="width: 30px; height: 30px; display: block;"></image>
					</view>
					<view class="message-bubble" :class="msg.role === 'user' ? 'user-bubble' : ''">
						<view v-if="msg.role === 'assistant' && !msg.content && msg.isLoading" class="loading-dots">
							<view class="dot"></view>
							<view class="dot"></view>
							<view class="dot"></view>
						</view>
						<text 
							v-else 
							class="message-text" 
							:class="msg.role === 'user' ? 'user-text' : ''" 
							user-select
						>{{ msg.content }}</text>
						
						<!-- 重新生成按钮 (仅针对最后一条助手消息且非流式传输中) -->
						<view 
							v-if="msg.role === 'assistant' && index === messages.length - 1 && !isStreaming && msg.content" 
							class="msg-actions"
						>
							<view class="action-btn" @click="regenerateAnswer(index)">
								<uni-icons type="refresh" size="14" color="#666"></uni-icons>
								<text class="action-text">重新回答</text>
							</view>
							<view class="action-btn" @click="copyText(msg.content)">
								<uni-icons type="paperclip" size="14" color="#666"></uni-icons>
								<text class="action-text">复制</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 垫高底部，防止被固定区域遮挡 -->
				<view style="height: 180rpx;"></view>
			</view>
		</scroll-view>

		<!-- 底部固定区域 -->
		<view class="fixed-bottom">
			<!-- 跳过对话按钮 -->
			<view class="skip-container">
				<view class="skip-btn" @click="handleSkip">
					<image src="/static/闪电.png" mode="aspectFit" style="width: 16px; height: 16px; margin-right: 5px;"></image>
					<text class="skip-text">转人工客服</text>
				</view>
			</view>

			<!-- 输入框区域 -->
			<view class="input-area">
				<view class="input-wrapper">
					<input 
						class="chat-input" 
						type="text" 
						placeholder="请输入您的问题..." 
						placeholder-style="color:#999" 
						v-model="inputText" 
						confirm-type="send" 
						@confirm="sendMessage" 
						:disabled="isStreaming"
					/>
				</view>
				<view 
					class="send-btn" 
					:class="{ 'disabled': !isStreaming && !inputText.trim() }"
					@click="handleSendOrStop"
				>
					<uni-icons v-if="isStreaming" type="circle-filled" size="20" color="#fff"></uni-icons>
					<uni-icons v-else type="paperplane-filled" size="20" color="#fff"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	// Updated to trigger rebuild and ensure no missing asset references
	import {
		ref,
		nextTick,
		onUnmounted
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';
	import { 
		createSession 
	} from '@/api/ai/session.js';
	import getMessageHistory from '@/api/ai/message.js';
	import { 
		getAvailableModels,
		sendAIChatStreaming 
	} from '@/api/ai/chat.js';

	const statusBarHeight = ref(20);
	const inputText = ref('');
	const messages = ref([]);
	const scrollTop = ref(0);
	const isStreaming = ref(false);
	const isResponseComplete = ref(false);

	const queryOptions = ref({});
	const sessionId = ref('');
	const currentTask = ref(null); // 当前请求任务
	const activeRequestId = ref(0);

	const systemPrompt = '你是一名专业的出海投资分析师，专门提供海外投资分析，市场调研，风险评估等专业服务。对标全懂出海-首页-出海分析师特性。';
	
	// 当前选中的模型提供方和模型ID
	const currentProvider = ref('');
	const currentModelId = ref('');

	// 打字机效果相关
	const typingQueue = ref([]);
	const isTyping = ref(false);
	let typingTimer = null;

	const checkAndUnlock = () => {
		if (isResponseComplete.value && typingQueue.value.length === 0) {
			isStreaming.value = false;
			currentTask.value = null;
			
			// 确保最后一条消息的loading状态结束
			if (messages.value.length > 0) {
				const lastMsg = messages.value[messages.value.length - 1];
				if (lastMsg.role === 'assistant') {
					lastMsg.isLoading = false;
				}
			}
		}
	};

	const handleResponseComplete = () => {
		isResponseComplete.value = true;
		
		// 检查是否可以直接解锁
		checkAndUnlock();
		
		// 兜底机制：如果打字机队列还在运行，设置一个强制结束的定时器
		// 防止因为某些未知的逻辑错误导致输入框一直无法解锁
		// 3秒后如果还没解锁，强制解锁
		setTimeout(() => {
			if (isStreaming.value) {
				// 如果队列里还有很多字，直接全部上屏
				if (typingQueue.value.length > 0) {
					const remaining = typingQueue.value.join('');
					const lastMsgIndex = messages.value.length - 1;
					if (messages.value[lastMsgIndex]) {
						messages.value[lastMsgIndex].content += remaining;
					}
					typingQueue.value = [];
				}
				
				// 强制停止
				stopCurrentTask();
			}
		}, 3000);
	};

	const processTypingQueue = (msgIndex) => {
		if (typingQueue.value.length === 0) {
			isTyping.value = false;
			checkAndUnlock();
			return;
		}

		// 保护机制：如果 msgIndex 越界（例如用户清空了会话），停止处理
		if (!messages.value[msgIndex]) {
			typingQueue.value = [];
			isTyping.value = false;
			checkAndUnlock();
			return;
		}

		isTyping.value = true;
		try {
			const char = typingQueue.value.shift();
			messages.value[msgIndex].content += char;
			scrollToBottom();
		} catch (e) {
			console.error('Typing error:', e);
			typingQueue.value = [];
			checkAndUnlock();
			return;
		}

		// 动态调整速度，避免队列堆积过长
		let delay = 30; // 基础速度 30ms/字
		if (typingQueue.value.length > 50) delay = 10;
		if (typingQueue.value.length > 100) delay = 5;

		typingTimer = setTimeout(() => {
			processTypingQueue(msgIndex);
		}, delay);
	};

	onLoad((options) => {
		const sysInfo = uni.getSystemInfoSync();
		statusBarHeight.value = sysInfo.statusBarHeight;
		queryOptions.value = options || {};
		
		initializeChat();
	});
	
	onUnmounted(() => {
		stopCurrentTask();
	});

	const goBack = () => {
		uni.navigateBack();
	};

	const handleNewChat = () => {
		if (isStreaming.value) return;
		sessionId.value = '';
		messages.value = [];
		createAndPersistSession();
	};

	const handleSkip = () => {
		let url = '/pages/Home/Component/artificial';
		const params = [];
		if (queryOptions.value.category) params.push(`category=${queryOptions.value.category}`);
		if (queryOptions.value.service) params.push(`service=${encodeURIComponent(queryOptions.value.service)}`);

		if (params.length > 0) {
			url += `?${params.join('&')}`;
		}

		uni.navigateTo({
			url: url
		});
	};
	
	const scrollToBottom = () => {
		// 使用 nextTick 确保视图更新后再滚动
		nextTick(() => {
			scrollTop.value = scrollTop.value + 10000;
		});
	};
	
	const loadDefaultModel = async () => {
		try {
			const res = await getAvailableModels();
			console.log('Model Response:', res);
			if (res && res.code === 200 && res.data) {
				let found = false;
				
				// Case 1: res.data is an Array (Flat list)
				if (Array.isArray(res.data)) {
					 // 优先查找 azure gpt-5.2-chat
					 const azureTarget = res.data.find(m => m.provider === 'azure' && m.modelId === 'gpt-5.2-chat');
					 if (azureTarget) {
						 currentProvider.value = azureTarget.provider;
						 currentModelId.value = azureTarget.modelId;
						 found = true;
					 }
					 
					 if (!found) {
						 // 其次查找 openai 模型
						 const openaiModel = res.data.find(m => m.enabled && m.provider === 'openai');
						 if (openaiModel) {
							 currentProvider.value = openaiModel.provider;
							 currentModelId.value = openaiModel.modelId;
							 found = true;
						 } else {
							 const enabled = res.data.find(m => m.enabled);
							 if (enabled) {
								 currentProvider.value = enabled.provider;
								 currentModelId.value = enabled.modelId;
								 found = true;
							 } else if (res.data.length > 0) {
								 // Fallback to first item
								 currentProvider.value = res.data[0].provider;
								 currentModelId.value = res.data[0].modelId;
								 found = true;
							 }
						 }
					 }
				} 
				// Case 2: res.data is an Object (Grouped by provider)
				else if (typeof res.data === 'object') {
					// 1. 优先检查 azure 的 gpt-5.2-chat
					if (res.data['azure'] && Array.isArray(res.data['azure'])) {
						const targetModel = res.data['azure'].find(m => m.modelId === 'gpt-5.2-chat');
						if (targetModel) {
							currentProvider.value = targetModel.provider || 'azure';
							currentModelId.value = targetModel.modelId;
							found = true;
						}
					}

					// 2. 其次检查 openai
					if (!found && res.data['openai'] && Array.isArray(res.data['openai'])) {
						const openaiModel = res.data['openai'].find(m => m.enabled);
						if (openaiModel) {
							currentProvider.value = openaiModel.provider || 'openai';
							currentModelId.value = openaiModel.modelId;
							found = true;
						}
					}
					
					if (!found) {
						const providers = Object.keys(res.data);
						for (const p of providers) {
							const list = res.data[p];
							if (Array.isArray(list)) {
								const enabled = list.find(m => m.enabled);
								if (enabled) {
									currentProvider.value = enabled.provider || p;
									currentModelId.value = enabled.modelId;
									found = true;
									break;
								}
							}
						}
					}
				}
			}
		} catch (e) {
			console.error('加载模型失败:', e);
		}
		
		// Final Fallback if still empty (Default to OpenAI/GPT-3.5 or common default)
		if (!currentProvider.value || !currentModelId.value) {
			console.warn('Using hardcoded fallback model');
			currentProvider.value = 'openai'; 
			currentModelId.value = 'gpt-3.5-turbo';
		}
	};
	
	// 初始化聊天
	const initializeChat = async () => {
		await loadDefaultModel();
		
		const storedId = uni.getStorageSync('chat_session_id');
		if (storedId) {
			sessionId.value = storedId;
			// console.log('复用会话:', sessionId.value);
			try {
				const res = await getMessageHistory(sessionId.value, 20);
				if (res && res.code === 200 && res.data) {
					// 转换历史记录格式
					const history = res.data.map(item => {
						const msgs = [];
						if (item.userText) {
							msgs.push({ role: 'user', content: item.userText });
						}
						if (item.modelText) {
							msgs.push({ role: 'assistant', content: item.modelText });
						}
						return msgs;
					}).flat();
					
					if (history.length > 0) {
						messages.value = history;
						scrollToBottom();
					} else {
						showWelcomeMessage();
					}
				} else {
					showWelcomeMessage();
				}
			} catch (e) {
				console.error('获取历史记录失败:', e);
				// 如果获取历史失败，可能是会话过期，重新创建
				await createAndPersistSession();
			}
		} else {
			await createAndPersistSession();
		}
	};
	
	const createAndPersistSession = async () => {
		try {
			const res = await createSession({
				name: '智能咨询',
				isTemporary: 1,
				systemPrompt
			});
			if (res && res.code === 200 && res.data) {
				const newId = res.data.id || res.data.sessionId || res.data;
				sessionId.value = newId;
				uni.setStorageSync('chat_session_id', newId);
				console.log('新会话创建:', newId);
				showWelcomeMessage();
			}
		} catch (e) {
			console.error('创建会话失败:', e);
			messages.value.push({
				role: 'assistant',
				content: '抱歉，连接服务失败，请稍后重试。'
			});
		}
	};
	
	const showWelcomeMessage = () => {
		messages.value = [{
			role: 'assistant',
			content: '您好！我是智能咨询助手，很高兴为您服务。为了更好地帮助您，请告诉我您需要咨询哪方面的问题？'
		}];
	};
	
	const stopCurrentTask = () => {
		activeRequestId.value += 1;

		// 清理打字机队列
		typingQueue.value = [];
		if (typingTimer) {
			clearTimeout(typingTimer);
			typingTimer = null;
		}
		isTyping.value = false;

		if (currentTask.value) {
			try {
				currentTask.value.abort();
			} catch (e) {}
			currentTask.value = null;
		}
		
		// 强制解锁
		isStreaming.value = false;
		isResponseComplete.value = true;
		
		// 确保最后一条消息的loading状态结束
		if (messages.value.length > 0) {
			const lastMsg = messages.value[messages.value.length - 1];
			if (lastMsg.role === 'assistant') {
				lastMsg.isLoading = false;
			}
		}
	};
	
	const handleSendOrStop = () => {
		if (isStreaming.value) {
			// 如果正在流式传输，点击则停止
			stopCurrentTask();
		} else {
			// 否则发送消息
			sendMessage();
		}
	};

	const sendMessage = async () => {
		if (isStreaming.value || !inputText.value.trim()) return;
		
		const requestId = activeRequestId.value + 1;
		activeRequestId.value = requestId;

		isResponseComplete.value = false;
		const query = inputText.value.trim();
		inputText.value = '';
		
		// 添加用户消息
		messages.value.push({
			role: 'user',
			content: query
		});
		scrollToBottom();
		
		// 准备助手消息
		const assistantMsg = {
			role: 'assistant',
			content: '',
			isLoading: true
		};
		messages.value.push(assistantMsg);
		
		isStreaming.value = true;
		
		try {
			// 确保有会话ID
			if (!sessionId.value) {
				await createAndPersistSession();
				// 移除欢迎语，避免重复
				if (messages.value.length > 2 && messages.value[0].content.includes('您好')) {
					// 保持历史逻辑
				}
			}
			
			currentTask.value = sendAIChatStreaming(
				{
					query: query,
					conversation_id: sessionId.value,
					provider: currentProvider.value,
					model: currentModelId.value,
					systemPrompt
				},
				// onChunk
				(data) => {
					if (requestId !== activeRequestId.value) return;

					// console.log('Stream Chunk:', data);
					assistantMsg.isLoading = false;
					
					// 检查是否为完成事件
					if (data.event === 'complete' || data.status === 'COMPLETED' || (data.event === 'message' && data.data && data.data.status === 'COMPLETED')) {
						// console.log('收到完成事件，结束流');
						handleResponseComplete();
						
						// 如果队列为空，直接停止任务清理资源
						if (typingQueue.value.length === 0) {
							stopCurrentTask();
						}
						return;
					}
					
					let newContent = '';
					if (data.text) {
						newContent = data.text;
					} else if (data.content) {
						newContent = data.content;
					} else if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
						newContent = data.choices[0].delta.content;
					} else if (data.data && typeof data.data === 'string') {
						newContent = data.data;
					}
					
					// 检查 [DONE] 标记
					if (newContent === '[DONE]' || (typeof newContent === 'string' && newContent.includes('[DONE]'))) {
						handleResponseComplete();
						return;
					}
					
					// 过滤特殊标记
					if (newContent && newContent !== '...') {
						// assistantMsg.content += newContent;
						// 使用打字机效果
						const chars = newContent.split('');
						typingQueue.value.push(...chars);
						if (!isTyping.value) {
							processTypingQueue(messages.value.length - 1);
						}
					}
					
					// scrollToBottom(); // 由打字机函数处理滚动
				},
				// onComplete
				() => {
					if (requestId !== activeRequestId.value) return;

					// console.log('回答完成');
					handleResponseComplete();
				},
				// onError
				(err) => {
					if (requestId !== activeRequestId.value) return;

					console.error('流式响应错误:', err);
					isStreaming.value = false;
					currentTask.value = null;
					assistantMsg.isLoading = false;
					if (!assistantMsg.content) {
						assistantMsg.content = '抱歉，遇到了一些问题，请稍后重试。';
					}
				}
			);
			
		} catch (error) {
			console.error('发送失败:', error);
			isStreaming.value = false;
			assistantMsg.isLoading = false;
			assistantMsg.content = '网络连接异常，请检查您的网络设置。';
		}
	};
	
	const regenerateAnswer = async (index) => {
		const requestId = activeRequestId.value + 1;
		activeRequestId.value = requestId;

		// 找到上一条用户消息
		let lastUserMsg = null;
		for (let i = index - 1; i >= 0; i--) {
			if (messages.value[i].role === 'user') {
				lastUserMsg = messages.value[i];
				break;
			}
		}
		
		if (lastUserMsg) {
			isResponseComplete.value = false;

			// 清空当前助手回复并重新发送
			messages.value[index].content = '';
			messages.value[index].isLoading = true;
			isStreaming.value = true;
			
			// 复用发送逻辑
			try {
				currentTask.value = sendAIChatStreaming(
					{
						query: lastUserMsg.content,
						conversation_id: sessionId.value,
						provider: currentProvider.value,
						model: currentModelId.value,
						systemPrompt
					},
					(data) => {
						if (requestId !== activeRequestId.value) return;

						messages.value[index].isLoading = false;
						
						// 检查是否为完成事件
						if (data.event === 'complete' || data.status === 'COMPLETED' || (data.event === 'message' && data.data && data.data.status === 'COMPLETED')) {
							if (typingQueue.value.length === 0) {
								isStreaming.value = false;
								currentTask.value = null;
							}
							return;
						}
						
						let newContent = '';
						if (data.text) {
							newContent = data.text;
						} else if (data.content) {
							newContent = data.content;
						} else if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
							newContent = data.choices[0].delta.content;
						} else if (data.data && typeof data.data === 'string') {
							newContent = data.data;
						}
						
						if (newContent && newContent !== '[DONE]' && newContent !== '...' && !newContent.includes('[DONE]')) {
							// messages.value[index].content += newContent;
							// 使用打字机效果
							const chars = newContent.split('');
							typingQueue.value.push(...chars);
							if (!isTyping.value) {
								processTypingQueue(index);
							}
						}
						// scrollToBottom();
					},
					() => {
						if (requestId !== activeRequestId.value) return;

						if (typingQueue.value.length === 0) {
							isStreaming.value = false;
							currentTask.value = null;
							messages.value[index].isLoading = false;
						}
					},
					(err) => {
						if (requestId !== activeRequestId.value) return;

						isStreaming.value = false;
						messages.value[index].isLoading = false;
						if (!messages.value[index].content) {
							messages.value[index].content = '重新生成失败，请重试。';
						}
					}
				);
			} catch (e) {
				isStreaming.value = false;
			}
		}
	};
	
	const copyText = (text) => {
		uni.setClipboardData({
			data: text,
			success: () => {
				uni.showToast({
					title: '已复制',
					icon: 'none'
				});
			}
		});
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background: linear-gradient(90deg, #1890ff 0%, #36cfc9 100%);
		z-index: 100;

		.nav-content {
			height: 44px;
			display: flex;
            align-items: center; /* 垂直居中 */
			position: relative;
			padding: 0 15px;

			.nav-title {
				color: #fff;
				font-size: 18px;
				margin-left: 10px;
				font-weight: 500;
			}

			.nav-right {
				margin-left: auto;
				display: flex;
				align-items: center;
				.nav-btn {
					padding: 5px;
				}
			}
		}
	}

	.chat-content {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0; 
		width: 100%;
		height: 100%;
	}
	
	.chat-padding {
		padding: 30rpx;
	}
	
	.ai-notice {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		margin-bottom: 20rpx;
	}

	.chat-message {
		display: flex;
		margin-bottom: 40rpx;
		width: 100%;

		&.assistant {
			align-items: flex-start;

			.avatar {
				width: 80rpx;
				height: 80rpx;
				background: #fff;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 20rpx;
				box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
				flex-shrink: 0;
			}

			.message-bubble {
				background: #fff;
				color: #333;
				border-radius: 0 20rpx 20rpx 20rpx;
				position: relative;
			}
		}

		&.user {
			justify-content: flex-end;

			.message-bubble {
				background: #1890ff;
				color: #fff;
				border-radius: 20rpx 0 20rpx 20rpx;
			}
		}
	}

	.message-bubble {
		padding: 24rpx 32rpx;
		max-width: 75%;
		font-size: 28rpx;
		line-height: 1.6;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		word-break: break-all;
		
		.message-text {
			white-space: pre-wrap;
		}
		
		&.user-bubble {
			background: #1890ff;
			box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.2);
		}
	}
	
	.msg-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 15rpx;
		padding-top: 15rpx;
		border-top: 1rpx solid #eee;
		
		.action-btn {
			display: flex;
			align-items: center;
			margin-left: 20rpx;
			
			.action-text {
				font-size: 22rpx;
				color: #666;
				margin-left: 6rpx;
			}
		}
	}
	
	.loading-dots {
		display: flex;
		align-items: center;
		height: 40rpx;
		
		.dot {
			width: 10rpx;
			height: 10rpx;
			background: #ccc;
			border-radius: 50%;
			margin: 0 6rpx;
			animation: dot-blink 1.4s infinite ease-in-out both;
			
			&:nth-child(1) { animation-delay: -0.32s; }
			&:nth-child(2) { animation-delay: -0.16s; }
		}
	}
	
	@keyframes dot-blink {
		0%, 80%, 100% { transform: scale(0); }
		40% { transform: scale(1); }
	}

	.fixed-bottom {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 99;
		border-top: 1rpx solid #eee;

		.skip-container {
			padding: 20rpx;
			display: flex;
			justify-content: flex-end;
			background: #f9f9f9;

			.skip-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				background: #fff;
				border: 1px solid transparent;
				padding: 16rpx 40rpx;
				border-radius: 40rpx;
				box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
				transition: all 0.3s;
				
				&:active {
					transform: scale(0.98);
					background: #f0f7ff;
				}

				.skip-text {
					color: #1890ff;
					font-size: 28rpx;
					margin-left: 10rpx;
					font-weight: 500;
				}
			}
		}

		.input-area {
			display: flex;
			align-items: center;
			padding: 20rpx 30rpx 30rpx; 
			background: #fff;

			.input-wrapper {
				flex: 1;
				height: 80rpx;
				background: #f5f7fa;
				border-radius: 40rpx;
				padding: 0 30rpx;
				display: flex;
				align-items: center;
				border: 1rpx solid #e6e6e6;
			}

			.chat-input {
				flex: 1;
				height: 100%;
				font-size: 28rpx;
				color: #333;
			}

			.send-btn {
				width: 80rpx;
				height: 80rpx;
				background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 20rpx;
				box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.4);
				transition: all 0.3s;
				
				&.disabled {
					background: #ccc;
					box-shadow: none;
				}
				
				&:active {
					transform: scale(0.95);
				}
			}
		}
	}
</style>
