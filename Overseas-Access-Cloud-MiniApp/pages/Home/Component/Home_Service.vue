<template>
	<view class="service-popup">
		<!-- 头部 -->
		<view class="popup-header">
			<text class="popup-title">出海服务</text>
			<view class="close-btn" @click="close">
				<uni-icons type="closeempty" size="24" color="#ffffff"></uni-icons>
			</view>
		</view>

		<!-- 区域Tab -->
		<view class="region-tabs">
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="selectTab(0)">
				<view class="tab-dot" :class="{ 'active-dot': currentTab === 0 }"></view>
				<text class="tab-text">美国</text>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="selectTab(1)">
				<view class="tab-dot" :class="{ 'active-dot': currentTab === 1 }"></view>
				<text class="tab-text">欧洲</text>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 2 }" @click="selectTab(2)">
				<view class="tab-dot" :class="{ 'active-dot': currentTab === 2 }"></view>
				<text class="tab-text">东南亚</text>
			</view>
		</view>

		<!-- 服务图标网格 -->
		<view class="service-grid">
			<view class="service-item" v-for="(item, index) in services" :key="index" @click="selectService(index)">
				<view class="icon-box" :class="{ 'active-icon': currentService === index }">
					<!-- 使用 uni-icons 作为示意，实际项目中可替换为 image -->
					<uni-icons :type="item.icon" size="30" :color="currentService === index ? '#ffffff' : '#666666'"></uni-icons>
				</view>
				<text class="service-name">{{ item.name }}</text>
			</view>
		</view>

		<!-- 底部详情列表 (使用scroll-view) -->
		<scroll-view scroll-y="true" class="detail-list-scroll">
			<view class="detail-list" v-if="currentService !== -1">
				<view class="detail-item" v-for="(item, index) in 1" :key="index" @click="goToDetail">
					<image class="detail-img" src="/static/Country/china.jpg" mode="aspectFill"></image>
					<text class="detail-title">{{ services[currentService].name }} - 详情 {{ index + 1 }}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 0,
				currentService: 1, // 默认选中第二个 "投资架构设计"
				services: [
					{ name: '境外投资备案', icon: 'paperclip' },
					{ name: '投资架构设计', icon: 'map' }, // 替换为 map 图标
					{ name: '公司注册', icon: 'shop' },
					{ name: '法律服务', icon: 'info' }, // 类似天平
					{ name: '知识产权', icon: 'circle' }, // R标
					{ name: '财务服务', icon: 'staff-filled' },
					{ name: '人事服务', icon: 'person' },
					{ name: '公证认证', icon: 'checkbox-filled' }
				]
			}
		},
		methods: {
			close() {
				this.$emit('close');
			},
			selectTab(index) {
				this.currentTab = index;
			},
			selectService(index) {
				this.currentService = index;
			},
			goToDetail() {
				uni.navigateTo({
					url: '/pages/Service/funtion/detail'
				});
			}
		}
	}
</script>

<style lang="scss">
	.service-popup {
		background-color: #ffffff;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		overflow: hidden;
		/* 固定高度，使用 flex 布局 */
		height: 80vh; 
		display: flex;
		flex-direction: column;
		/* 移除之前的 padding-bottom，因为 scroll-view 内部处理 */
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.popup-header {
		/* 固定头部 */
		flex-shrink: 0;
		background-color: #1e90ff;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.popup-title {
		color: #ffffff;
		font-size: 34rpx;
		font-weight: bold;
	}

	.close-btn {
		padding: 10rpx;
	}

	/* Tabs */
	.region-tabs {
		flex-shrink: 0;
		display: flex;
		background-color: #f5f5f5;
		padding: 20rpx 30rpx;
	}

	.tab-item {
		display: flex;
		align-items: center;
		padding: 12rpx 30rpx;
		border-radius: 30rpx;
		margin-right: 20rpx;
		transition: all 0.3s;
	}

	.tab-item.active {
		background-color: #ffffff;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
	}

	.tab-dot {
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		background-color: #cccccc;
		margin-right: 10rpx;
	}

	.tab-dot.active-dot {
		background-color: #1e90ff; /* 选中时的蓝色 */
	}

	.tab-text {
		font-size: 28rpx;
		color: #333333;
	}

	/* Grid */
	.service-grid {
		flex-shrink: 0;
		display: flex;
		flex-wrap: wrap;
		padding: 40rpx 20rpx;
	}

	.service-item {
		width: 25%; /* 4列 */
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.icon-box {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 2rpx solid #eeeeee;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		transition: all 0.3s;
	}

	.icon-box.active-icon {
		background-color: #8bbdf9; /* 浅蓝色背景 */
		border-color: #1e90ff;
		/* 这里的颜色需要根据图调整，图中是蓝色背景 */
		background-color: rgba(30, 144, 255, 0.2);
		border: 2rpx solid #1e90ff;
	}
	
	/* 选中时图标颜色在template中通过props控制 */

	.service-name {
		font-size: 24rpx;
		color: #333333;
		text-align: center;
	}

	/* 底部列表 */
	.detail-list-scroll {
		flex: 1;
		height: 0; /* 配合flex:1 撑开 */
		overflow: hidden;
	}

	.detail-list {
		padding: 0 30rpx;
		border-top: 2rpx solid #f0f0f0;
		padding-top: 30rpx;
		padding-bottom: 100rpx; /* 增加底部留白，防止内容被遮挡 */
	}

	.detail-item {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx; /* 增加列表项间距 */
	}

	.detail-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		margin-right: 20rpx;
	}

	.detail-title {
		font-size: 30rpx;
		color: #333333;
	}
</style>
