<template>
	<scroll-view scroll-y class="packages-scroll" lower-threshold="80" @scrolltolower="handleScrollLower">
	<view class="packages-content">
		<!-- 骨架屏：首次加载时显示 -->
		<view v-if="loading && projectList.length === 0" class="skeleton-list">
			<view v-for="i in 3" :key="i" class="skeleton-card">
				<view class="skeleton-header"></view>
				<view class="skeleton-line"></view>
				<view class="skeleton-line"></view>
				<view class="skeleton-line short"></view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view v-else-if="!projectList.length" class="empty-state">
			<text class="empty-text">暂无套餐订单</text>
		</view>
		
		<!-- 内容列表 -->
		<template v-else>
			<view v-for="temp in projectList" :key="temp.id" class="package-order-card">
				<view class="order-header">
					<view class="order-left">
						<text class="package-title">{{ temp.reservationtList ? temp.reservationtList[0]?.packageName : '未知套餐' }}</text>
						<text class="order-tag">支付成功</text>
					</view>
					<text class="refund-btn" @click="handleParentRefund(temp)">申请退款</text>
				</view>

				<view class="order-base-info">
					<view class="info-item">
						<text class="info-label">支付金额：</text>
						<text class="info-value">¥{{ temp.consumptionAmount }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">支付时间：</text>
						<text class="info-value">{{ temp.payTime || '暂无' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">支付方式：</text>
						<text class="info-value">{{ temp.payType === 'WECHAT' ? '微信支付' : '余额支付' }}</text>
					</view>
				</view>

				<view class="divider"></view>

				<view class="project-list-title">
					<text class="title-text">套餐包含项目</text>
				</view>

				<view class="project-list">
					<view v-for="items in temp.reservationtList" :key="items.packageId">
						<view class="project-item" v-for="chil in items.projectAppointmentList" :key="chil.projectId">
							<view class="project-info">
								<text class="project-name">{{ chil.projectName }}</text>
								<view class="time-tag">
									<text class="time-icon">⏰</text>
									<text class="time-text">{{ chil.reservationStartTime }} - {{ chil.reservationEndTime }}</text>
								</view>
							</view>
							<view class="project-controls">
								<view v-if="temp.status === 0" class="operation-btn" @tap="handelReservationOpen(chil)">
									未预约
								</view>
								<view v-else class="status-label">
									{{ getStatusText(temp.status) }}
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="order-update-time">
					<text class="update-label">最后更新：{{ temp.updateTime }}</text>
				</view>
			</view>
		</template>

		<DateModal ref="dateModal" @confirm="handelReservation" />
	</view>
	</scroll-view>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import DateModal from './date.vue'
import { getPorjectList, getUserReservation } from '@/api/project.js'
import { UserProjectReuund } from '@/api/user.js'

const projectList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const isFirstLoad = ref(true)
const pageList = ref({
	pageSize: 20,
	pageNum: 1,
	type: 0,
	isAsc: 'desc',
	orderByColumn: 'updateTime'
})

const dateModal = ref(null)

const getStatusText = (types) => {
	switch (types) {
		case 0:
			return '未预约'
		case 1:
			return '已预约'
		case 2:
			return '使用中'
		case 3:
			return '已完成'
		case 4:
			return '已退款'
		case 5:
			return '已取消'
		case 6:
			return '已过期'
		default:
			return '未知'
	}
}

const getProjectList = async (refresh = false, silent = false) => {
	if (loading.value) return
	
	// 只有首次加载且非静默模式时显示骨架屏
	// silent=true 时绝对不显示 loading/骨架屏
	if (refresh && isFirstLoad.value && !silent) {
		loading.value = true
	} else {
		// 静默刷新或加载更多时完全不显示 loading
		loading.value = false
	}

	if (refresh) {
		pageList.value.pageNum = 1
		hasMore.value = true
		isFirstLoad.value = false
		// 注意：刷新时不要先清空数据，等新数据回来后再替换
	}

	try {
		const res = await getPorjectList(pageList.value)
		if (res.code === 200) {
			const validRows = res.rows.filter(row => row.status !== -1)
			
			if (pageList.value.pageNum === 1) {
				// 直接替换，不清空旧数据，利用 Vue 响应式实现无感更新
				projectList.value = validRows
			} else {
				// 加载更多：合并数据
				projectList.value = [...projectList.value, ...validRows]
			}

			const total = res.total || 0
			if (total) {
				hasMore.value = projectList.value.length < total
			} else {
				hasMore.value = validRows.length >= pageList.value.pageSize
			}
			if (hasMore.value) pageList.value.pageNum++
		} else {
			// 请求失败时，如果是刷新才清空数据
			if (refresh) projectList.value = []
			hasMore.value = false
		}
	} catch (error) {
		if (!silent) {
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		}
		// 请求失败时，如果是刷新才清空数据
		if (refresh) projectList.value = []
		hasMore.value = false
	} finally {
		loading.value = false
	}
}

const handelReservation = async (rows) => {
	const res = await getUserReservation(rows)
	if (res.code === 200) {
		uni.showToast({
			title: '预约成功'
		})
		await getProjectList(true)
	}
}

const handelReservationOpen = (rows) => {
	if (rows.status !== 0) {
		uni.showToast({
			title: '当前项目状态无法预约',
			icon: 'none'
		})
		return
	}
	dateModal.value?.openModal(rows)
}

const handleParentRefund = (rows) => {
	if (rows.status !== 0) {
		uni.showToast({
			title: '只有未预约可以申请退款',
			icon: 'none'
		})
		return
	}

	uni.showModal({
		title: '申请退款',
		content: '确定要申请套餐退款吗？',
		success: async (res) => {
			if (res.confirm) {
				const result = await UserProjectReuund({
					id: Number(rows.id),
					remark: '1'
				})
				if (result.code === 200) {
					await getProjectList(true)
					uni.showToast({
						title: '申请成功'
					})
				}
			}
		}
	})
}

defineExpose({
	refresh: (silent = false) => getProjectList(true, silent),
	loadMore: () => {
		if (hasMore.value) getProjectList()
	}
})

const handleScrollLower = () => {
	if (!loading.value && hasMore.value) {
		getProjectList()
	}
}

onShow(() => {
	getProjectList(true)
})
</script>

<style scoped lang="scss">
.packages-scroll {
	height: calc(100vh - 320rpx);
}

.packages-content {
	padding: 30rpx;
}

.package-order-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.order-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.package-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 600;
}

.order-tag {
	font-size: 22rpx;
	color: #00b578;
	background: rgba(0, 181, 120, 0.12);
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
}

.refund-btn {
	font-size: 24rpx;
	color: #1989fa;
}

.order-base-info {
	display: flex;
	justify-content: space-between;
	margin-bottom: 16rpx;
	flex-wrap: wrap;
}

.info-item {
	width: 48%;
	font-size: 24rpx;
	color: #555;
	margin-bottom: 12rpx;
}

.info-label {
	color: #888;
}

.divider {
	height: 1px;
	background: #f2f2f2;
	margin: 20rpx 0;
}

.project-list-title {
	margin-bottom: 12rpx;
}

.title-text {
	font-size: 26rpx;
	font-weight: 600;
	color: #333;
}

.project-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 0;
	border-bottom: 1px dashed #f0f0f0;
}

.project-info {
	flex: 1;
}

.project-name {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.time-tag {
	display: flex;
	align-items: center;
	font-size: 22rpx;
	color: #888;
	margin-top: 8rpx;
}

.project-controls {
	display: flex;
	align-items: center;
	min-width: 160rpx;
	justify-content: flex-end;
}

.operation-btn {
	padding: 12rpx 32rpx;
	border-radius: 999rpx;
	background-color: #1989fa;
	color: #ffffff;
	font-size: 26rpx;
}

.status-label {
	font-size: 24rpx;
	color: #999;
}

.order-update-time {
	margin-top: 16rpx;
	font-size: 22rpx;
	color: #999;
	text-align: right;
}

.empty-state {
	padding: 80rpx 0;
	text-align: center;
	color: #999;
}

/* 骨架屏样式 */
.skeleton-list {
	padding: 24rpx 16rpx;
}

.skeleton-card {
	background: #fff;
	border-radius: 16rpx;
	padding: 32rpx 28rpx;
	margin-bottom: 32rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.skeleton-header {
	height: 40rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	border-radius: 8rpx;
	margin-bottom: 24rpx;
	animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-line {
	height: 28rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	border-radius: 6rpx;
	margin-bottom: 16rpx;
	animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-line.short {
	width: 60%;
}

@keyframes skeleton-loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}
</style>

