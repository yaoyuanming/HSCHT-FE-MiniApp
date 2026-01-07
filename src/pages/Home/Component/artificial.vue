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
						<!-- 文本消息 -->
						<text v-if="msg.content" class="message-text" user-select>{{ msg.content }}</text>
						
						<!-- 图片消息 -->
						<view v-if="msg.ossUrl && getFileType(msg.ossUrl) === 'image'" class="message-image-box">
							<image 
								:src="msg.ossUrl" 
								mode="widthFix" 
								class="message-image"
								@click="previewImage(msg.ossUrl)"
							></image>
						</view>

						<!-- 文档消息 -->
						<view 
							v-if="msg.ossUrl && getFileType(msg.ossUrl) === 'document'" 
							class="message-file"
							@click="openDocument(msg.ossUrl)"
						>
							<view class="file-icon">
								<uni-icons type="paperclip" size="24" color="#333"></uni-icons>
							</view>
							<text class="file-name">点击查看文件</text>
						</view>
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
	import { useStore } from 'vuex';
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';
	import { addConsultation, addConsultationMessage, getConsultationMessageList, getUserConsultationList } from '@/api/consultation.js';

	const store = useStore();
	const userId = computed(() => store.state.userId);
	const statusBarHeight = ref(20);
	const inputText = ref('');
	const scrollTop = ref(0);
	const consultationId = ref(null); // 存储当前的咨询ID
	
	// 消息列表
	const messages = ref([]);

	const hasContent = computed(() => {
		return inputText.value.trim().length > 0;
	});

	onLoad(async (options) => {
		const sysInfo = uni.getSystemInfoSync();
		statusBarHeight.value = sysInfo.statusBarHeight;
		
		if (options.consultationId) {
			consultationId.value = options.consultationId;
			loadMessages();
		} else {
			// 尝试从服务器获取该用户的咨询列表
			try {
				const res = await getUserConsultationList({
					createBy: userId.value
				});
				if (res && res.rows && res.rows.length > 0) {
					// 找到当前用户的咨询
					// 假设返回的列表已经按时间排序，或者我们需要筛选
					// 既然用户说"createBy都一样说明已经创建过"，我们取第一个即可
					const exist = res.rows.find(item => item.createBy == userId.value);
					if (exist) {
						consultationId.value = exist.id || exist.consultationId;
						loadMessages();
						return;
					}
				}
			} catch (e) {
				console.error('获取咨询列表失败:', e);
			}

			// 如果服务器没有找到，再尝试本地缓存
			const lastId = uni.getStorageSync('last_consultation_id');
			if (lastId) {
				consultationId.value = lastId;
				loadMessages();
			} else {
				// 如果没有consultationId，可能是一个新会话，或者需要默认显示一些欢迎语
				messages.value = [{
					role: 'assistant',
					content: '您好！我是客服，很高兴为您服务。'
				}];
			}
		}
	});

	// 加载历史消息
	const loadMessages = async () => {
		if (!consultationId.value) return;
		try {
			const res = await getConsultationMessageList({
				consultationId: consultationId.value
			});
			if (res && res.rows) {
				// 按照时间正序排序 (旧消息在前，新消息在后)
				const sortedRows = res.rows.sort((a, b) => {
					const timeA = new Date(a.createTime || a.create_time).getTime();
					const timeB = new Date(b.createTime || b.create_time).getTime();
					return timeA - timeB;
				});

				// 转换消息格式
				messages.value = sortedRows.map(msg => {
					// senderType: "0" 客户, "1" 客服
					return {
						role: msg.senderType === '1' ? 'assistant' : 'user',
						content: msg.content,
						ossUrl: msg.ossUrl // 映射ossUrl字段
					};
				});
				scrollToBottom();
			}
		} catch (e) {
			console.error('获取消息列表失败:', e);
		}
	};

	// 获取文件类型
	const getFileType = (url) => {
		if (!url) return 'text';
		// 去除查询参数
		const cleanUrl = url.split('?')[0];
		const ext = cleanUrl.split('.').pop().toLowerCase();
		const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
		const docExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
		
		if (imageExts.includes(ext)) return 'image';
		if (docExts.includes(ext)) return 'document';
		return 'unknown';
	};

	// 预览图片
	const previewImage = (url) => {
		if (!url) return;
		uni.previewImage({
			urls: [url]
		});
	};

	// 打开文档
	const openDocument = (url) => {
		if (!url) return;
		
		// 如果是H5环境，直接新窗口打开
		// #ifdef H5
		window.open(url);
		return;
		// #endif

		// 小程序环境
		uni.showLoading({ title: '正在打开...' });
		uni.downloadFile({
			url: url,
			success: function (res) {
				const filePath = res.tempFilePath;
				uni.openDocument({
					filePath: filePath,
					showMenu: true,
					success: function () {
						console.log('打开文档成功');
						uni.hideLoading();
					},
					fail: function(e) {
						console.error('打开文档失败', e);
						uni.hideLoading();
						uni.showToast({ title: '无法打开此文件', icon: 'none' });
					}
				});
			},
			fail: function(e) {
				console.error('下载文件失败', e);
				uni.hideLoading();
				uni.showToast({ title: '文件下载失败', icon: 'none' });
			}
		});
	};

	const goBack = () => {
		uni.navigateBack();
	};

	const switchToAI = () => {
		// 跳转到AI咨询页面
		uni.navigateTo({
			url: '/pages/Home/Component/ai_assistant'
		});
	};

	const sendMessage = async () => {
		if (!hasContent.value) return;
		
		const content = inputText.value.trim();
		messages.value.push({
			role: 'user',
			content: content
		});
		
		inputText.value = '';
		scrollToBottom();
		
		try {
			if (!consultationId.value) {
				// 新增咨询 (创建新对话)
				// 调整参数结构，尝试扁平化并补充发送者信息
				const params = {
					status: '0',
					consultationContent: content,
					content: content, // 冗余兼容
					senderId: userId.value,
					senderType: '0' // 0代表用户
				};
				const res = await addConsultation(params);
				if (res && res.data && res.data.consultationId) {
					consultationId.value = res.data.consultationId;
					// 保存会话ID，以便下次进入时加载
					uni.setStorageSync('last_consultation_id', consultationId.value);
				} else if (res && res.rows) {
					// 兼容可能的返回结构
				} else if (res && res.code === 200 && res.msg === '操作成功' && !res.data) {
                    // 如果创建成功但未返回ID，尝试重新获取列表或提示
                    // 这种情况可能是后端未正确返回ID，或者参数仍有问题
                    console.warn('创建咨询成功但未返回ID');
                }
			} else {
				// 新增咨询消息 (已有对话)
				const params = {
					content: content,
					contentType: '0',
					senderId: userId.value,
					senderType: '0', // 0代表用户
					consultationId: consultationId.value
				};
				await addConsultationMessage(params);
			}
		} catch (e) {
			console.error('发送咨询失败:', e);
		}
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
		
		.message-image-box {
			margin-top: 10rpx;
		}

		.message-image {
			max-width: 100%;
			border-radius: 8rpx;
			display: block;
		}

		.message-file {
			display: flex;
			align-items: center;
			background: #f5f5f5;
			padding: 15rpx;
			border-radius: 10rpx;
			margin-top: 10rpx;
			cursor: pointer;

			.file-icon {
				margin-right: 15rpx;
				display: flex;
				align-items: center;
			}

			.file-name {
				color: #333;
				font-size: 26rpx;
				text-decoration: underline;
			}
		}
		
		&.user-bubble {
			background: #1890ff;
			box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.2);

			.message-file {
				background: rgba(255, 255, 255, 0.2);
				
				.file-name {
					color: #fff;
				}
				
				:deep(.uni-icons) {
					color: #fff !important;
				}
			}
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