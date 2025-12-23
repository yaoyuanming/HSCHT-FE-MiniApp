<template>
	<view class="detail-page">
		<view class="course-detail">
			<view v-if="loading" class="loading">
				<view class="skeleton media"></view>
				<view class="skeleton info"></view>
				<view class="skeleton rich"></view>
			</view>

			<view v-else-if="!course">
				<view class="empty-tip">未找到课程信息</view>
			</view>
			<view v-else class="content">
				<view class="top-card">
					<view class="top-card-body">
						<view class="top-card-title">
							{{ course.activityName }}
						</view>

						<view class="top-card-row">
							<view class="top-card-left">
								<view class="type-price">
									<text class="course-type">
										{{ isOnlineCourse ? '线上' : '线下' }}
									</text>
									<text class="top-card-price" :class="{ free: !needPay }">
										{{ priceDisplay }}
									</text>
								</view>
							</view>
							<view class="top-card-right">
								<text class="top-card-people">
									人数：--
								</text>
							</view>
						</view>
					</view>

					<view class="media-wrapper">
						<template v-if="course.contentUrl">
							<!-- #ifdef MP-WEIXIN -->
							<video
								:src="course.contentUrl"
								controls
								:show-center-play-btn="true"
								:show-play-btn="true"
								:show-fullscreen-btn="true"
								:show-progress="true"
								:enable-progress-gesture="true"
								object-fit="contain"
								class="media-player video-player"
							></video>
							<!-- #endif -->
							<!-- #ifndef MP-WEIXIN -->
							<hic-video-player
								:src="course.contentUrl"
								:controls="true"
								width="100%"
								class="media-player video-player"
							></hic-video-player>
							<!-- #endif -->
						</template>

						<template v-else>
							<image :src="course.activityImageUrl || defaultCover" mode="aspectFill" class="media-player" />
						</template>
					</view>
				</view>

				<view class="info-card">
					<view class="info-card-title">活动详情</view>

					<view class="intro-box">
						<rich-text :nodes="course.introduction || '<p>暂无介绍</p>'"></rich-text>
					</view>

					<view class="course-extra" v-if="course?.address || courseTimeText !== '待定'">
						<view class="info-item" v-if="course?.address">
							<text class="label">活动地址：</text>
							<text class="value">{{ course.address }}</text>
						</view>
						<view class="info-item" v-if="courseTimeText !== '待定'">
							<text class="label">活动时间：</text>
							<text class="value">{{ courseTimeText }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="bottom-bar" v-if="course">
				<button class="primary-btn" @click="handlePrimaryAction">
					{{ primaryText }}
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { getActivityDetail } from '@/api/activity'

const defaultCover = '/static/index/video.png'

const course = ref(null)
const loading = ref(true)
const currentId = ref(null)

const isOnlineCourse = computed(() => Number(course.value?.type) === 1)
const isOfflineCourse = computed(() => Number(course.value?.type) === 0)
const needPay = computed(() => {
	if (!course.value) return false
	return Number(course.value?.paymentMethod) !== 1
})
const canPlayVideo = computed(() => {
	if (!course.value) return false
	// 免费内容允许直接播放；如果后端后续返回“已购买/已报名”字段，可在这里追加判断
	if (Number(course.value?.paymentMethod) === 1) return true
	return !!course.value?.enrolled
})

const courseTimeText = computed(() => {
	if (!course.value) return '待定'
	const start = course.value?.activityTimeStart
	const end = course.value?.activityTimeEnd
	if (!start && !end) return '待定'
	if (start && end) return `${start} ~ ${end}`
	return start || end
})

const priceDisplay = computed(() => {
	if (!course.value) return '¥ --'
	if (Number(course.value.paymentMethod) === 1) return '免费'
	const hasPrice = course.value.price !== null && course.value.price !== undefined
	return hasPrice ? `¥ ${Number(course.value.price).toFixed(2)}` : '¥ --'
})

const primaryText = computed(() => {
	return needPay.value ? '立即购买' : '立即报名'
})

const loadDetail = async (id) => {
	loading.value = true
	try {
		if (!id) {
			course.value = null
			return
		}
		const res = await getActivityDetail(id)
		course.value = res?.data || null
	} finally {
		loading.value = false
	}
}

const handlePrimaryAction = async () => {
	uni.showToast({
		title: '暂不支持报名/购买',
		icon: 'none'
	})
}

const goBack = () => {
	uni.navigateBack()
}


onLoad(async (options) => {
	currentId.value = options?.id ? decodeURIComponent(options.id) : options?.id
	await loadDetail(currentId.value)
})

onPullDownRefresh(async () => {
	await loadDetail(currentId.value)
	uni.stopPullDownRefresh()
})
</script>

<style>
page {
	background-color: #F8F8F8;
}
</style>

<style scoped lang="scss">
.detail-page {
	padding: 24rpx;
	padding-bottom: 140rpx;
	background: #f5f6fa;
}

.course-detail {
	min-height: 100vh;
	background: #f5f6fa;
}

.loading {
	padding: 32rpx;

	.skeleton {
		background: #ececec;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		animation: shimmer 1.5s infinite;
	}

	.media {
		height: 360rpx;
	}

	.info {
		height: 160rpx;
	}

	.rich {
		height: 320rpx;
	}
}

@keyframes shimmer {
	0% {
		opacity: 0.6;
	}

	50% {
		opacity: 1;
	}

	100% {
		opacity: 0.6;
	}
}

.top-card {
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
	margin-bottom: 24rpx;
}

.top-card-body {
	padding: 20rpx 24rpx 24rpx;
}

.top-card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #111827;
	margin-bottom: 12rpx;
}

