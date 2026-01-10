<template>
	<view class="container">
		<!-- 加载状态 -->
		<view class="loading-state" v-if="isLoading">
			<uni-load-more status="loading" content-text='{"loading":"正在查询档案..."}'></uni-load-more>
		</view>

		<!-- 空状态展示 (仅当不自动跳转时显示，或者作为兜底) -->
		<view class="empty-state" v-else>
			<view class="icon-box">
				<image class="empty-icon" src="/static/my/加.png" mode="widthFix"></image>
			</view>
			<text class="empty-title">您还未创建健康档案</text>
			<text class="empty-desc">完善健康档案有助于我们为您提供更精准的健康服务</text>
			
			<button class="action-btn" @click="handleCreate">去填写健康档案</button>
		</view>
	</view>
</template>

<script>
	import { getHealthRecordList } from '@/api/health_record.js'

	export default {
		data() {
			return {
				isLoading: true
			}
		},
		onShow() {
			this.checkHealthRecord();
		},
		methods: {
			async checkHealthRecord() {
				this.isLoading = true;
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						// 未登录，直接显示空状态，让用户去创建（会触发登录检查）
						this.isLoading = false;
						return;
					}

					const res = await getHealthRecordList({ userId: userId });
					if (res && res.rows && res.rows.length > 0) {
						// 有档案，跳转到详情页
						uni.redirectTo({
							url: '/pages/My/funtion/health_record/health_record_detail'
						});
					} else {
						// 无档案，显示空状态，让用户手动点击去创建
						this.isLoading = false;
					}
				} catch (error) {
					console.error('Check health record failed:', error);
					// 出错时，显示空状态作为降级处理，允许用户尝试手动点击创建
					this.isLoading = false;
				}
			},
			handleCreate() {
				uni.navigateTo({
					url: '/pages/My/funtion/health_record/add_health_record'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #fff;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 0 60rpx;
		
		.icon-box {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 40rpx;
			
			.empty-icon {
				width: 180rpx;
				height: 180rpx;
			}
		}

		.empty-title {
			font-size: 36rpx;
			color: #333;
			font-weight: bold;
			margin-bottom: 20rpx;
		}

		.empty-desc {
			font-size: 26rpx;
			color: #999;
			text-align: center;
			line-height: 1.5;
			margin-bottom: 80rpx;
			max-width: 500rpx;
		}

		.action-btn {
			width: 400rpx;
			height: 88rpx;
			background-color: #2b85e4; /* 蓝色主题色 */
			color: #fff;
			font-size: 32rpx;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border: none;
			
			&:active {
				opacity: 0.9;
			}
		}
	}
</style>
