<template>
	<view class="container">
		<!-- 顶部Banner -->
		<view class="banner">
			<image class="banner-img" src="/static/Country/china.jpg" mode="aspectFill"></image>
			<view class="banner-overlay">
				<text class="banner-title">全球出海服务解决方案</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content">
			<view class="text-block">
				<text>我们提供全方位的出海服务，帮助中国企业顺利进入全球市场，实现品牌国际化和业务增长。从市场调研到本地化运营，从合规咨询到营销推广，我们为您提供端到端的解决方案。</text>
			</view>
			<view class="text-block">
				<text>凭借多年的国际市场经验和专业团队，我们已成功协助超过500家企业拓展海外业务，覆盖欧美、东南亚、中东等主要市场区域。</text>
			</view>
			<view class="text-block">
				<text>无论您是初创企业还是成熟品牌，我们都能根据您的需求定制专属出海策略，降低国际化风险，提升市场成功率。</text>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="footer">
			<button class="submit-btn" @click="consult">下单咨询</button>
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
			consult() {
				uni.showToast({
					title: '咨询功能开发中',
					icon: 'none'
				});
			}
		}
	}
</script>

<style lang="scss">
	.container {
		background-color: #ffffff;
		min-height: 100vh;
		padding-bottom: 120rpx; /* 为底部按钮留出空间 */
	}

	.banner {
		width: 100%;
		height: 400rpx;
		position: relative;
	}

	.banner-img {
		width: 100%;
		height: 100%;
	}

	.banner-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 30rpx;
		background: linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0));
		box-sizing: border-box;
	}

	.banner-title {
		color: #ffffff;
		font-size: 36rpx;
		font-weight: bold;
	}

	.content {
		padding: 40rpx 30rpx;
	}

	.text-block {
		margin-bottom: 30rpx;
		font-size: 28rpx;
		color: #666666;
		line-height: 1.8;
		text-align: justify;
	}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
		box-sizing: border-box;
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}

	.submit-btn {
		background-color: #1e90ff;
		color: #ffffff;
		border-radius: 44rpx;
		font-size: 32rpx;
		height: 88rpx;
		line-height: 88rpx;
		border: none;
		
		&:after {
			border: none;
		}
	}
</style>
