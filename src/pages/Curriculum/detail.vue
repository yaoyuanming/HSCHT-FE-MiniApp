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
		  <!-- 顶部卡片：标题 + 价格 + 报名人数，上面；图片/视频在下 -->
		  <view class="top-card">
			<view class="top-card-body">
			  <view class="top-card-title">
				{{ course.courseName }}
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
					课程人数：{{ course.enrolledParticipants || 0 }}/{{ course.maxParticipants || '不限' }}
				  </text>
				</view>
			  </view>
			</view>

			<!-- 媒体区域：有视频优先展示视频，否则展示封面图 -->
			<view class="media-wrapper">
			  <!-- 线上课程且有视频地址时展示视频 -->
			  <template v-if="isOnlineCourse && course.videoUrl">
				<!-- #ifdef MP-WEIXIN -->
				<video
				  v-if="canPlayVideo"
				  :src="course.videoUrl"
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
				  v-if="canPlayVideo"
				  :src="course.videoUrl"
				  :controls="true"
				  width="100%"
				  class="media-player video-player"
				></hic-video-player>
				<!-- #endif -->

				<!-- 未报名时显示封面图加遮罩 -->
				<view v-if="!canPlayVideo" class="video-locked">
				  <image
					:src="course.photoUrl || defaultCover"
					mode="aspectFill"
					class="media-player"
				  />
				  <view class="locked-mask">
					<text>购买后观看视频</text>
				  </view>
				</view>
			  </template>

			  <!-- 线下课程或无视频时仅展示封面图（占满容器） -->
			  <template v-else>
				<image
				  :src="course.photoUrl || defaultCover"
				  mode="aspectFill"
				  class="media-player"
				/>
			  </template>
			</view>
		  </view>
  
		  <!-- 详情卡片：课程介绍 + 地址时间 -->
		  <view class="info-card">
			<view class="info-card-title">课程详情</view>
  
			<view class="intro-box">
			  <rich-text :nodes="course.courseIntroduction || '<p>暂无介绍</p>'"></rich-text>
			</view>
  
			<view class="course-extra" v-if="isOfflineCourse">
			  <view class="info-item">
				<text class="label">课程地址：</text>
				<text class="value">{{ course.courseAddress || '待定' }}</text>
			  </view>
			  <view class="info-item">
				<text class="label">课程时间：</text>
				<text class="value">{{ course.courseTime || '待定' }}</text>
			  </view>
			</view>
		  </view>
		</view>
  
		<view class="bottom-bar" v-if="course">
		  <button
			v-if="showPurchaseButton"
			class="primary-btn"
			@click="handlePrimaryAction"
		  >
			{{ primaryText }}
		  </button>
		  <view v-else class="enrolled-flag">已报名</view>
		</view>
  
		<PhoneAuthPopup
		  v-model:show="phoneShow"
		  title="需要手机号登录"
		  desc="首次报名请授权手机号用于确认身份"
		  @success="handlePhoneSuccess"
		  @cancel="closePhonePopup"
		/>
  
		<PaymentSheet
		  v-model:show="paySheetVisible"
		  :options="paymentOptions"
		  :current="paymentMethod"
		  :balance-status="balanceStatusText"
		  :confirm-loading="isPaying"
		  @select="handelChangePlay"
		  @confirm="handlePay"
		/>
	  </view>
	</view>
  </template>



<script setup>

import {

	ref,

	computed

} from 'vue'

import {

	onLoad,

	onPullDownRefresh

} from '@dcloudio/uni-app'

import {

	fetchCourseDetail,

	purchaseCourse

} from '@/api/Curriculum'

import {

	usePhoneAuthorization,

	usePurchaseFlow

} from '@/composables/usePurchaseFlow.js'

import PhoneAuthPopup from '@/components/PhoneAuthPopup.vue'

import PaymentSheet from '@/components/PaymentSheet.vue'



const defaultCover = '/static/index/video.png'



const course = ref(null)

const loading = ref(true)

const paySheetVisible = ref(false)

const enrolling = ref(false)

const currentId = ref(null)



const {

	phoneShow,

	hasPhone,

	openPhonePopup,

	closePhonePopup,

	applyPhoneNumber

} = usePhoneAuthorization()



const {

	paymentOptions,

	paymentMethod,

	balanceInfo,

	readableBalance,

	refreshBalance,

	selectPaymentMethod,

	isPaying,

	pay

} = usePurchaseFlow()



const isOnlineCourse = computed(() => course.value?.courseType === 2)

const isOfflineCourse = computed(() => course.value?.courseType === 1)

const isDirectPayment = computed(() => course.value?.paymentMethod === 2)

const isOfflinePayment = computed(() => course.value?.paymentMethod === 3)

const needPay = computed(() => !!course.value && isDirectPayment.value)

const canPlayVideo = computed(() => !!course.value?.enrolled)



const priceDisplay = computed(() => {

	if (!course.value) return '¥ --'

	if (course.value.paymentMethod === 1) return '免费'

	return course.value.price ? `¥ ${Number(course.value.price).toFixed(2)}` : '¥ --'

})



const paymentMethodText = computed(() => {

	if (!course.value) return ''

	if (course.value.paymentMethod === 1) return '免费课程'

	if (course.value.paymentMethod === 2) return '直接支付'

	if (course.value.paymentMethod === 3) return '线下支付'

	return '收费方式未知'

})



const statusText = computed(() => {

	const map = {

		0: '草稿',

		1: '已发布',

		2: '已下线',

		3: '已截止'

	}

	return map[course.value?.status] || '未知状态'

})



