<template>
	<view class="course-page">
		<view class="course-list">
			<!-- 骨架屏：首次加载时显示 -->
			<view v-if="loading && courses.length === 0 && isFirstLoad" class="skeleton-list">
				<view v-for="i in 3" :key="i" class="skeleton-card">
					<view class="skeleton-media"></view>
					<view class="skeleton-body">
						<view class="skeleton-title"></view>
						<view class="skeleton-meta">
							<view class="skeleton-tag"></view>
							<view class="skeleton-price"></view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 内容列表 -->
			<template v-else>
				<view v-for="course in courses" :key="course.id" class="course-card">
					<view class="media-box" @click="goDetail(course)">
						<image :src="course.photoUrl || defaultCover" mode="aspectFill" class="course-cover" />
					</view>
					<view class="card-body">
						<view class="info-row">
							<view class="info-left">
								<text class="course-title">{{ course.courseName || '未命名课程' }}</text>
								<view class="type-price">
									<text class="course-type">{{ courseTypeText(course.courseType) }}</text>
									<text class="course-price" :class="{ 'free': course.paymentMethod === 1 }">
										{{ priceLabel(course) }}
									</text>
								</view>
							</view>
							<view class="info-right">
								<text class="course-count">课程人数: {{ participantsLabel(course) }}</text>
								<button class="enroll-btn" @click.stop="goDetail(course)">
									{{ course.enrolled ? '已报名' : '报名' }}
								</button>
							</view>
						</view>
					</view>
				</view>
			</template>
			
			<!-- 空状态 -->
			<view v-if="!courses.length && !loading && !isFirstLoad" class="empty-state">
				<text>暂无课程，敬请期待</text>
			</view>
		</view>
		<view class="load-footer">
			<text v-if="loading && courses.length > 0">加载中...</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		onLoad,
		onPullDownRefresh,
		onReachBottom,
		onShow
	} from '@dcloudio/uni-app'
	import {
		fetchCourseList
	} from '@/api/Curriculum'

	const defaultCover = '/static/index/video.png'
	const courses = ref([])
	const loading = ref(false)
	const finished = ref(false)
	const loadLock = ref(false)
	const isFirstLoad = ref(true)
	const pager = ref({
		pageNum: 1,
		pageSize: 10,
		status:1
	})

	const courseTypeText = (type) => {
		if (type === 1) return '线下'
		if (type === 2) return '线上'
		return '未知类型'
	}

	const paymentMethodText = (method) => {
		if (method === 1) return '免费课程'
		if (method === 2) return '直接支付'
		if (method === 3) return '线下支付'
		return '收费方式未知'
	}

	const statusText = (status) => {
		const map = {
			0: '草稿',
			1: '已发布',
			2: '已下线',
			3: '已截止'
		}
		return map[status] || '未知状态'
	}

	const participantsLabel = (course) => {
		if (course.maxParticipants) {
			return `${course.enrolledParticipants || 0}/${course.maxParticipants}`
		}
		return course.enrolledParticipants || 0
	}

	const priceLabel = (course) => {
		if (course.paymentMethod === 1) return '免费'
		return course.price ? `¥ ${Number(course.price).toFixed(2)}` : '¥ --'
	}

	const goDetail = (course) => {
		if (!course?.id) return
		uni.navigateTo({
			url: `/pages/Curriculum/detail?id=${course.id}`
		})
	}

	const parseList = (res) => {
		return res.rows || res.data?.rows || res.data?.records || res.data || []
	}

	const updatePagerAfterLoad = (listLength, total) => {
		if (listLength < pager.value.pageSize) {
			finished.value = true
			return
		}
		if (total && courses.value.length >= total) {
			finished.value = true
			return
		}
		pager.value.pageNum += 1
	}

	const loadCourses = async (reset = false, silent = false) => {
		if (loadLock.value || (finished.value && !reset)) return
		loadLock.value = true
		
		// 只有首次加载且非静默模式时显示骨架屏
		if (reset && isFirstLoad.value && !silent) {
			loading.value = true
		} else if (!silent && !reset) {
			// 加载更多时显示加载提示
			loading.value = true
		} else {
			// 静默刷新时不显示 loading
			loading.value = false
		}
		
		try {
			if (reset) {
				pager.value.pageNum = 1
				finished.value = false
				isFirstLoad.value = false
				// 注意：刷新时不要先清空数据，等新数据回来后再替换
			}
			const res = await fetchCourseList({
				pageNum: pager.value.pageNum,
				pageSize: pager.value.pageSize,
				status:1
			})
			if (res.code === 200) {
				const list = parseList(res)
				// 直接替换，不清空旧数据，利用 Vue 响应式实现无感更新
				courses.value = reset ? list : [...courses.value, ...list]
				const total = res.total || res.data?.total || 0
				updatePagerAfterLoad(list.length, total)
			}
		} catch (error) {
			console.error('加载课程失败', error)
			// 请求失败时，如果是刷新才清空数据
			if (reset) courses.value = []
		} finally {
			loading.value = false
			loadLock.value = false
		}
	}

	onShow(async () => {
		await loadCourses(true)
	})

	onPullDownRefresh(async () => {
		// 下拉刷新时使用静默刷新，不显示骨架屏
		await loadCourses(true, true)
		uni.stopPullDownRefresh()
	})

	onReachBottom(async () => {
		await loadCourses()
	})
