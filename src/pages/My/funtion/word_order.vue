<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input class="search-input" type="text" placeholder="搜索工单编号或关键词..." placeholder-style="color:#999" />
			</view>
		</view>

		<!-- 下拉刷新提示 -->
		<view class="refresh-tip">下拉可刷新</view>

		<!-- 工单列表 -->
		<view class="order-list">
			<view class="order-card" v-for="(item, index) in orderList" :key="index" @click="goToDetail(item)">
				<view class="card-header">
					<text class="order-no">工单 #{{ item.orderNo }}</text>
				</view>
				
				<view class="status-row">
					<view class="status-tag" :class="getStatusClass(item.status)">
						<text class="status-text">{{ item.statusText }}</text>
					</view>
				</view>

				<view class="card-content">
					<text class="description">{{ item.description }}</text>
				</view>

				<view class="card-footer">
					<text class="time">{{ item.createTime }}</text>
					<text class="assignee">处理人：{{ item.assignee }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getTicketList } from '@/api/ticket.js'

	export default {
		data() {
			return {
				orderList: []
			}
		},
		onShow() {
			this.fetchList()
		},
		methods: {
			async fetchList() {
				try {
					uni.showLoading({ title: '加载中' })
					const res = await getTicketList()
					const list = res.data?.rows || res.rows || res.data || []
					this.orderList = list.map(item => ({
						id: item.id,
						orderNo: item.ticketNo,
						status: this.mapStatus(item.status),
						statusText: this.mapStatusText(item.status),
						description: item.description,
						createTime: item.createTime,
						assignee: item.assignUser?.nickName || item.assignUserId || '未分配' // 假设后端返回assignUser对象或ID
					}))
				} catch (e) {
					console.error('Fetch ticket list failed:', e)
					uni.showToast({ title: '加载失败', icon: 'none' })
				} finally {
					uni.hideLoading()
				}
			},
			mapStatus(status) {
				const map = {
					0: 'pending',
					1: 'processing',
					2: 'completed',
					3: 'urgent' // 假设3是紧急
				}
				return map[status] || 'pending'
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
			getStatusClass(status) {
				const map = {
					'pending': 'status-pending',
					'processing': 'status-processing',
					'completed': 'status-completed',
					'urgent': 'status-urgent'
				}
				return map[status] || ''
			},
			goToDetail(item) {
				uni.navigateTo({
					url: `/pages/My/funtion/word_order_detail?id=${item.id}&orderNo=${item.orderNo}`
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f7fa;
	}

	.container {
		padding-bottom: 30rpx;
	}

	/* 搜索区域 */
	.search-section {
		background-color: #007AFF; /* 蓝色背景 */
		padding: 20rpx 30rpx;
	}

	.search-box {
		background-color: #ffffff;
		border-radius: 8rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
	}

	.search-input {
		flex: 1;
		margin-left: 16rpx;
		font-size: 28rpx;
		color: #333;
	}

	.refresh-tip {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		padding: 20rpx 0;
	}

	/* 列表区域 */
	.order-list {
		padding: 0 30rpx;
	}

	.order-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
	}

	.card-header {
		margin-bottom: 16rpx;
	}

	.order-no {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.status-row {
		margin-bottom: 20rpx;
	}

	.status-tag {
		display: inline-block;
		padding: 6rpx 24rpx;
		border-radius: 30rpx;
	}

	.status-text {
		font-size: 24rpx;
		color: #fff;
	}

	/* 状态颜色 */
	.status-pending {
		background-color: #d9d9d9;
		.status-text { color: #666; }
	}

	.status-processing {
		background-color: #ff9900;
	}

	.status-completed {
		background-color: #52c41a;
	}

	.status-urgent {
		background-color: #1890ff;
	}

	.card-content {
		margin-bottom: 24rpx;
	}

	.description {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		/* 限制显示两行 */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 24rpx;
		color: #999;
	}
</style>
