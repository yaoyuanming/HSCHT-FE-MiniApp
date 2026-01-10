<template>
	<view class="detail-page">
		<view v-if="loading" class="loading">
			<view class="skeleton img-skeleton"></view>
			<view class="skeleton info-skeleton"></view>
			<view class="skeleton desc-skeleton"></view>
		</view>

		<view v-else>
			<!-- 顶部卡片：图片 + 标题 + 价格 / 购买按钮 -->
			<view class="img-area">
				<image :src="packageInfo.imageUrl" mode="widthFix" class="project-img"
					@error="handleImageError($event, packageInfo.imageUrl)" />
				<view class="info-bar">
					<view class="info-left">
						<view class="project-name">{{ packageInfo.packageName }}</view>
						<view class="price">价格: ¥{{ packageInfo.discountPrice }}</view>
					</view>
					<view class="buy-btn" @click="handleBuy" :class="{disabled: packageInfo.status != 0}">
						购买
					</view>
				</view>
			</view>

			<view class="desc-area">
				<view class="desc-title">商品详情</view>
				<view class="desc-content">
					<up-markdown :content="packageInfo.description"></up-markdown>
				</view>
			</view>

			<view class="bottom-buy-btn">
				<button class="buy-btn" @click="handleBuy" :disabled="packageInfo.status != 0" hover-class="btn-hover">
					立即购买
				</button>
				<text class="buy-tip">“购买完成后，可在我的中预约使用”</text>
			</view>

			<PhoneAuthPopup v-model:show="phoneShow" title="请授权手机号" desc="购买套餐需要验证您的手机号" @success="handlePhoneSuccess"
				@cancel="closePhonePopup" />

			<PaymentSheet v-model:show="playShow" title="支付方式" confirm-text="支付" :options="paymentOptions"
				:current="paymentMethod" :balance-status="balanceStatusText" :confirm-loading="isPaying"
				@select="handelChangePlay" @confirm="handlePay" />
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		getPorjectInfo
	} from '@/api/project.js'
	import {
		usePhoneAuthorization,
		usePurchaseFlow
	} from '@/composables/usePurchaseFlow.js'
	import PhoneAuthPopup from '@/components/PhoneAuthPopup.vue'
	import PaymentSheet from '@/components/PaymentSheet.vue'

	const loading = ref(true)
	const packageInfo = ref({})
	const playShow = ref(false)
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
		pay,
		isPaying
	} = usePurchaseFlow()

	// 计算余额状态文本：检查余额是否足以购买当前套餐
	const balanceStatusText = computed(() => {
		const cents = Number(balanceInfo.value.availableBalance || 0)
		if (!cents) return '余额不足'
		if (packageInfo.value.discountPrice && cents < Number(packageInfo.value.discountPrice) * 100) return '余额不足'
		return readableBalance.value
	})

	// 处理支付方式变更：更新选中的支付方式
	const handelChangePlay = (rows) => {
		selectPaymentMethod(rows.value, packageInfo.value.discountPrice)
	}

	// 处理购买按钮点击：检查套餐状态和手机号授权，然后打开支付方式选择
	const handleBuy = () => {
		if (packageInfo.value.status != 0) {
			uni.showToast({
				title: '该套餐已下架，无法购买',
				icon: 'none'
			})
			return
		}
		if (!hasPhone.value) {
			openPhonePopup()
			return
		}
		playShow.value = true
	}

	// 处理手机号授权成功：保存手机号并打开支付方式选择
	const handlePhoneSuccess = (phone) => {
		applyPhoneNumber(phone)
		playShow.value = true
	}
	
	// 处理支付：调用支付接口，传递套餐信息和项目列表，支付成功后关闭弹窗
	const handlePay = async () => {
		// 验证支付金额
		const amount = Number(packageInfo.value.discountPrice)
		if (!amount || amount <= 0) {
			uni.showToast({
				title: '支付金额错误，请重试',
				icon: 'none'
			})
			return
		}

		const success = await pay({
			amount: amount,
			description: packageInfo.value.packageName,
			orderPayload: {
				packageList: [{
					packageId: packageInfo.value.id,
					packageName: packageInfo.value.packageName,
					discountPrice: amount,
					projectList: packageInfo.value.projectList?.map(val => ({
						projectId: val.id,
						projectName: val.projectName
					})) || []
				}]
			},
			onAfterPay: async () => {
				uni.showToast({
					title: '支付成功',
					icon: 'success',
					duration: 2000
				})
				playShow.value = false
			}
		})
		
		// 支付成功，关闭弹窗
		if (success) {
			playShow.value = false
		}
	}

	const handleImageError = (e) => {
		e.target.src = '/static/default-img.png'
	}

	// 获取套餐详情信息：调用接口获取数据，转换价格格式，刷新余额
	async function getInfo(ids) {
		let res = await getPorjectInfo(ids)
		if (res.code === 200) {
			packageInfo.value = res.data
			packageInfo.value.discountPrice = Number(packageInfo.value.discountPrice)
			loading.value = false
			await refreshBalance(packageInfo.value.discountPrice)
		}
	}

	onLoad(async (opt) => {
		await getInfo(opt.id)
	})
</script>

<style>
	page {
		background-color: #F8F8F8;
	}
</style>

<style lang="scss" scoped>
	.detail-page {
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	}

	.loading {
		padding: 24rpx;

		.skeleton {
			background-color: #e5e5e5;
			border-radius: 8rpx;
			margin-bottom: 24rpx;
			animation: flash 1.5s infinite;
		}

		.img-skeleton {
			width: 100%;
			height: 300rpx;
			border: 1px solid #eee;
		}

		.info-skeleton {
			width: 100%;
			height: 80rpx;
		}

		.desc-skeleton {
			width: 100%;
			height: 200rpx;
		}
	}

	.img-area {
		margin: 24rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

		.project-img {
			width: 100%;
			border: 1px solid #eee;
			border-radius: 12rpx;
		}
	}

	.info-bar {
		padding: 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.info-left {
			.project-name {
				font-size: 34rpx;
				font-weight: 600;
				color: rgba(0, 0, 0, 0.85);
				margin-bottom: 8rpx;
			}

			.price {
				font-size: 30rpx;
				color: #E1291C;
			}
		}

		.buy-btn {
			padding: 12rpx 32rpx;
			background-color: #5278FF;
			color: #fff;
			font-size: 28rpx;
			border-radius: 80rpx;

			&.disabled {
				background-color: #e8e8e8;
				color: #999;
			}
		}
	}

	.desc-area {
		margin: 24rpx;
		padding: 24rpx 32rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		min-height: 600rpx;

		.desc-title {
			font-size: 30rpx;
			font-weight: 600;
			color: rgba(0, 0, 0, 0.85);
			margin-bottom: 16rpx;
			text-align: center;
		}

		.desc-content {
			color: #515163;
			font-size: 26rpx;
			line-height: 1.6;
		}
	}

	.bottom-buy-btn {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 24rpx;
		background-color: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

		.buy-btn {
			width: 100%;
			height: 90rpx;
			line-height: 90rpx;
			background-color: #5278FF;
			color: #fff;
			font-size: 32rpx;
			font-weight: 500;
			border-radius: 80rpx;
			border: none;

			&:disabled {
				background-color: #e8e8e8;
				color: #999;
			}
		}

		.buy-tip {
			font-size: 24rpx;
			color: #999999;
			line-height: 1.4;
			text-align: center;
		}
	}

	.btn-hover {
		opacity: 0.9;
		transform: scale(0.98);
		transition: all 0.2s;
	}
</style>