<template>
	<view class="course-page">
		<!-- 自定义导航栏 -->
		<view class="custom-nav-bar">
			<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="nav-content">
				<view class="nav-left">
					<uni-icons type="arrowleft" size="24" color="#333333"></uni-icons>
					<text class="nav-title">出海课程</text>
				</view>
				<view class="nav-right">
					<uni-icons type="search" size="24" color="#333333" class="nav-icon"></uni-icons>
					<uni-icons type="notification" size="24" color="#333333" class="nav-icon"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 占位符，防止内容被导航遮挡 -->
		<view class="content-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

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
	import { ref } from 'vue'
	import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'

	const defaultCover = '/static/index/video.png'
	const statusBarHeight = ref(20)
	const courses = ref([])
	const loading = ref(false)
	const finished = ref(false)
	const loadLock = ref(false)
	const isFirstLoad = ref(true)
	const pager = ref({
		pageNum: 1,
		pageSize: 10
	})

	const mockCourses = (pageNum, pageSize) => {
		const base = (pageNum - 1) * pageSize
		return Array.from({ length: pageSize }).map((_, idx) => {
			const i = base + idx + 1
			return {
				id: String(i),
				courseName: `示例课程 ${i}`,
				courseType: i % 2 === 0 ? 2 : 1,
				paymentMethod: 1,
				price: 0,
				photoUrl: '',
				enrolled: i % 5 === 0,
				enrolledParticipants: Math.floor(Math.random() * 200),
				maxParticipants: i % 3 === 0 ? 200 : null
			}
		})
	}

	const courseTypeText = (type) => {
		if (type === 1) return '线下'
		if (type === 2) return '线上'
		return '未知类型'
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
			url: `/pages/Course/detail?id=${course.id}`
		})
	}

	const updatePagerAfterLoad = (listLength) => {
		if (listLength < pager.value.pageSize) {
			finished.value = true
			return
		}
		pager.value.pageNum += 1
	}

	const loadCourses = async (reset = false, silent = false) => {
		if (loadLock.value || (finished.value && !reset)) return
		loadLock.value = true

		if (reset && isFirstLoad.value && !silent) {
			loading.value = true
		} else if (!silent && !reset) {
			loading.value = true
		} else {
			loading.value = false
		}

		try {
			if (reset) {
				pager.value.pageNum = 1
				finished.value = false
				isFirstLoad.value = false
			}

			await new Promise((r) => setTimeout(r, 600))
			const list = mockCourses(pager.value.pageNum, pager.value.pageSize)
			courses.value = reset ? list : [...courses.value, ...list]
			updatePagerAfterLoad(list.length)
		} finally {
			loading.value = false
			loadLock.value = false
		}
	}

	onLoad(() => {
		const sysInfo = uni.getSystemInfoSync()
		statusBarHeight.value = sysInfo.statusBarHeight || 20
	})

	onShow(async () => {
		await loadCourses(true)
	})

	onPullDownRefresh(async () => {
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

	.custom-nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #ffffff;
		z-index: 101;
	}

	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
	}

	.nav-left {
		display: flex;
		align-items: center;
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333333;
		margin-left: 10rpx;
	}

	.nav-right {
		display: flex;
		align-items: center;
	}

	.nav-icon {
		margin-left: 30rpx;
	}

	.content-placeholder {
		width: 100%;
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
		padding-bottom: 42.86%;
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
		width: 100rpx;
		height: 56rpx;
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
