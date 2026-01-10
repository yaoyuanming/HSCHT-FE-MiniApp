<template>
	<up-popup :show="innerShow" type="center" :mask-click="false" @close="handleClose">
		<view class="auth-popup">
			<view class="popup-title">{{ title }}</view>
			<view class="popup-desc">{{ desc }}</view>
			<button class="auth-btn" open-type="getPhoneNumber" @getphonenumber="handlePhoneAuth">
				<uni-icons type="phone" size="28rpx" color="#fff" class="auth-icon" />
				授权手机号
			</button>
			<view class="cancel-btn" @click="handleCancel">取消</view>
		</view>
	</up-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { DecryptionMobilePhone } from '@/api/user.js'
import { utilsConfig } from '@/config/utils.js'

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: '请授权手机号'
	},
	desc: {
		type: String,
		default: '购买前需要验证您的手机号'
	}
})

const emit = defineEmits(['update:show', 'success', 'cancel'])

const innerShow = ref(props.show)
const loading = ref(false)

watch(() => props.show, (val) => {
	innerShow.value = val
})

watch(innerShow, (val) => {
	emit('update:show', val)
})

const handleClose = () => {
	if (!innerShow.value) return
	innerShow.value = false
}

const handleCancel = () => {
	innerShow.value = false
	emit('cancel')
}

const handlePhoneAuth = async (event) => {
	if (loading.value) return
	if (event.detail.errMsg !== 'getPhoneNumber:ok') {
		uni.showToast({
			title: '需要授权手机号',
			icon: 'none'
		})
		return
	}

	loading.value = true
	try {
		const res = await DecryptionMobilePhone({
			code: event.detail.code,
			platform: utilsConfig.wxCode
		})
		if (res.code === 200) {
			emit('success', res.data.phoneNumber)
			innerShow.value = false
			uni.showToast({
				title: '授权成功',
				icon: 'success'
			})
		} else {
			uni.showToast({
				title: res.msg || '授权失败，请重试',
				icon: 'none'
			})
		}
	} catch (error) {
		uni.showToast({
			title: error.message || '授权失败，请重试',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}
</script>

<style scoped>
.auth-popup {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 40rpx 30rpx;
	text-align: center;
}

.popup-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 15rpx;
}

.popup-desc {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 30rpx;
	line-height: 1.6;
}

.auth-btn {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	background-color: #5278ff;
	color: #fff;
	font-size: 30rpx;
	border-radius: 80rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;
}

.auth-icon {
	margin-right: 10rpx;
}

.cancel-btn {
	font-size: 28rpx;
	color: #999;
	padding: 15rpx 0;
}
</style>

