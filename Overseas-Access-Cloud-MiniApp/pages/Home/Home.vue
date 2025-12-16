<template>
	<view class="container">
		<!-- 顶部Banner (轮播图) -->
		<view class="banner-wrapper">
			<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000"
				indicator-color="rgba(255, 255, 255, 0.5)" indicator-active-color="#ffffff">
				<swiper-item v-for="(item, index) in swiperList" :key="index">
					<view class="swiper-item">
						<image :src="item.image" mode="aspectFill" class="swiper-image"></image>
						<!-- 蓝色渐变遮罩 -->
						<view class="swiper-overlay"></view>
					</view>
				</swiper-item>
			</swiper>

			<!-- 悬浮内容 -->
			<view class="banner-content">
				<view class="title">海丝出海通</view>
				<view class="subtitle">一站式全球政策查询与服务</view>
				<button class="explore-btn" size="mini">立即探索</button>
			</view>
		</view>

		<!-- 政务卡片 -->
		<view class="service-section">
			<view class="service-card">
				<text class="service-title">政务</text>
				<text class="service-desc">出海业务快速办理</text>
			</view>
		</view>

		<!-- 国家列表网格 -->
		<view class="country-grid">
			<view class="grid-item" v-for="(item, index) in countries" :key="index" @click="onCountryClick(item)">
				<image class="country-img" :src="item.image" mode="aspectFill"></image>
				<!-- 蒙层与文字 -->
				<view class="country-overlay">
					<text class="country-name">{{ item.name }}</text>
				</view>
			</view>

			<!-- 更多国家按钮 -->
			<view class="grid-item more-item" @click="onMoreClick">
				<view class="more-content">
					<!-- 使用uni-icons，如果没有引入需要确认，这里暂时用文字或简单图标代替 -->
					<text class="more-icon">🌐</text>
					<text class="more-text">更多国家</text>
				</view>
			</view>
		</view>
	</view>

	<!-- 底部服务弹窗 -->
	<uni-popup ref="servicePopup" type="bottom" :safe-area="false">
		<HomeService @close="closeServicePopup"></HomeService>
	</uni-popup>
</template>

<script>
	import HomeService from './Component/Home_Service.vue'

	export default {
		components: {
			HomeService
		},
		data() {
			return {
				// 轮播图数据
				swiperList: [{
						image: '/static/Country/china.jpg'
					},
					{
						image: '/static/Country/china.jpg'
					},
					{
						image: '/static/Country/china.jpg'
					}
				],
				countries: [{
						name: '美国',
						image: '/static/Country/china.jpg'
					},
					{
						name: '日本',
						image: '/static/Country/china.jpg'
					},
					{
						name: '英国',
						image: '/static/Country/china.jpg'
					},
					{
						name: '法国',
						image: '/static/Country/china.jpg'
					},
					{
						name: '德国',
						image: '/static/Country/china.jpg'
					},
					{
						name: '意大利',
						image: '/static/Country/china.jpg'
					},
					{
						name: '加拿大',
						image: '/static/Country/china.jpg'
					},
					{
						name: '澳大利亚',
						image: '/static/Country/china.jpg'
					}
				]
			}
		},
		methods: {
			onCountryClick(item) {
				console.log('Clicked country:', item.name);
				// 打开底部服务弹窗
				this.$refs.servicePopup.open();
			},
			closeServicePopup() {
				this.$refs.servicePopup.close();
			},
			onMoreClick() {
				console.log('Clicked more');
				// TODO: 跳转更多
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #ffffff;
		padding-bottom: 20px;
	}

	/* Banner Wrapper */
	.banner-wrapper {
		position: relative;
		width: 100%;
		height: 420rpx;
	}

	.swiper {
		width: 100%;
		height: 100%;
	}

	.swiper-item {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* 蓝色渐变遮罩，模拟设计图的蓝色背景效果 */
	.swiper-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/* 从左到右：左侧深蓝保持文字清晰，右侧逐渐透明露出图片 */
		background: linear-gradient(90deg, rgba(30, 144, 255, 0.95) 0%, rgba(30, 144, 255, 0.6) 50%, rgba(30, 144, 255, 0.1) 100%);
	}

	/* 悬浮内容样式 */
	.banner-content {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 10;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-left: 50rpx;
		pointer-events: none; /* 让点击事件穿透到swiper，除非点到按钮 */
	}

	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 20rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 40rpx;
	}

	.explore-btn {
		background-color: #ffffff;
		color: #007aff;
		font-weight: bold;
		border-radius: 8rpx;
		padding: 0 30rpx;
		margin: 0;
		border: none;
		line-height: 2.4;
		font-size: 28rpx;
		align-self: flex-start; /* 按钮左对齐 */
		pointer-events: auto; /* 恢复按钮点击 */
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	/* 政务卡片 */
	.service-section {
		padding: 0 30rpx;
		margin-top: 30rpx; /* 与banner的间距 */
		margin-bottom: 40rpx;
	}

	.service-card {
		background-color: #1e90ff; /* 亮蓝色 */
		border-radius: 20rpx;
		height: 180rpx;
		text-align: center;
		color: #ffffff;
		box-shadow: 0 8rpx 16rpx rgba(30, 144, 255, 0.25);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.service-title {
		font-size: 40rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
	}

	.service-desc {
		font-size: 26rpx;
		opacity: 0.9;
	}

	/* 国家网格 */
	.country-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		padding: 0 30rpx;
	}

	.grid-item {
		position: relative;
		aspect-ratio: 1; /* 正方形 */
		border-radius: 8rpx;
		overflow: hidden;
		background-color: #f8f8f8;
	}

	.country-img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.country-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0.3); /* 降低蒙层透明度 */
		padding: 8rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.country-name {
		color: #ffffff;
		font-size: 24rpx;
		font-weight: 500;
	}

	/* 更多按钮样式 */
	.more-item {
		border: 2rpx solid #a3a4a4ff; /* 边框颜色加深 */
		border-radius: 20rpx; /* 增加圆角 */
		background-color: #f5f7fa; /* 浅色背景 */
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box; /* 确保border不撑大宽高 */
	}

	.more-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #666666;
	}

	.more-icon {
		font-size: 40rpx;
		margin-bottom: 10rpx;
		color: #007aff;
	}

	.more-text {
		font-size: 24rpx;
	}
</style>
