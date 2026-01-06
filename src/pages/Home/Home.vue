<template>
	<view class="container">
		<!-- 顶部 Banner 区域 -->
		<view class="banner-section">
			<swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000"
				indicator-active-color="#ffffff" indicator-color="rgba(255,255,255,0.5)">
				<swiper-item v-for="(item, index) in banners" :key="index">
					<view class="banner-item">
						<image class="banner-image" :src="item.image" mode="aspectFill"></image>
						<!-- 渐变遮罩和文字 -->
						<view class="banner-overlay">
							<view class="banner-text-content">
								<text class="banner-title">{{ item.title }}</text>
								<text class="banner-subtitle">{{ item.subtitle }}</text>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="main-content">
			<!-- 功能卡片区 (2列) -->
			<view class="function-grid">
				<!-- 我要咨询 -->
				<view class="func-card" @click="handleConsult">
					<!-- 装饰背景圆 -->
					<view class="card-decor decor-green"></view>
					<view class="icon-wrapper bg-green-light">
						<uni-icons type="chatboxes" size="28" color="#ffffff"></uni-icons>
					</view>
					<text class="card-title">我要咨询</text>
					<text class="card-desc">专业顾问在线解答{{"\n"}}出海疑问</text>
				</view>

				<!-- 政务服务 -->
				<view class="func-card" @click="handleGov">
					<!-- 装饰背景圆 -->
					<view class="card-decor decor-blue"></view>
					<view class="icon-wrapper bg-blue-light">
						<uni-icons type="vip-filled" size="28" color="#ffffff"></uni-icons>
					</view>
					<text class="card-title">政务服务</text>
					<text class="card-desc">便捷办理出海相关{{"\n"}}政务手续</text>
				</view>
			</view>

			<!-- 热门贸易国家 -->
			<view class="section-header">
				<view class="header-left">
					<uni-icons type="pyq" size="21" color="#1890ff"></uni-icons>
					<text class="header-title">热门贸易国家</text>
				</view>
			</view>

			<view class="country-grid">
				<view class="country-card" v-for="(item, index) in countries" :key="index" @click="handleCountry(item)">
					<view class="flag-wrapper" :class="getFlagBgClass(index)">
						<image class="country-flag" :src="item.nationalFlagUrl" mode="aspectFit"></image>
					</view>
					<text class="country-name">{{ item.countryName }}</text>
				</view>

				<!-- 更多国家 -->
				<view class="country-card" @click="handleMore">
					<view class="flag-wrapper bg-more">
						<uni-icons type="plusempty" size="20" color="#1890ff"></uni-icons>
					</view>
					<text class="country-name">更多国家</text>
				</view>
			</view>

			<!-- 近期活动 -->
			<view class="section-header">
				<view class="header-left">
					<view class="header-icon-bg" style="background-color: #fa8c16; border-radius: 20%; width: 50rpx; height: 50rpx; display: flex; align-items: center; justify-content: center;">
						<uni-icons type="calendar-filled" size="19" color="#ffffff"></uni-icons>
					</view>
					<text class="header-title">近期活动</text>
				</view>
			</view>

			<view class="activity-list">
				<view class="activity-card" v-for="(item, index) in activities" :key="index" @click="handleActivityClick(item)">
					<view class="activity-left">
						<view class="activity-icon-wrapper" :style="{ backgroundColor: getIconBg(index) }">
							<uni-icons type="calendar-filled" size="28" :color="getIconColor(index)"></uni-icons>
						</view>
						<view class="activity-info">
							<text class="activity-title">{{ item.activityName }}</text>
							<view class="activity-meta">
								<uni-icons type="calendar" size="12" color="#999999"></uni-icons>
								<text class="meta-text">{{ item.activityTimeStart }}</text>
								<view class="meta-divider"></view>
								<uni-icons type="location" size="12" color="#999999"></uni-icons>
								<text class="meta-text">{{ item.address }}</text>
							</view>
						</view>
					</view>
					<uni-icons type="right" size="14" color="#cccccc"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 底部弹窗 -->
		<uni-popup ref="popup" type="bottom" :safe-area="false">
			<HomeService ref="homeService" @close="closePopup" :initial-country="selectedCountry"
				:all-countries="allCountries"></HomeService>
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
	import {
		getActivityList
	} from '@/api/activity/index.js'
	import HomeService from './Component/Home_Service.vue'
	import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'

	// Banner 数据
	const banners = ref([{
			image: 'https://assets.mockplus.cn/ai/newImages/pexels/7153.jpg',
			title: '海丝出海通',
			subtitle: '一站式全球政策查询与服务'
		},
		{
			image: 'https://assets.mockplus.cn/ai/newImages/pexels/8791.jpg',
			title: '国际合作峰会',
			subtitle: '连接全球商业机遇'
		},
		{
			image: '/static/Country/china.jpg',
			title: '高效物流方案',
			subtitle: '全球配送网络覆盖'
		}
	])

	// 国家数据
	const countries = ref([])
	const allCountries = ref([])
	const popup = ref(null)
	const selectedCountry = ref({})
	const homeService = ref(null)
	
	// 活动数据
	const activities = ref([])

	// 获取国家列表
	const fetchCountryList = async () => {
		try {
			const res = await getCountryList()
			// 兼容不同的返回结构
			const dataList = res.data?.rows || res.rows || res.data || []
			if (dataList) {
				const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
				allCountries.value = dataList.map(item => ({
					...item,
					nationalFlagUrl: item.nationalFlagUrl ? (item.nationalFlagUrl.startsWith('http') ? item.nationalFlagUrl : baseUrl + item.nationalFlagUrl) : ''
				}))
				countries.value = allCountries.value.slice(0, 8)
			}
		} catch (e) {
			console.error('获取国家列表失败', e)
		}
	}
	
	// 获取活动列表
	const fetchActivityList = async () => {
		try {
			const res = await getActivityList({
				status: '1'
			})
			// 假设返回结构类似
			const dataList = res.rows || res.data?.rows || res.data || []
			if (dataList) {
				activities.value = dataList.map(item => ({
					...item,
					activityTimeStart: item.activityTimeStart ? item.activityTimeStart.substring(0, 10) : ''
				}))
			}
		} catch (e) {
			console.error('获取活动列表失败', e)
		}
	}

	// 简单的背景色循环
	const getFlagBgClass = (index) => {
		const classes = ['bg-blue', 'bg-red', 'bg-yellow', 'bg-green', 'bg-purple', 'bg-orange']
		return classes[index % classes.length]
	}
	
	// 活动图标背景色
	const getIconBg = (index) => {
		const colors = ['rgba(24, 144, 255, 0.1)', 'rgba(250, 140, 22, 0.1)', 'rgba(82, 196, 26, 0.1)']
		return colors[index % colors.length]
	}
	
	const getIconColor = (index) => {
		const colors = ['#1890ff', '#fa8c16', '#52c41a']
		return colors[index % colors.length]
	}

	// 事件处理
	const handleExplore = () => {
		console.log('Explore clicked')
	}

	const handleConsult = () => {
		uni.navigateTo({
			url: '/pages/Home/Component/ai_assistant'
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
	
	const handleActivityClick = (item) => {
		if (item.id) {
			uni.navigateTo({
				url: `/pages/Course/detail?id=${item.id}`
			})
		}
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
		fetchActivityList()
	})
</script>

<style scoped lang="scss">
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding-bottom: 40rpx;
	}

	/* Banner Section */
	.banner-section {
		width: 100%;
		/* 按照设计图，banner可能有圆角和边距，或者全宽。这里参考HTML代码是 rounded-2xl mx-4 my-4 */
		/* uni-app中swiper通常全宽，但我们可以给内部item加padding来实现圆角效果 */
		height: 420rpx;
		background-color: #ffffff;
		padding-bottom: 20rpx;
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

	.banner-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		background: linear-gradient(90deg, rgba(24, 144, 255, 0.85) 0%, rgba(24, 144, 255, 0.3) 100%);
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 40rpx;
	}

	.banner-text-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.banner-title {
		font-size: 44rpx;
		font-weight: bold;
		color: #ffffff;
		display: block;
		margin-bottom: 20rpx;
		letter-spacing: 2rpx;
	}

	.banner-subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		letter-spacing: 1rpx;
	}

	/* Main Content */
	.main-content {
		padding: 0 30rpx;
		margin-top: 40rpx;
		/* 向上重叠一点banner? 或者直接按流式布局 */
		position: relative;
		z-index: 10;
	}

	/* Function Cards */
	.function-grid {
		display: flex;
		justify-content: space-between;
		margin-bottom: 40rpx;
	}

	.func-card {
		width: 40%;
		background-color: #ffffff;
		border-radius: 24rpx;
		height: 250rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		/* 增加点击反馈 */
		transition: transform 0.2s;
	}
	
	.func-card:active {
		transform: scale(0.98);
	}

	.card-decor {
		position: absolute;
		top: -20rpx;
		right: -20rpx;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		opacity: 0.1;
	}

	.decor-green {
		background-color: #00b42a;
	}

	.decor-blue {
		background-color: #1890ff;
	}

	.icon-wrapper {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05);
	}

	.bg-green-light {
		background-color: #00b42a;
	}

	.bg-blue-light {
		background-color: #1890ff;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 12rpx;
		position: relative;
		z-index: 1;
	}

	.card-desc {
		font-size: 24rpx;
		color: #999999;
		line-height: 1.4;
		position: relative;
		z-index: 1;
		white-space: pre-wrap; /* 允许换行 */
	}

	/* Section Header */
	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.header-left {
		display: flex;
		align-items: center;
	}

	.header-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		margin-left: 12rpx;
	}

	/* Country Grid */
	.country-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		margin-bottom: 40rpx;
	}

	.country-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
	}
	
	.country-card:active {
		background-color: #f9f9f9;
	}

	.flag-wrapper {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		overflow: hidden;
	}
	
	.country-flag {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%; /* 圆形旗帜 */
		box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
	}

	/* 背景色类 */
	.bg-blue { background-color: #e6f7ff; }
	.bg-red { background-color: #fff1f0; }
	.bg-yellow { background-color: #fffbe6; }
	.bg-green { background-color: #f6ffed; }
	.bg-purple { background-color: #f9f0ff; }
	.bg-orange { background-color: #fff7e6; }
	.bg-more { background-color: #f0f5ff; }

	.country-name {
		font-size: 26rpx;
		color: #333333;
		font-weight: 500;
	}

	/* Activity List */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.activity-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
	}
	
	.activity-card:active {
		background-color: #f9f9f9;
	}

	.activity-left {
		display: flex;
		align-items: flex-start;
		flex: 1;
	}

	.activity-icon-wrapper {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
		flex-shrink: 0;
	}

	.activity-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 4rpx;
	}

	.activity-title {
		font-size: 30rpx;
		font-weight: 500;
		color: #333333;
		margin-bottom: 12rpx;
	}

	.activity-meta {
		display: flex;
		align-items: center;
	}

	.meta-text {
		font-size: 24rpx;
		color: #999999;
		margin-left: 8rpx;
	}
	
	.meta-divider {
		width: 1px;
		height: 20rpx;
		background-color: #eeeeee;
		margin: 0 16rpx;
	}
</style>
