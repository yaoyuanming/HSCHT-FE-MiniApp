<template>
	<view class="course-page">
		<view class="course-list">
			<view v-if="loading && courses.length === 0 && isFirstLoad" class="skeleton-list">
				<view v-for="i in 3" :key="i" class="skeleton-card">
					<view class="skeleton-media"></view>
					<view class="skeleton-body">
						<view class="skeleton-line-long"></view>
						<view class="skeleton-meta-row">
							<view class="skeleton-line-short"></view>
							<view class="skeleton-btn-box"></view>
						</view>
					</view>
				</view>
			</view>
			
			<template v-else>
				<view 
					v-for="(course, index) in courses" 
					:key="course.id" 
					class="course-card" 
					@click="goDetail(course.id)"
				>
					<view class="media-box">
						<image 
							:src="course.activityImageUrl || defaultCover" 
							mode="aspectFill" 
							class="course-cover" 
						/>
					</view>
					
					<view class="card-body">
						<text class="course-title">{{ course.activityName || '未命名课程' }}</text>
						
						<view class="info-row">
							<view class="info-left">
								<text class="course-type-tag">{{ courseTypeText(course.type) }}</text>
								<text class="course-price" :class="{ 'free': Number(course.paymentMethod) === 1 }">
									{{ priceLabel(course) }}
								</text>
							</view>
							
							<view class="info-right">
								<text class="course-count">课程人数: {{ participantsLabel(course) }}</text>
								
								<button class="enroll-btn" @click.stop="goDetail(course.id)">
									{{ course.enrolled ? '已报名' : '报名' }}
								</button>
							</view>
						</view>
					</view>
				</view>
			</template>
			
			<view v-if="!courses.length && !loading && !isFirstLoad" class="empty-state">
				<image src="/static/empty.png" mode="aspectFit" class="empty-img" v-if="false"></image>
				<text>暂无课程，敬请期待</text>
			</view>

			<view class="load-footer" v-if="courses.length > 0">
				<text v-if="loading">正在加载...</text>
				<text v-else-if="finished && courses.length >= pager.pageSize">—— 已经到底啦 ——</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
	import { getActivityList } from '@/api/activity'

	// 响应式变量
	const defaultCover = '/static/index/video.png'
	const courses = ref([])
	const loading = ref(false)
	const finished = ref(false)
	const isFirstLoad = ref(true)
	const pager = ref({
		pageNum: 1,
		pageSize: 10
	})
	
	// 防止重复点击锁
	let isNavigating = false

	// 工具函数
	const courseTypeText = (type) => {
		const t = Number(type)
		return t === 0 ? '线下' : (t === 1 ? '线上' : '内测')
	}

	const participantsLabel = (course) => {
		if (course.maxParticipants) {
			return `${course.enrolledParticipants || 0}/${course.maxParticipants}`
		}
		return course.enrolledParticipants || 0
	}

	const priceLabel = (course) => {
		if (Number(course.paymentMethod) === 1) return '免费'
		return course.price != null ? `¥${Number(course.price).toFixed(2)}` : '¥ --'
	}

	const goDetail = (id) => {
		if (!id || isNavigating) return
		isNavigating = true
		
		uni.navigateTo({
			url: `/pages/Course/detail?id=${encodeURIComponent(id)}`,
			complete: () => {
				isNavigating = false
			}
		})
	}

	const loadCourses = async (reset = false, silent = false) => {
		if (loading.value || (finished.value && !reset)) return
		
		loading.value = !silent
		
		if (reset) {
			pager.value.pageNum = 1
			finished.value = false
		}

		try {
			const res = await getActivityList({
				status: '1',
				pageNum: pager.value.pageNum,
				pageSize: pager.value.pageSize
			})

			const list = res?.rows || []

			if (reset) {
				courses.value = list
				isFirstLoad.value = false
			} else {
				courses.value = [...courses.value, ...list]
			}

			// 判断是否还有更多数据
			if (list.length < pager.value.pageSize) {
				finished.value = true
			} else {
				pager.value.pageNum++
			}
		} catch (e) {
			console.error(e)
			uni.showToast({ title: '加载失败', icon: 'none' })
		} finally {
			loading.value = false
		}
	}

	onLoad(() => {})

	onShow(() => {
		loadCourses(true, true)
	})

	onPullDownRefresh(async () => {
		await loadCourses(true, true)
		uni.stopPullDownRefresh()
	})

	onReachBottom(() => {
		loadCourses()
	})
</script>

<style scoped lang="scss">
	.course-page {
		min-height: 100vh;
		background: #f7f8fa; // 浅灰色背景
	}

	.course-list {
		padding: 30rpx;
	}

	.course-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
		position: relative; 
		z-index: 1;       
		transform: translateZ(0); 
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		
		&:active {
			opacity: 0.95;
		}
	}

	.media-box {
		width: 100%;
		height: 380rpx;
		background-color: #f0f0f0;
		position: relative;
	}

	.course-cover {
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none; 
	}

	.card-body {
		padding: 24rpx 30rpx;
	}

	.course-title {
		display: block;
		font-size: 32rpx;
		color: #1a1a1a;
		font-weight: bold;
		line-height: 1.4;
		margin-bottom: 20rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-left {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 16rpx;
	}

	.course-type-tag {
		font-size: 20rpx;
		color: #2563eb;
		background: rgba(37, 99, 235, 0.08);
		padding: 4rpx 14rpx;
		border-radius: 6rpx;
		width: fit-content;
	}

	.course-price {
		font-size: 32rpx;
		color: #ff4d4f;
		font-weight: bold;
		&.free { color: #52c41a; }
	}

	.info-right {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 20rpx;
	}

	.course-count {
		font-size: 24rpx;
		color: #999;
	}

	.enroll-btn {
		width: 150rpx;
		height: 64rpx;
		line-height: 64rpx;
		background: #5278FF;
		color: #fff;
		font-size: 28rpx;
		border-radius: 32rpx;
		padding: 0;
		margin: 0;
		border: none;
		box-shadow: 0 6rpx 12rpx rgba(82, 120, 255, 0.2);
		
		&::after { border: none; }
	}

	/* 辅助样式 */
	.empty-state {
		padding: 200rpx 0;
		text-align: center;
		color: #ccc;
		font-size: 28rpx;
	}
	.load-footer {
		text-align: center;
		font-size: 24rpx;
		color: #bbb;
		padding: 20rpx 0;
	}

	/* 骨架屏动画 */
	@keyframes skeleton-loading {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
	.skeleton-card {
		background: #fff;
		border-radius: 24rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
	}
	.skeleton-media {
		width: 100%; height: 380rpx;
		background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 50%, #f2f2f2 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}
	.skeleton-body { padding: 30rpx; }
	.skeleton-line-long {
		width: 80%; height: 32rpx; background: #f2f2f2; margin-bottom: 20rpx;
	}
	.skeleton-meta-row {
		display: flex; justify-content: space-between; align-items: center;
	}
	.skeleton-line-short { width: 30%; height: 32rpx; background: #f2f2f2; }
	.skeleton-btn-box { width: 150rpx; height: 60rpx; background: #f2f2f2; border-radius: 30rpx; }
</style>