.top-card-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.top-card-price {
	font-size: 30rpx;
	color: #e11d48;
	font-weight: 600;
	margin-left: 4rpx;
}

.top-card-price.free {
	color: #ff4d4f;
}

.top-card-right .top-card-people {
	font-size: 24rpx;
	color: #666;
	white-space: nowrap;
	height: 30rpx;
	line-height: 30rpx;
	display: inline-block;
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

.media-wrapper {
	position: relative;
	width: 100%;
	padding-bottom: 42.86%;
	overflow: hidden;
}

.media-player {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: block;
}

.media-player.video-player {
	background: #000;
}

.video-locked {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.locked-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
}

.info-card {
	margin-top: 24rpx;
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
	padding: 24rpx 28rpx 32rpx;
	min-height: auto;
}

.info-card-title {
	font-size: 30rpx;
	font-weight: 600;
	text-align: center;
	color: #111827;
	margin-bottom: 20rpx;
}

.intro-box {
	font-size: 26rpx;
	color: #4b5563;
	line-height: 1.6;
	min-height: auto;
	word-wrap: break-word;
}

.course-extra {
	margin-top: 24rpx;
	border-top: 1rpx solid #f3f4f6;
	padding-top: 16rpx;
}

.info-item {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.info-item:last-child {
	margin-bottom: 0;
}

.label {
	font-size: 24rpx;
	color: #666;
	margin-right: 8rpx;
	font-weight: 400;
	flex-shrink: 0;
}

.value {
	font-size: 24rpx;
	color: #444;
	word-break: break-all;
	line-height: 1.5;
	font-weight: 400;
	flex: 1;
	user-select: text;
	-webkit-user-select: text;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 20rpx 28rpx;
	background: #fff;
	box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.08);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.primary-btn {
	background: #5278ff;
	color: #fff;
	border: none;
	border-radius: 999rpx;
	padding: 0 48rpx;
	height: 86rpx;
	line-height: 86rpx;
	font-size: 30rpx;
	width: 100%;
}

.empty-tip {
	padding: 160rpx 0;
	text-align: center;
	color: #a0a0b5;
	font-size: 28rpx;
}
</style>
