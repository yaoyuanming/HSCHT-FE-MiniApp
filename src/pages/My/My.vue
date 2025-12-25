<template>
	<view class="container">
		<!-- 顶部公司信息卡片 -->
		<view class="company-card" @click="handleLogin">
			<view class="user-info-row">
				<image class="avatar" :src="userAvatar" mode="aspectFill"></image>
				<view class="info-content">
					<view class="company-name">{{ userName }}</view>
					<view class="company-id" v-if="userId">ID: {{ userId }}</view>
					<view class="company-id" v-else>点击登录</view>
				</view>
			</view>
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
				<text class="grid-text">工单管理</text>
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
	import { mapGetters } from 'vuex'
	import { completeLoginFlow } from '@/utils/auth'

	export default {
		data() {
			return {

			}
		},
		computed: {
			...mapGetters(['userInfo', 'token']),
			userName() {
				if (!this.token) return '未登录'
				return this.userInfo.user?.nickName || this.userInfo.nickName || '用户'
			},
			userId() {
				if (!this.token) return ''
				return this.userInfo.user?.userId || this.userInfo.userId || ''
			},
			userAvatar() {
				return this.userInfo.user?.avatar || this.userInfo.avatar || '/static/logo.png' // 默认头像
			}
		},
		methods: {
			async handleLogin() {
				// 无论是否有token，点击都尝试登录（可能是重新登录或token失效但未清理）
				uni.showLoading({ title: '登录中...' })
				const success = await completeLoginFlow()
				uni.hideLoading()
				if (success) {
					uni.showToast({ title: '登录成功', icon: 'success' })
				} else {
					uni.showToast({ title: '登录失败', icon: 'none' })
				}
			},
			onNavClick(type) {
				console.log('Clicked navigation:', type);
				if (type === 'gov') {
					uni.navigateTo({
						url: '/pages/My/funtion/word_order'
					})
				}
				// TODO: 其他类型跳转
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
	
	.user-info-row {
		display: flex;
		align-items: center;
	}
	
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #eee;
	}

	/* 公司信息卡片 */
	.company-name {
		font-size: 34rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 10rpx;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		width: 30%;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
	}
	
	.icon-wrapper {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		
		&.blue-bg { background-color: #e6f7ff; }
		&.green-bg { background-color: #f6ffed; }
		&.orange-bg { background-color: #fff7e6; }
	}
	
	.icon {
		font-size: 40rpx;
	}
	
	.grid-text {
		font-size: 26rpx;
		color: #333;
	}

	/* 余额卡片 */
	.balance-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.balance-label {
		font-size: 28rpx;
		color: #666;
	}
	
	.recharge-btn {
		padding: 8rpx 24rpx;
		background-color: #2979ff;
		color: #fff;
		border-radius: 30rpx;
		font-size: 24rpx;
	}
	
	.balance-amount {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
	}
</style>