const primaryText = computed(() => {

	if (course.value?.enrolled) return '已报名'

	return needPay.value ? '立即购买' : '立即报名'

})



const showPurchaseButton = computed(() => {

	return !!course.value && !course.value.enrolled

})



const balanceStatusText = computed(() => {

	const cents = Number(balanceInfo.value.availableBalance || 0)

	if (!cents) return '余额不足'

	if (course.value?.price && cents < Number(course.value.price) * 100) return '余额不足'

	return readableBalance.value

})



const handelChangePlay = (option) => {

	selectPaymentMethod(option.value, course.value?.price || 0)

}



const handlePhoneSuccess = async (phone) => {

	applyPhoneNumber(phone)

	if (isDirectPayment.value) {

		paySheetVisible.value = true

		return

	}

	if (isOfflinePayment.value) {

		await handlePay()

		return

	}

	await submitEnroll()

}



const loadDetail = async (id) => {

	loading.value = true

	try {

		const res = await fetchCourseDetail(id)

		if (res.code === 200) {

			course.value = res.data

			await refreshBalance(res.data?.price || 0)

		} else {

			course.value = null

		}

	} catch (error) {

		console.error('加载课程详情失败', error)

		course.value = null

	} finally {

		loading.value = false

	}

}



const submitEnroll = async () => {

	if (enrolling.value || !course.value) return false

	enrolling.value = true

	try {

		const payType = paymentMethod.value === 'weixin' ? 'WECHAT' : 'BALANCE'

		const amount = isOnlineCourse.value ? Number(course.value.price) : 0

		const payload = {

			courseId: course.value.id,

			courseName: course.value.courseName,

			consumptionAmount: Math.round(amount * 100),

			customerName: uni.getStorageSync('userInfo')?.user?.nickName || '',

			contactPhone: uni.getStorageSync('userPhone'),

			payType

		}

		const res = await purchaseCourse(payload)



		if (res.code === 200) {

			course.value.enrolled = true

			await loadDetail(currentId.value)

			uni.showToast({

				title: '报名成功',

				icon: 'success',

				duration: 2000

			})

			return true

		}



		uni.showToast({

			title: res.msg || '报名失败，请稍后重试',

			icon: 'none'

		})

		return false

	} catch (error) {

		// 只打印精简信息，避免控制台过多噪音
		const errMsg = error?.msg || '报名失败，请稍后重试'
		uni.showToast({

			title: errMsg,
			icon: 'none'

		})

		return false

	} finally {

		enrolling.value = false

	}

}



const handlePay = async () => {

	if (!course.value || isPaying.value) return



	const success = await pay({

		amount: course.value.paymentMethod == 3 ? 0 : Number(course.value.price),

		description: course.value.courseName,

		orderPayload: {

			courseId: course.value.id,

			courseName: course.value.courseName

		},

		useCourseApi: true, // 使用课程购买接口

		allowZeroAmount: course.value.paymentMethod == 3,

		onAfterPay: async () => {

			course.value.enrolled = true

			course.value.enrolledParticipants = (course.value.enrolledParticipants || 0) + 1

			closePaySheet()

			await loadDetail(currentId.value) // 刷新课程详情

			uni.showToast({

				title: '购买成功',

				icon: 'success',

				duration: 2000

			})

		}

	})

	if (success) {

		closePaySheet()

	}

}



const handlePrimaryAction = async () => {

	if (!course.value || course.value.enrolled) return



	const requiresPhone = (isDirectPayment.value || isOfflinePayment.value)

	if (requiresPhone && !hasPhone.value) {

		openPhonePopup()

		return

	}



	if (isDirectPayment.value) {

		paySheetVisible.value = true

		return

	}



	if (isOfflinePayment.value) {

		await handlePay()

		return

	}



	await submitEnroll()

}



const closePaySheet = () => {

	paySheetVisible.value = false

}



onLoad(async (options) => {

	currentId.value = options?.id

	if (currentId.value) {

		await loadDetail(currentId.value)

	}

})



onPullDownRefresh(async () => {

	if (currentId.value) {

		await loadDetail(currentId.value)

	}

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

/* 加载骨架 */
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

.content {
  /* 卡片已经有左右留白，这里不需要再 padding */
}

/* 顶部大卡片：图片 + 标题 + 价格 + 人数 */
.top-card {
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24rpx;
}

.top-card-img {
  width: 100%;
  height: 320rpx;
  display: block;
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

.top-card-left {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.top-card-paytype {
  font-size: 26rpx;
  color: #2563eb;
  margin-right: 16rpx;
}

.price-label {
  margin-left: 8rpx;
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

.top-card-right {
  display: flex;
  align-items: center; /* 报名人数垂直居中 */
}

.top-card-right .top-card-people {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
  height: 30rpx;
  line-height: 30rpx;
  display: inline-block;
}

/* 课程类型标签 + 价格（复用列表页样式） */
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

/* 媒体容器：视频 / 图片 */
.media-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 42.86%; /* 9/21 = 0.4286 = 42.86% */
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

/* 下方详情卡片：介绍 + 地址时间 */
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

/* 地址/时间行 */
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

/* 底部报名按钮区域 */
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

.primary-btn:disabled {
  background: #dcdce6;
  color: #999;
}

.enrolled-flag {
  font-size: 28rpx;
  background-color: #00b578;
  color: #fff;
  padding: 28rpx;
  width: 100%;
  text-align: center;
  border-radius: 30rpx;
  font-weight: 600;
}

/* 空状态 */
.empty-tip {
  padding: 160rpx 0;
  text-align: center;
  color: #a0a0b5;
  font-size: 28rpx;
}
</style>