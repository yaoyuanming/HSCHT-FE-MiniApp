<template>
	<up-popup :show="innerVisible" title="充值" :custom-style="{ padding: '0', borderRadius: '16rpx' }" @close="handleClose" :mask-click="false">
		<view class="recharge-page">
			<view class="title">充值</view>
			<view class="content">
				<view class="preset-amounts">
					<view class="amount-grid">
						<view v-for="(amount, index) in presetAmounts" :key="index" class="amount-item" :class="{ 'amount-item-active': selectedAmount === amount }" @click="handleAmountClick(amount)">
							{{ amount }}
						</view>
					</view>
				</view>

				<view class="custom-amount">
					<text class="custom-title">自定义金额</text>
					<view class="custom-input-wrap">
						<input v-model="customAmount" placeholder="请输入充值金额" type="text" class="custom-input" placeholder-style="color: #CCCCCC;" @input="handleCustomInput" />
					</view>
				</view>

				<view class="recharge-btn" @click="handleRecharge">
					<text class="recharge-btn-text">充值</text>
				</view>
			</view>
		</view>
	</up-popup>
</template>

<script setup>
	import { ref } from 'vue'
	import { userPlayMoney, weixinPlay } from '@/api/user.js'

	const presetAmounts = ref([50, 100, 500, 2000])
	const selectedAmount = ref(presetAmounts.value[0])
	const customAmount = ref(presetAmounts.value[0].toString())
	const innerVisible = ref(false)
	const emits = defineEmits(['confirm'])

	function handleAmountClick(amount) {
		selectedAmount.value = amount
		customAmount.value = amount.toString()
	}

	function handleCustomInput() {
		customAmount.value = customAmount.value
			.replace(/[^0-9.]/g, '')
			.replace(/^\./g, '')
			.replace(/\.{2,}/g, '.')
			.replace(/(\.\d{2})\d+/g, '$1')
			.replace(/^0+(\d)/, '$1')

		if (customAmount.value) {
			selectedAmount.value = null
		}
	}

	async function handleRecharge() {
		const amount = Number(customAmount.value)

		if (isNaN(amount) || amount <= 0 || !customAmount.value.trim()) {
			uni.showToast({
				title: '请输入有效金额',
				icon: 'none',
				duration: 2000
			})
			return
		}
		const finalAmount = Number(amount.toFixed(2))

		uni.showLoading({
			title: '创建订单中...',
			mask: true
		})

		try {
			const userPlayRes = await userPlayMoney({
				amount: Math.round(finalAmount * 100),
				userId: uni.getStorageSync('userId')
			})

			if (!userPlayRes || userPlayRes.code !== 200) {
				throw new Error(userPlayRes?.msg || '创建订单失败')
			}

			const weixinPlayRes = await weixinPlay({
				description: '充值',
				totalAmount: Math.round(finalAmount * 100),
				openid: uni.getStorageSync('openId'),
				outTradeNo: userPlayRes.data.transactionNo
			})

			if (!weixinPlayRes || weixinPlayRes.code !== 200) {
				throw new Error(weixinPlayRes?.msg || '获取支付参数失败')
			}

			const payParams = weixinPlayRes.data.pay_params

			uni.hideLoading()

			const paymentRes = await new Promise((resolve, reject) => {
				wx.requestPayment({
					timeStamp: payParams.timeStamp,
					nonceStr: payParams.nonceStr,
					package: payParams.package,
					signType: payParams.signType,
					paySign: payParams.paySign,
					success: (res) => resolve(res),
					fail: (err) => reject(err)
				})
			})

			if (paymentRes.errMsg === 'requestPayment:ok') {
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				})
				emits('confirm')
				handleClose()
			} else {
				throw new Error('支付未完成，请重试')
			}
		} catch (err) {
			console.error('支付流程异常:', err)
			const errorMsg = err.message || '支付失败，请稍后重试'
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}
	}

	function openModal() {
		innerVisible.value = true
	}

	function handleClose() {
		innerVisible.value = false
		selectedAmount.value = presetAmounts.value[0]
		customAmount.value = presetAmounts.value[0].toString()
	}

	defineExpose({
		openModal
	})
</script>

<style scoped>
	.title {
		text-align: center;
		padding-top: 24rpx;
	}

	.content {
		padding: 30rpx 20rpx;
	}

	.amount-grid {
		display: flex;
		gap: 15rpx;
		flex-wrap: wrap;
	}

	.amount-item {
		width: 140rpx;
		height: 68rpx;
		background-color: #F5F5F5;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #515163;
		border: 1px solid #DDDDE5;
		box-sizing: border-box;
	}

	.amount-item-active {
		background: #E0E6FD;
		border-color: #007AFF;
		color: #000000;
		font-weight: bold;
	}

	.amount-item:active {
		background-color: #E8E8E8;
	}

	.custom-amount {
		margin: 40rpx 0;
		padding: 0 10rpx;
	}

	.custom-title {
		color: #007AFF;
		font-size: 30rpx;
		margin-bottom: 15rpx;
		display: block;
	}

	.custom-input-wrap {
		background-color: #FFFFFF;
		border-radius: 10rpx;
		padding: 0 20rpx;
	}

	.custom-input {
		width: 100%;
		height: 100rpx;
		font-size: 32rpx;
		border-bottom: 1px solid #EEEEEE;
	}

	.recharge-btn {
		height: 80rpx;
		background-color: #5278FF;
		border-radius: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 50rpx;
	}

	.recharge-btn-text {
		color: #FFFFFF;
		font-size: 34rpx;
	}

	.recharge-btn:active {
		background-color: #00B44E;
	}
</style>
