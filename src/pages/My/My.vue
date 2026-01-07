<template>
	<view class="container">
		<!-- 顶部用户信息卡片 -->
		<view class="user-card" @click="handleLogin">
			<image class="avatar" :src="userAvatar" mode="aspectFill"></image>
			<view class="user-info">
				<text class="user-name">{{ userName }}</text>
				<view class="user-phone" v-if="userPhone">
					<uni-icons type="phone-filled" size="14" color="#666"></uni-icons>
					<text class="phone-text">{{ userPhone }}</text>
				</view>
				<view class="login-tip" v-else-if="!token">点击登录</view>
			</view>
		</view>

		<!-- 资产统计卡片 -->
		<view class="asset-card">
			<view class="asset-item" @click="onNavClick('balance')">
				<view class="icon-box">
					<image class="asset-icon" src="/static/my/我的余额.png" mode="aspectFit"></image>
				</view>
				<text class="asset-label">我的余额</text>
				<text class="asset-value">¥1,234.56</text>
			</view>
			<view class="asset-item" @click="onNavClick('coupon')">
				<view class="icon-box">
					<image class="asset-icon" src="/static/my/优惠卷.png" mode="aspectFit"></image>
				</view>
				<text class="asset-label">优惠券</text>
				<text class="asset-value">8张可用</text>
			</view>
			<view class="asset-item" @click="onNavClick('wallet')">
				<view class="icon-box">
					<image class="asset-icon" src="/static/my/钱包.png" mode="aspectFit"></image>
				</view>
				<text class="asset-label">我的钱包</text>
				<!-- 占位保持对齐 -->
				<text class="asset-value" style="opacity: 0;">-</text>
			</view>
		</view>

		<!-- 我的服务卡片 -->
		<view class="service-card">
			<view class="card-title">我的服务</view>
			<view class="service-grid">
				<view class="service-item" v-for="(item, index) in serviceList" :key="index" @click="onNavClick(item.key)">
					<view class="service-icon-box">
						<image class="service-icon" :src="item.icon" mode="aspectFit"></image>
					</view>
					<text class="service-name">{{ item.name }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	import { completeLoginFlow } from '@/utils/auth'

	export default {
		data() {
			return {
				serviceList: [
					{ name: '健康档案', icon: '/static/my/健康档案.png', key: 'health' },
					{ name: '企业档案', icon: '/static/my/企业档案.png', key: 'company' },
					{ name: '工单管理', icon: '/static/my/工单管理.png', key: 'gov' },
					{ name: '服务咨询', icon: '/static/my/服务咨询.png', key: 'consult' },
					{ name: '我的项目', icon: '/static/my/我的项目.png', key: 'project' },
					{ name: '我的课程', icon: '/static/my/我的课程.png', key: 'course' }
				]
			}
		},
		computed: {
			...mapGetters(['userInfo', 'token']),
			userName() {
				if (!this.token) return '未登录'
				return this.userInfo.user?.nickName || this.userInfo.nickName || '用户'
			},
			userPhone() {
				if (!this.token) return null
				// 获取电话号码，要求全部显示
				return this.userInfo.user?.phonenumber || this.userInfo.phonenumber || null
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
				switch(type) {
					case 'gov':
						uni.navigateTo({
							url: '/pages/My/funtion/word_order'
						})
						break;
					case 'consult':
						// 跳转到人工咨询页面
						uni.navigateTo({
							url: '/pages/Home/Component/Artificial'
						})
						break;
					case 'company':
						// TODO: 跳转企业档案
						break;
					case 'health':
						uni.navigateTo({
							url: '/pages/My/funtion/health_record'
						})
						break;
					case 'project':
						// TODO: 跳转我的项目
						break;
					case 'course':
						// TODO: 跳转我的课程
						break;
					default:
						// uni.showToast({ title: '功能开发中', icon: 'none' })
						break;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding: 30rpx;
	}

	/* 通用卡片样式 */
	.user-card,
	.asset-card,
	.service-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	/* 用户信息卡片 */
	.user-card {
		padding: 60rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		
		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			margin-bottom: 20rpx;
			background-color: #eee;
			border: 2rpx solid #fff;
			box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
		}
		
		.user-info {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.user-name {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 12rpx;
			}
			
			.user-phone {
				display: flex;
				align-items: center;
				color: #666;
				
				.phone-text {
					font-size: 28rpx;
					margin-left: 8rpx;
				}
			}
			
			.login-tip {
				font-size: 26rpx;
				color: #999;
			}
		}
	}

	/* 资产卡片 */
	.asset-card {
		padding: 40rpx 20rpx;
		display: flex;
		justify-content: space-around;
		align-items: flex-start;
		
		.asset-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;
			
			.icon-box {
				width: 100rpx;
				height: 100rpx;
				background-color: #f8f9fb;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 16rpx;
				
				.asset-icon {
					width: 100rpx;
					height: 100rpx;
				}
			}
			
			.asset-label {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 8rpx;
			}
			
			.asset-value {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
			}
		}
	}

	/* 我的服务卡片 */
	.service-card {
		padding: 30rpx;
		
		.card-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 40rpx;
			padding-left: 10rpx;
		}
		
		.service-grid {
			display: flex;
			flex-wrap: wrap;
			
			.service-item {
				width: 50%;
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-bottom: 50rpx;
				
				.service-icon-box {
					width: 100rpx;
					height: 100rpx;
					// background-color: #f8f9fb;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 20rpx;
					
					.service-icon {
						width: 100rpx;
						height: 100rpx;
					}
				}
				
				.service-name {
					font-size: 28rpx;
					color: #666;
				}
			}
		}
	}
</style>