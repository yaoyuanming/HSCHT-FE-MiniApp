<template>
	<view class="container">
		<!-- 顶部 Banner 区域 -->
		<view class="banner-section">
			<swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000"
				indicator-active-color="#ffffff" indicator-color="rgba(255,255,255,0.5)">
				<swiper-item v-for="(item, index) in banners" :key="index">
					<view class="banner-item">
						<!-- 背景图占位 -->
						<image class="banner-image" :src="item.image" mode="aspectFill"></image>
						<!-- Banner 内容 -->
						<view class="banner-content">
							<text class="banner-title">海丝出海通</text>
							<text class="banner-subtitle">一站式全球政策查询与服务</text>
							<view class="banner-btn" @click="handleExplore">
								<text>立即探索</text>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="main-content">
			<!-- 我要咨询按钮 -->
			<view class="action-btn consult-btn" @click="handleConsult">
				<view class="btn-inner">
					<!-- 图标占位 -->
					<image class="btn-icon" src="/static/index/message.png" mode="aspectFit"></image>
					<text class="btn-text">我要咨询</text>
				</view>
			</view>

			<!-- 政务卡片 -->
			<view class="action-card gov-card" @click="handleGov">
				<view class="card-inner">
					<text class="card-title">政务</text>
					<text class="card-subtitle">出海业务快速办理</text>
				</view>
			</view>

			<!-- 国家列表网格 -->
			<view class="country-grid">
				<view class="country-item" v-for="(item, index) in countries" :key="index" @click="handleCountry(item)">
					<image class="country-img" :src="item.nationalFlagUrl" mode="aspectFill"></image>
					<!-- 遮罩层显示国家名称 -->
					<view class="country-overlay">
						<text class="country-name">{{ item.countryName }}</text>
					</view>
				</view>

				<!-- 更多国家 -->
				<view class="country-item more-item" @click="handleMore">
					<view class="more-content">
						<view class="more-icon-box">
							<!-- 图标占位 -->
							<view class="more-icon-placeholder">🌐</view>
						</view>
						<text class="more-text">更多国家</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部弹窗 -->
		<uni-popup ref="popup" type="bottom" :safe-area="false">
			<HomeService ref="homeService" @close="closePopup" :initial-country="selectedCountry" :all-countries="allCountries"></HomeService>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		getCountryList
	} from '@/api/country.js'
	import HomeService from './Component/Home_Service.vue'
	import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'

	// Banner 数据
	const banners = ref([{
			image: '/static/Country/china.jpg'
		}
	])

	// 国家数据
	const countries = ref([])
	const allCountries = ref([])
	const popup = ref(null)
	const selectedCountry = ref({})
	const homeService = ref(null)

	// 获取国家列表
	const fetchCountryList = async () => {
		try {
			const res = await getCountryList()
			// 兼容不同的返回结构
			const dataList = res.data?.rows || res.rows || res.data || []
			if (dataList) {
				allCountries.value = dataList
				countries.value = dataList.slice(0, 8)
			}
		} catch (e) {
			console.error('获取国家列表失败', e)
		}
	}

	// 事件处理
	const handleExplore = () => {
		console.log('Explore clicked')
	}

	const handleConsult = () => {
		uni.navigateTo({
			url: '/pages/assistants/chat/index'
		})
	}

	const handleGov = () => {
		uni.navigateTo({
			url: '/pages/Home/Component/government'
		})
	}

	const handleCountry = (item) => {
		selectedCountry.value = item
		popup.value.open()
	}

	const handleMore = () => {
		uni.switchTab({
			url: '/pages/Service/Service'
		})
	}

	const closePopup = () => {
		popup.value.close()
	}

	onMounted(() => {
		fetchCountryList()
	})
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background-color: #ffffff;
		padding-bottom: 40rpx;
	}

	/* Banner Section */
	.banner-section {
		width: 100%;
		height: 420rpx;
		position: relative;
	}

	.banner-swiper {
		width: 100%;
		height: 100%;
	}

	.banner-item {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.banner-image {
		width: 100%;
		height: 100%;
	}

	.banner-content {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-left: 40rpx;
		background: linear-gradient(180deg, rgba(37, 99, 235, 0.9) 0%, rgba(37, 99, 235, 0.3) 100%);
	}

	.banner-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 16rpx;
	}

	.banner-subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 32rpx;
	}

	.banner-btn {
		width: 200rpx;
		height: 64rpx;
		background: #ffffff;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.banner-btn text {
		color: #2563EB;
		font-size: 26rpx;
		font-weight: 600;
	}

	/* Main Content */
	.main-content {
		padding: 32rpx;
		margin-top: -0rpx;
		/* Overlap banner slightly if needed, or just normal flow */
		position: relative;
		z-index: 10;
		background: transparent;
	}

	/* Consult Button */
	.consult-btn {
		background: linear-gradient(135deg, #4F86F0 0%, #2563EB 100%);
		border-radius: 40rpx;
		height: 120rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 32rpx;
		box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.2);
	}

	.btn-inner {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.btn-icon {
		width: 48rpx;
		height: 48rpx;
		filter: brightness(0) invert(1);
		/* Make white if icon is black */
	}

	.btn-text {
		color: #ffffff;
		font-size: 36rpx;
		font-weight: 600;
	}

	/* Gov Card */
	.gov-card {
		background: linear-gradient(135deg, #3B82F6 0%, #0EA5E9 100%);
		border-radius: 24rpx;
		height: 160rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 40rpx;
		box-shadow: 0 8rpx 20rpx rgba(14, 165, 233, 0.2);
	}

	.card-inner {
		text-align: center;
		color: #ffffff;
	}

	.card-title {
		font-size: 40rpx;
		font-weight: bold;
		display: block;
		margin-bottom: 8rpx;
	}

	.card-subtitle {
		font-size: 26rpx;
		opacity: 0.9;
	}

	/* Country Grid */
	.country-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24rpx;
	}

	.country-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 16rpx;
		overflow: hidden;
		background: #f3f4f6;
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
		padding: 8rpx 0;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.country-name {
		color: #ffffff;
		font-size: 24rpx;
		font-weight: 500;
	}

	/* More Item */
	.more-item {
		background: #f9fafb;
		border: 2rpx solid #e5e7eb;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.more-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}

	.more-icon-placeholder {
		font-size: 48rpx;
	}

	.more-text {
		font-size: 24rpx;
		color: #6b7280;
	}
</style>