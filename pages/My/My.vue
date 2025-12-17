<template>
	<view class="container">
		<!-- 顶部公司信息卡片 -->
		<view class="company-card">
			<view class="company-name">北京智慧城市科技有限公司</view>
			<view class="company-id">企业ID: QY20230512001</view>
		</view>

		<!-- 功能入口网格 -->
		<view class="function-grid">
			<view class="grid-item" @click="onNavClick('company')">
				<view class="icon-wrapper blue-bg">
					<!-- 暂时使用 emoji 或 unicode 符号代替图标，后续可替换为 uni-icons 或图片 -->
					<text class="icon">🏢</text>
				</view>
				<text class="grid-text">企业信息</text>
			</view>
			<view class="grid-item" @click="onNavClick('order')">
				<view class="icon-wrapper green-bg">
					<text class="icon">🛒</text>
				</view>
				<text class="grid-text">下单服务</text>
			</view>
			<view class="grid-item" @click="onNavClick('gov')">
				<view class="icon-wrapper orange-bg">
					<text class="icon">🎟️</text>
				</view>
				<text class="grid-text">政务工单</text>
			</view>
		</view>

		<!-- 账户余额卡片 -->
		<view class="balance-card">
			<view class="balance-header">
				<text class="balance-label">账户余额</text>
				<view class="recharge-btn" @click="onRecharge">
					<text>充值</text>
				</view>
			</view>
			<view class="balance-amount">¥12,500.00</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			onNavClick(type) {
				console.log('Clicked navigation:', type);
				// TODO: 跳转对应页面
			},
			onRecharge() {
				console.log('Clicked recharge');
				// TODO: 跳转充值
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding: 30rpx;
	}

	/* 通用卡片样式 */
	.company-card,
	.balance-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	/* 公司信息卡片 */
	.company-name {
		font-size: 34rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 16rpx;
	}

	.company-id {
		font-size: 26rpx;
		color: #999999;
	}

	/* 功能网格 */
	.function-grid {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.grid-item {
		flex: 1;
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 0;
		margin-right: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.grid-item:last-child {
		margin-right: 0;
	}

	.icon-wrapper {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
	}

	.blue-bg {
		background-color: #e6f1ff;
	}

	.green-bg {
		background-color: #e6ffef;
	}

	.orange-bg {
		background-color: #fff7e6;
	}

	.icon {
		font-size: 40rpx;
	}

	.grid-text {
		font-size: 26rpx;
		color: #666666;
	}

	/* 余额卡片 */
	.balance-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.balance-label {
		font-size: 30rpx;
		color: #666666;
	}

	.recharge-btn {
		background-color: #e6f1ff;
		padding: 8rpx 24rpx;
		border-radius: 30rpx;
		color: #007aff;
		font-size: 24rpx;
		font-weight: bold;
	}

	.balance-amount {
		font-size: 48rpx;
		font-weight: bold;
		color: #333333;
	}
</style>