</script>

<style scoped lang="scss">
	.course-page {
		min-height: 100vh;
		background: #f5f6fa;
		padding-bottom: 24rpx;
	}

	.course-list {
		padding: 24rpx;
	}

	.course-card {
		background-color: #fff;
		border-radius: 24rpx;
		margin-bottom: 28rpx;
		box-shadow: 0 16rpx 32rpx rgba(11, 25, 72, 0.12);
		border: none;
		position: relative;
		overflow: hidden;
		transform: translateZ(0);
	}

	.media-box {
		position: relative;
		overflow: hidden;
		width: 100%;
		padding-bottom: 42.86%; /* 9/21 = 0.4286 = 42.86% */
		border-radius: 24rpx 24rpx 0 0;
	}

	.course-cover {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
	}

	.card-body {
		padding: 24rpx;
		border: none;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0;
		gap: 24rpx;
	}

	.course-title {
		font-size: 30rpx;
		color: #111827;
		font-weight: 600;
		line-height: 1.4;
		max-width: 360rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.type-price {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.course-type {
		font-size: 22rpx;
		color: #2563eb;
		padding: 4rpx 14rpx;
		border-radius: 999rpx;
		background: rgba(37, 99, 235, 0.06);
	}

	.course-price {
		font-size: 28rpx;
		color: #e11d48;
		font-weight: 600;
	}

	.course-price.free {
		color: #ff4d4f;
	}

	.info-right {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 20rpx;
	}

	.course-count {
		font-size: 24rpx;
		color: #808080;
		white-space: nowrap;
	}

	.enroll-btn {
		position: static;
		width: 100rpx; /* 約 50px */
		height: 56rpx; /* 約 28px */
		border-radius: 40rpx;
		background: #5278FF;
		color: #fff;
		font-size: 26rpx;
		border: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 24rpx;
		gap: 20rpx;
		margin: 0;
		line-height: 1;
		white-space: nowrap;
		box-shadow: 0 8rpx 18rpx rgba(82, 120, 255, 0.25);
		z-index: 1;
	}


	.empty-state {
		padding: 120rpx 0;
		text-align: center;
		color: #b0b0c3;
	}

	.load-footer {
		text-align: center;
		color: #8c8c9b;
		font-size: 24rpx;
		padding-bottom: 30rpx;
	}

	/* 骨架屏样式 */
	.skeleton-list {
		padding: 24rpx;
	}

	.skeleton-card {
		background: #ffffff;
		border-radius: 20rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 12rpx 30rpx rgba(15, 35, 95, 0.06);
		overflow: hidden;
	}

	.skeleton-media {
		width: 100%;
		padding-bottom: 42.86%;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
	}

	.skeleton-body {
		padding: 18rpx 4rpx 20rpx;
	}

	.skeleton-title {
		height: 30rpx;
		width: 60%;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		border-radius: 6rpx;
		margin-bottom: 16rpx;
		animation: skeleton-loading 1.5s ease-in-out infinite;
	}

	.skeleton-meta {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.skeleton-tag {
		height: 30rpx;
		width: 80rpx;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		border-radius: 999rpx;
		animation: skeleton-loading 1.5s ease-in-out infinite;
	}

	.skeleton-price {
		height: 28rpx;
		width: 120rpx;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		border-radius: 6rpx;
		animation: skeleton-loading 1.5s ease-in-out infinite;
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