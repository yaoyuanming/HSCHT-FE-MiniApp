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
			:style="{ top: (statusBarHeight + 44) + 'px' }"
		>
			<view class="chat-padding">
				
				<!-- 消息列表 -->
				<view class="chat-message" :class="msg.role" v-for="(msg, index) in messages" :key="index">
					<!-- 助手/客服头像 -->
					<view class="avatar" v-if="msg.role === 'assistant'">
						<uni-icons type="person-filled" size="20" color="#999"></uni-icons>
					</view>
					
					<!-- 消息气泡 -->
					<view class="message-bubble" :class="msg.role === 'user' ? 'user-bubble' : ''">
						<text class="message-text" user-select>{{ msg.content }}</text>
					</view>
				</view>
				
				<!-- 垫高底部 -->
				<view style="height: 180rpx;"></view>
			</view>
		</scroll-view>

		<!-- 底部固定区域 -->
		<view class="fixed-bottom">
			<!-- 悬浮的转AI按钮 -->
			<view class="skip-container">
				<view class="skip-btn" @click="switchToAI">
					<image src="/static/闪电.png" mode="aspectFit" style="width: 16px; height: 16px; margin-right: 5px;"></image>
					<text class="skip-text">转人AI咨询</text>
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
					/>
				</view>
				<view 
					class="send-btn" 
					:class="{ 'active': hasContent }"
					@click="sendMessage"
				>
					<uni-icons type="paperplane-filled" size="20" :color="hasContent ? '#fff' : '#000'"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';

	const statusBarHeight = ref(20);
	const inputText = ref('');
	const scrollTop = ref(0);
	
	// 模拟初始消息
	const messages = ref([
		{
			role: 'assistant',
			content: '您好！我是客服XXXX，很高兴为您服务。为了更好地帮助您，请告诉我您需要咨询哪方面的问题？'
		},
		{
			role: 'user',
			content: '我想了解一下贵公司的产品特点和优势'
		}
	]);

	const hasContent = computed(() => {
		return inputText.value.trim().length > 0;
	});

	onLoad(() => {
		const sysInfo = uni.getSystemInfoSync();
		statusBarHeight.value = sysInfo.statusBarHeight;
	});

	const goBack = () => {
		uni.navigateBack();
	};

	const switchToAI = () => {
		// 跳转到AI咨询页面
		uni.navigateTo({
			url: '/pages/Home/Component/ai_assistant'
		});
	};

	const sendMessage = () => {
		if (!hasContent.value) return;
		
		const content = inputText.value.trim();
		messages.value.push({
			role: 'user',
			content: content
		});
		
		inputText.value = '';
		scrollToBottom();
		
		// 模拟回复
		setTimeout(() => {
			messages.value.push({
				role: 'assistant',
				content: '收到您的问题，人工客服正在输入中...'
			});
			scrollToBottom();
		}, 1000);
	};
	
	const scrollToBottom = () => {
		setTimeout(() => {
			scrollTop.value += 10000;
		}, 100);
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
			padding: 0 15px;
			align-items: center; /* 垂直居中 */
			position: relative;

			.nav-left {
				display: flex;
				align-items: center;
				z-index: 2;
			}
			
			.nav-title {
				color: #fff;
				font-size: 18px;
				font-weight: 500;
				pointer-events: none;
				z-index: 1;
				margin-left: 8px;
			}

			.nav-right {
				margin-left: auto; /* 推到右边 */
				display: flex;
				align-items: center;
				z-index: 2;
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
				border: 1rpx solid #fff;
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
				background: #f5f5f5;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 20rpx;
				transition: all 0.3s;
				
				&.active {
					background: #1890ff;
					box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
				}
			}
		}
	}
</style>