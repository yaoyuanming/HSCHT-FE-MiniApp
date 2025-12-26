<template>
	<view class="container">
		<!-- 顶部工单编号条 -->
		<view class="header-bar">
			<text class="header-order-no">工单编号: {{ orderInfo.orderNo }}</text>
			<text class="header-status">{{ orderInfo.statusText }}</text>
		</view>

		<scroll-view scroll-y class="content-scroll">
			<!-- 基本信息卡片 -->
			<view class="card">
				<view class="card-title">基本信息</view>
				<view class="info-row">
					<text class="label">客户姓名</text>
					<text class="value">{{ orderInfo.customerName }}</text>
				</view>
				<view class="info-row">
					<text class="label">联系电话</text>
					<text class="value">{{ orderInfo.phone }}</text>
				</view>
				<view class="info-row">
					<text class="label">公司名称</text>
					<text class="value">{{ orderInfo.company }}</text>
				</view>
				<view class="info-row">
					<text class="label">处理人</text>
					<view class="assignee-box">
						<image class="assignee-avatar" src="/static/logo.png" mode="aspectFill"></image>
						<text class="value">{{ orderInfo.assignee }}</text>
					</view>
				</view>
				<view class="info-row">
					<text class="label">创建时间</text>
					<text class="value">{{ orderInfo.createTime }}</text>
				</view>
			</view>

			<!-- 咨询内容卡片 -->
			<view class="card">
				<view class="card-title">咨询内容</view>
				<view class="content-text">
					<text>{{ orderInfo.content }}</text>
				</view>
			</view>

			<!-- 处理流程 -->
			<view class="card timeline-card">
				<view class="card-title">处理流程</view>
				
				<view class="timeline">
					<view class="timeline-item" v-for="(item, index) in timelineList" :key="index">
						<view class="timeline-icon" :class="item.statusClass">
							<uni-icons :type="item.icon" size="20" :color="item.iconColor"></uni-icons>
						</view>
						<view class="timeline-content">
							<view class="timeline-header">
								<text class="timeline-title">{{ item.title }}</text>
								<text class="timeline-time">{{ item.createTime }}</text>
							</view>
							<!-- 描述/回复内容 -->
						<view class="reply-box" v-if="item.description || (item.files && item.files.length > 0)">
							<text class="reply-text" v-if="item.description">{{ item.description }}</text>
							
							<!-- 附件 -->
							<view v-if="item.files && item.files.length > 0">
								<view class="reply-label">附件：</view>
									<view class="attachment-list">
										<view class="attachment-item" v-for="(file, fIndex) in item.files" :key="fIndex" @click="openFile(file)">
											<template v-if="isImage(file)">
												<image :src="getFileUrl(file)" mode="aspectFill" class="attachment-thumb"></image>
											</template>
											<template v-else>
												<uni-icons type="paperclip" size="16" color="#ff4d4f"></uni-icons>
											</template>
											<text class="file-name">{{ file.originalName || file.fileName }}</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 空状态 -->
					<view v-if="timelineList.length === 0" class="empty-timeline">
						<text>暂无处理记录</text>
					</view>
				</view>
			</view>
			
			<!-- 底部占位，防止被回复栏遮挡 -->
			<view style="height: 300rpx;"></view>
		</scroll-view>

		<!-- 底部回复栏 -->
		<view class="footer-reply">
			<view class="reply-label">回复</view>
			<view class="input-area">
				<textarea class="reply-input" v-model="replyContent" placeholder="请输入内容" auto-height fixed="true" />
			</view>
			<view class="file-picker-area">
				<uni-file-picker 
					v-model="replyFiles" 
					file-mediatype="all" 
					mode="grid" 
					limit="5"
					:auto-upload="false"
					@select="handleFileSelect"
					@delete="handleFileDelete"
				>
					<view class="upload-btn-custom">
						<uni-icons type="cloud-upload" size="20" color="#666"></uni-icons>
						<text class="upload-text">选择文件</text>
					</view>
				</uni-file-picker>
				<view class="file-hint">支持jpg、png、pdf格式，单个文件不超过10MB</view>
			</view>
			<view class="action-row">
				<button class="send-btn" type="primary" size="mini" @click="submitReply" :loading="submitting">发送</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { getTicketDetail, getTicketActivityLogList, addTicketActivityLog } from '@/api/ticket.js'
	import { mapGetters } from 'vuex'

	export default {
		data() {
			return {
				orderInfo: {
					id: '', // Add ID to orderInfo
					orderNo: '',
					statusText: '',
					customerName: '',
					phone: '',
					company: '',
					assignee: '',
					createTime: '',
					content: ''
				},
				timelineList: [],
				replyContent: '',
				replyFiles: [],
				submitting: false,
				ticketId: '' // Store ticketId separately
			}
		},
		computed: {
			...mapGetters(['userInfo']),
			currentUserId() {
				// 优先从 userInfo 获取，兼容多种结构
				if (this.userInfo) {
					return this.userInfo.user?.userId || this.userInfo.userId || this.userInfo.id || uni.getStorageSync('userId') || ''
				}
				// 兜底从 storage 获取
				return uni.getStorageSync('userId') || ''
			}
		},
		onLoad(options) {
			console.log('Detail Page Loaded', options);
			if (options.id) {
				this.ticketId = options.id
				this.fetchDetail(options.id)
				this.fetchTimeline(options.id)
			}
		},
		methods: {
			handleFileSelect(e) {
				console.log('File selected:', e)
				// 手动更新 replyFiles，解决 v-model 可能不生效的问题
				if (e.tempFiles) {
					// 避免重复添加
					const newFiles = e.tempFiles.filter(nf => 
						!this.replyFiles.some(of => (of.path || of.url) === (nf.path || nf.url))
					)
					this.replyFiles = [...this.replyFiles, ...newFiles]
				}
			},
			handleFileDelete(e) {
				console.log('File deleted:', e)
				// 手动从 replyFiles 中移除
				const delPath = e.tempFilePath || e.filePath || (e.tempFile && e.tempFile.path)
				if (delPath) {
					this.replyFiles = this.replyFiles.filter(f => (f.path || f.url) !== delPath)
				}
			},
			async submitReply() {
				if (!this.replyContent && this.replyFiles.length === 0) {
					uni.showToast({ title: '请输入内容或上传文件', icon: 'none' })
					return
				}
				
				this.submitting = true
				try {
					let uploadedFileList = []
					if (this.replyFiles.length > 0) {
						uploadedFileList = await this.uploadFiles()
					}
					
					const data = {
						ticketId: this.ticketId,
						activityType: 2, // 2: 工单处理
						description: this.replyContent || (uploadedFileList.length > 0 ? '上传附件' : ''),
						createdBy: this.currentUserId,
						// 确保 ticketFileList 是主要的附件字段
						ticketFileList: uploadedFileList
					}
					
					console.log('Submitting reply payload:', JSON.stringify(data))
					const res = await addTicketActivityLog(data)
					console.log('Submit reply response:', res)
					
					if (res.code === 200 || res.code === 0) {
						uni.showToast({ title: '回复成功', icon: 'success' })
						this.replyContent = ''
						this.replyFiles = []
						// Refresh timeline with a slight delay to ensure backend data consistency
						setTimeout(() => {
							this.fetchTimeline(this.ticketId)
						}, 800)
					} else {
						uni.showToast({ title: res.msg || '回复失败', icon: 'none' })
					}
				} catch (e) {
					console.error('Submit reply failed:', e)
					uni.showToast({ title: '回复失败', icon: 'none' })
				} finally {
					this.submitting = false
				}
			},
			async uploadFiles() {
				const uploadedList = []
				const baseUrl = import.meta.env.VITE_API_BASE_URL
				// 更改上传接口地址，与管理端保持一致
				const uploadUrl = baseUrl + '/resource/oss/upload' 
				const token = uni.getStorageSync('token')
				
				console.log('Starting upload:', { baseUrl, uploadUrl, token: token ? 'Has Token' : 'No Token' })

				for (const file of this.replyFiles) {
					console.log('Processing file:', file)
					// 优先使用 path (小程序), 其次 url
					const filePath = file.path || file.url
					if (!filePath) {
						console.error('File path is empty:', file)
						continue
					}

					try {
						const res = await new Promise((resolve, reject) => {
							uni.uploadFile({
								url: uploadUrl,
								filePath: filePath,
								name: 'file',
								header: {
									'Authorization': 'Bearer ' + token
								},
								success: (uploadRes) => {
									resolve(uploadRes)
								},
								fail: (err) => {
									reject(err)
								}
							})
						})
						
						console.log('Upload result raw:', res)
						let data 
						try {
							if (typeof res.data === 'string') {
								// 处理大整数精度丢失问题
								let jsonString = res.data
								// 将 ossId, id 等长整数转换为字符串
								jsonString = jsonString.replace(/"ossId"\s*:\s*(\d{15,})/g, '"ossId":"$1"')
								jsonString = jsonString.replace(/"id"\s*:\s*(\d{15,})/g, '"id":"$1"')
								data = JSON.parse(jsonString)
							} else {
								data = res.data
							}
						} catch (e) {
							console.error('Parse upload response failed', res.data)
							throw new Error('Upload response parse failed')
						}

						console.log('Upload result parsed:', data)

						if (data.code === 200 && data.data) {
							const ossData = data.data

							// 按照管理端 wordorder_handle.vue 的结构构建对象
							// 按照用户要求，将上传文件的返回结果赋值给 ossId
							let finalOssId = null
							if (ossData && typeof ossData === 'object') {
								// 如果是对象，尝试提取 ID
								finalOssId = ossData.ossId || ossData.id || ossData.ossid || ossData.fileId
							} else if (ossData) {
								// 如果 data.data 直接是 ID (基本类型)
								finalOssId = ossData
							}

							if (!finalOssId) {
								console.error('Critical: ossId is missing in upload response!', ossData)
							} else {
								console.log('Got ossId for upload:', finalOssId)
							}
							
							uploadedList.push({
								createBy: undefined,
								createDept: undefined,
								createTime: undefined,
								ext1: undefined,
								fileName: ossData.fileName,
								fileSuffix: ossData.fileSuffix,
								mainId: undefined,
								originalName: ossData.originalName,
								ossId: finalOssId, // 优先取 ossId/id/ossid/fileId
								params: undefined,
								service: ossData.service,
								type: 0, // 0:工单日志
								updateBy: undefined,
								updateTime: undefined,
								url: ossData.url
							})
						} else {
							console.error('Upload returned error or no data:', data)
							throw new Error(data.msg || 'Upload failed')
						}
					} catch (e) {
						console.error('Upload file failed:', file, e)
						uni.showToast({ title: '文件上传失败: ' + (e.message || '未知错误'), icon: 'none' })
						throw e
					}
				}
				
				console.log('Final uploaded list:', uploadedList)
				return uploadedList
			},
			processTimelineData(list) {
				if (!list || list.length === 0) return []
				return list.map(item => {
					// 根据activityType设置样式和标题
					let title = ''
					let icon = 'checkbox-filled'
					let iconColor = '#52c41a'
					let statusClass = 'success'
					
					// 0:创建, 1:分配, 2:处理
					switch(Number(item.activityType)) {
						case 0:
							title = '工单创建'
							icon = 'checkbox-filled'
							iconColor = '#52c41a'
							statusClass = 'success'
							break;
						case 1:
							title = '工单分配'
							icon = 'person-filled'
							iconColor = '#1890ff'
							statusClass = 'processing'
							break;
						case 2:
							title = '工单处理'
							icon = 'chat-filled'
							iconColor = '#1890ff'
							statusClass = 'processing'
							break;
						default:
							title = '操作记录'
							icon = 'info-filled'
							iconColor = '#999'
							statusClass = 'default'
					}

					// 尝试获取附件列表，兼容多种字段名
					let files = item.ticketFileList || item.fileList || item.file || item.files || item.sysOssList || (item.params && item.params.ticketFileList) || []
					
					// 如果是字符串，尝试解析
					if (typeof files === 'string') {
						try {
							files = JSON.parse(files)
						} catch (e) {
							console.error('Parse files failed:', e)
							files = []
						}
					}
					
					return {
						id: item.id,
						title: title,
						description: item.description,
						createTime: item.createTime || '', 
						activityType: item.activityType,
						files: files, 
						icon,
						iconColor,
						statusClass
					}
				})
			},
			async fetchTimeline(ticketId) {
				try {
					console.log('Fetching timeline for ticketId:', ticketId)
					const res = await getTicketActivityLogList(ticketId)
					console.log('Timeline Response:', res)
					const list = res.data?.rows || res.rows || res.data || []
					this.timelineList = this.processTimelineData(list)
				} catch (e) {
					console.error('Fetch timeline failed:', e)
				}
			},
			openFile(file) {
				const fileUrl = this.getFileUrl(file)
				if (!fileUrl) {
					uni.showToast({ title: '无效的文件链接', icon: 'none' })
					return
				}
				
				// 获取文件后缀
				let fileType = (file.fileSuffix || '').toLowerCase().replace('.', '')
				if (!fileType) {
					// 优先使用 originalName 或 fileName
					const name = file.originalName || file.fileName
					if (name) {
						const index = name.lastIndexOf('.')
						if (index > -1) {
							fileType = name.substring(index + 1).toLowerCase()
						}
					}
					
					// 如果还是没有，尝试从 URL 获取，注意去除查询参数
					if (!fileType && fileUrl) {
						// 去除查询参数
						const urlWithoutQuery = fileUrl.split('?')[0]
						const index = urlWithoutQuery.lastIndexOf('.')
						if (index > -1) {
							fileType = urlWithoutQuery.substring(index + 1).toLowerCase()
						}
					}
				}
				
				console.log('Opening file:', fileUrl, 'Type:', fileType)

				if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) {
					uni.previewImage({
						urls: [fileUrl],
						fail: () => {
							uni.showToast({ title: '图片预览失败', icon: 'none' })
						}
					})
				} else {
					uni.showLoading({ title: '正在打开...' })
					uni.downloadFile({
						url: fileUrl,
						success: (res) => {
							if (res.statusCode === 200) {
								console.log('Download success, temp path:', res.tempFilePath)
								
								// 构建 openDocument 参数
								const openDocOptions = {
									filePath: res.tempFilePath,
									showMenu: true,
									success: () => {
										console.log('打开文档成功')
									},
									fail: (e) => {
										console.error('Open document failed:', e)
										uni.showToast({ title: '无法打开此文件', icon: 'none' })
									}
								}
								
								// 显式指定文件类型 (如果是支持的文档格式)
								// uni.openDocument 支持的格式：doc, docx, xls, xlsx, ppt, pptx, pdf
								const supportedTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf']
								if (supportedTypes.includes(fileType)) {
									openDocOptions.fileType = fileType
								}
								
								uni.openDocument(openDocOptions)
							} else {
								uni.showToast({ title: '文件下载失败', icon: 'none' })
							}
						},
						fail: (e) => {
							console.error('Download failed:', e)
							uni.showToast({ title: '文件下载失败', icon: 'none' })
						},
						complete: () => {
							uni.hideLoading()
						}
					})
				}
			},
			async fetchDetail(id) {
				try {
					uni.showLoading({ title: '加载中' })
					const res = await getTicketDetail(id)
					console.log('Ticket Detail Response:', res)
					const data = res.data
					if (data) {
						this.orderInfo = {
							orderNo: data.ticketNo,
							statusText: this.mapStatusText(data.status),
							customerName: data.contactName,
							phone: data.contactPhone,
							company: data.companyName,
							assignee: data.assignUser?.nickName || data.assignUserId || '未分配',
							createTime: data.createTime,
							content: data.description
						}
						
						// Removed timeline update from detail to avoid overwriting complete data from fetchTimeline
						// with potentially incomplete data from getTicketDetail
					}
				} catch (e) {
					console.error('Fetch ticket detail failed:', e)
					uni.showToast({ title: '加载详情失败', icon: 'none' })
				} finally {
					uni.hideLoading()
				}
			},
			mapStatusText(status) {
				const map = {
					0: '待处理',
					1: '处理中',
					2: '已完成',
					3: '紧急'
				}
				return map[status] || '未知状态'
			},
			getFileUrl(file) {
				let fileUrl = file.url || file.fileUrl || file.filePath || ''
				if (fileUrl && !fileUrl.startsWith('http') && !fileUrl.startsWith('//')) {
					const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
					if (baseUrl) {
						fileUrl = baseUrl + (fileUrl.startsWith('/') ? '' : '/') + fileUrl
					}
				}
				
				// 检查 OSS 区域不匹配问题 (Host 为 cn-guangzhou 但签名为 us-east-1，会导致 403 Forbidden)
				if (fileUrl && fileUrl.includes('oss-cn-guangzhou') && fileUrl.includes('us-east-1')) {
					console.warn('OSS Region Mismatch Detected: Host is cn-guangzhou but signature is for us-east-1. This usually causes 403 Forbidden.', fileUrl)
				}
				
				return fileUrl
			},
			isImage(file) {
				const fileUrl = this.getFileUrl(file)
				if (!fileUrl) return false
				
				// 优先使用 fileSuffix
				let ext = (file.fileSuffix || '').toLowerCase().replace('.', '')
				if (!ext) {
					// 从文件名获取
					const name = file.originalName || file.fileName || fileUrl
					const index = name.lastIndexOf('.')
					if (index > -1) {
						ext = name.substring(index + 1).toLowerCase()
					}
				}
				
				return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f7fa;
		height: 100vh;
		overflow: hidden;
	}

	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 顶部条 */
	.header-bar {
		background-color: #ffffff;
		padding: 20rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1rpx solid #eee;
	}

	.header-order-no {
		font-size: 28rpx;
		color: #666;
	}

	.header-status {
		font-size: 28rpx;
		color: #ff9900; /* 处理中颜色 */
		font-weight: bold;
	}

	/* 内容滚动区 */
	.content-scroll {
		flex: 1;
		height: 0; /* 确保 scroll-view 在 flex 布局中正确滚动 */
		padding: 20rpx 30rpx;
		box-sizing: border-box;
	}

	.card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
	}

	.card-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 24rpx;
	}

	/* 基本信息 */
	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
		font-size: 28rpx;
		
		&:last-child { margin-bottom: 0; }
	}

	.label {
		color: #999;
	}

	.value {
		color: #333;
	}

	.assignee-box {
		display: flex;
		align-items: center;
	}

	.assignee-avatar {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		margin-right: 10rpx;
	}

	/* 咨询内容 */
	.content-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}

	/* 处理流程 Timeline */
	.timeline-item {
		display: flex;
		position: relative;
		padding-bottom: 40rpx;
		
		&:last-child { 
			padding-bottom: 0; 
			.timeline-icon::after { display: none; }
		}
	}

	.timeline-icon {
		width: 50rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 20rpx;
		position: relative;
		
		&::after {
			content: '';
			position: absolute;
			top: 50rpx;
			bottom: -20rpx;
			width: 2rpx;
			background-color: #e8e8e8;
		}
	}

	.timeline-content {
		flex: 1;
	}

	.timeline-header {
		margin-bottom: 10rpx;
	}

	.timeline-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 6rpx;
	}

	.timeline-time {
		font-size: 24rpx;
		color: #999;
	}

	.reply-box {
		background-color: #f9f9f9;
		padding: 20rpx;
		border-radius: 8rpx;
		margin-top: 10rpx;
	}

	.reply-text {
		font-size: 26rpx;
		color: #666;
		line-height: 1.6;
	}

	.reply-label {
		font-size: 24rpx;
		color: #999;
		margin: 20rpx 0 10rpx;
	}

	.attachment-list {
		display: flex;
		gap: 20rpx;
	}

	.attachment-item {
		display: flex;
		align-items: center;
		background-color: #fff;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		border: 1rpx solid #eee;
	}

	.file-name {
		font-size: 24rpx;
		color: #333;
		margin-left: 8rpx;
	}

	.attachment-thumb {
		width: 60rpx;
		height: 60rpx;
		border-radius: 4rpx;
		margin-right: 8rpx;
	}

	/* 底部回复栏 */
	.footer-reply {
		background-color: #ffffff;
		padding: 20rpx 30rpx;
		border-top: 1rpx solid #eee;
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}
	
	.footer-reply .reply-label {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 16rpx;
		margin-top: 0;
	}

	.input-area {
		background-color: #f5f7fa;
		border-radius: 8rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.reply-input {
		width: 100%;
		font-size: 28rpx;
		min-height: 100rpx;
	}

	.action-row {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-top: 20rpx;
	}

	.file-picker-area {
		margin-top: 20rpx;
	}

	.upload-btn-custom {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f5f7fa;
		border-radius: 8rpx;
		width: 100%;
		height: 100%;
	}

	.upload-text {
		font-size: 20rpx;
		color: #666;
		margin-top: 4rpx;
	}
	
	.file-hint {
		font-size: 20rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.send-btn {
		margin: 0;
		background-color: #007AFF;
		min-width: 120rpx;
	}
</style>
