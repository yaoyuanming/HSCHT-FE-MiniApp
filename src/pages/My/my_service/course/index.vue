<template>
	<scroll-view scroll-y class="courses-scroll" lower-threshold="80" @scrolltolower="handleScrollLower">
	<view class="courses-content">
		<!-- 骨架屏：首次加载时显示 -->
		<view v-if="loading && courseList.length === 0" class="skeleton-list">
			<view v-for="i in 3" :key="i" class="skeleton-card">
				<view class="skeleton-cover"></view>
				<view class="skeleton-content">
					<view class="skeleton-title"></view>
					<view class="skeleton-line"></view>
					<view class="skeleton-line short"></view>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view v-else-if="!courseList.length" class="empty-state">
			<text class="empty-text">暂无课程订单</text>
		</view>
		
		<!-- 内容列表 -->
		<template v-else>
			<view v-for="order in courseList" :key="order.id" class="course-card" @click="handleCourseClick(order)">
				<image class="course-cover" :src="getCourseInfo(order).photoUrl || defaultCover" mode="aspectFill" />
				<view class="course-body">
					<view class="title-row">
						<view class="title">{{ getCourseInfo(order).courseName || '课程订单' }}</view>
						<view class="status-tag" :class="statusClass(getCourseInfo(order).status)">
							{{ statusText(getCourseInfo(order).status) }}
						</view>
					</view>
					<view class="meta-row">
						<text class="price">¥{{ amountText(order) }}</text>
						<text class="course-type">{{ courseTypeText(getCourseInfo(order).courseType) }}</text>
					</view>
					<view class="info-grid">
						<view class="info-item">
							<text class="label">支付方式</text>
							<text class="value">{{ paymentText(order) }}</text>
						</view>
						<view class="info-item">
							<text class="label">支付时间</text>
							<text class="value">{{ payTimeText(order) }}</text>
						</view>
					</view>
					<view class="course-remark">
						<text class="label">备注：</text>
						<text class="value">{{ getCourseInfo(order).remark || order.remark || '无' }}</text>
					</view>
				</view>
			</view>
		</template>
	</view>
	</scroll-view>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPorjectList } from '@/api/project.js'

const defaultCover = '/static/index/video.png'
const courseList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const isFirstLoad = ref(true)
const query = ref({
	pageSize: 20,
	pageNum: 1,
	type: 4
})

const statusText = (status) => {
	const map = {
		0: '草稿',
		1: '已发布',
		2: '已下线',
		3: '已截止'
	}
	return map[status] || '未知状态'
}

const statusClass = (status) => {
	return {
		pending: status === 1,
		ended: status === 2 || status === 3
	}
}

const courseTypeText = (type) => {
	if (type === 1) return '线下课程'
	if (type === 2) return '线上课程'
	return '课程'
}

const getCourseInfo = (order) => order.entCourse || order || {}

const amountText = (order) => {
	const val = order.consumptionAmount ?? order.originalAmount ?? getCourseInfo(order).price ?? 0
	const num = Number(val)
	return Number.isNaN(num) ? val : num.toFixed(2)
}

const paymentText = (order) => {
	if (order.payType === 'WECHAT') return '微信支付'
	if (order.payType === 'BALANCE') return '余额支付'
	return '其他支付'
}

const payTimeText = (order) => order.consumeTime || order.payTime || order.createTime || '暂无'

const fetchCourses = async (refresh = false, silent = false) => {
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
		query.value.pageNum = 1
		hasMore.value = true
		isFirstLoad.value = false
		// 注意：刷新时不要先清空数据，等新数据回来后再替换
	}

	try {
		const res = await getPorjectList(query.value)
		if (res.code === 200) {
			const rows = res.rows || []
			
			if (query.value.pageNum === 1) {
				// 直接替换，不清空旧数据，利用 Vue 响应式实现无感更新
				courseList.value = rows
			} else {
				// 加载更多：合并数据
				courseList.value = [...courseList.value, ...rows]
			}

			const total = res.total || 0
			if (total) {
				hasMore.value = courseList.value.length < total
			} else {
				hasMore.value = rows.length >= query.value.pageSize
			}
			if (hasMore.value) query.value.pageNum++
		} else {
			// 请求失败时，如果是刷新才清空数据
			if (refresh) courseList.value = []
			hasMore.value = false
		}
	} catch (error) {
		if (!silent) {
			uni.showToast({
				title: '课程加载失败',
				icon: 'none'
			})
		}
		// 请求失败时，如果是刷新才清空数据
		if (refresh) courseList.value = []
		hasMore.value = false
	} finally {
		loading.value = false
	}
}

onShow(() => {
	fetchCourses(true)
})

const handleCourseClick = (order) => {
	const info = getCourseInfo(order)
	
	// 如果课程已截止，不让点击进去查询
	if (info.status === 3) {
		uni.showToast({
			title: '该课程已截止，无法查看',
			icon: 'none'
		})
		return
	}
	
	const courseId = info.id || order.courseId
	if (!courseId) return
	
	uni.navigateTo({
		url: `/pages/Curriculum/detail?id=${courseId}`
	})
}

defineExpose({
	refresh: (silent = false) => fetchCourses(true, silent),
	loadMore: () => {
		if (hasMore.value) fetchCourses()
	}
})

const handleScrollLower = () => {
	if (!loading.value && hasMore.value) {
		fetchCourses()
	}
}
</script>

<style scoped lang="scss">
.courses-scroll {
	height: calc(100vh - 320rpx);
}

.courses-content {
	padding: 30rpx;
}

.course-card {
	background: #fff;
	border-radius: 24rpx;
	overflow: hidden;
	margin-bottom: 24rpx;
	box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.06);
}

.course-cover {
	width: 100%;
	height: 220rpx;
	object-fit: cover;
	display: block;
}

.course-body {
	padding: 28rpx;
}

.title-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.title {
	font-size: 32rpx;
	font-weight: 600;
	color: #111;
}

.status-tag {
	font-size: 24rpx;
	padding: 6rpx 18rpx;
	border-radius: 999rpx;
	background: rgba(25, 137, 250, 0.12);
	color: #1989fa;
}

.status-tag.ended {
	background: rgba(255, 94, 94, 0.15);
	color: #ff5e5e;
}

.meta-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.price {
	font-size: 34rpx;
	color: #e1291c;
	font-weight: 600;
}

.course-type {
	font-size: 24rpx;
	color: #666;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.info-item {
	font-size: 24rpx;
	color: #666;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.label {
	color: #999;
}

.value {
	color: #333;
	font-weight: 500;
}

.course-remark {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #666;
	display: flex;
	gap: 8rpx;
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
	display: flex;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	gap: 24rpx;
}

.skeleton-cover {
	width: 200rpx;
	height: 150rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	border-radius: 12rpx;
	flex-shrink: 0;
	animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.skeleton-title {
	height: 32rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	border-radius: 6rpx;
	animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-line {
	height: 24rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	border-radius: 6rpx;
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

