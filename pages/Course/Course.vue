<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-nav-bar">
			<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="nav-content">
				<view class="nav-left">
					<uni-icons type="arrowleft" size="24" color="#333333"></uni-icons>
					<text class="nav-title">出海课程</text>
				</view>
				<view class="nav-right">
					<uni-icons type="search" size="24" color="#333333" class="nav-icon"></uni-icons>
					<uni-icons type="notification" size="24" color="#333333" class="nav-icon"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 顶部Tab栏 -->
		<view class="tab-header" :style="{ top: (statusBarHeight + 44) + 'px' }">
			<scroll-view scroll-x="true" class="tab-scroll" :show-scrollbar="false">
				<view class="tab-content">
					<view class="tab-item" 
						v-for="(item, index) in tabs" 
						:key="index" 
						:class="{ active: currentTab === index }"
						@click="switchTab(index)">
						<text class="tab-text">{{ item }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 占位符，防止内容被Tab遮挡 -->
		<view class="content-placeholder" :style="{ height: (statusBarHeight + 44 + 50) + 'px' }"></view>

		<!-- 课程列表 -->
		<view class="course-list">
			<view class="course-card" v-for="(item, index) in courseList" :key="index">
				<view class="card-img-box">
					<image class="card-img" :src="item.image" mode="aspectFill"></image>
				</view>
				<view class="card-content">
					<view class="card-tag-row">
						<text class="card-tag" :style="{ color: item.tagColor, backgroundColor: item.tagBg }">{{ item.tag }}</text>
					</view>
					<text class="card-title">{{ item.title }}</text>
					<text class="card-desc">{{ item.desc }}</text>
					<view class="card-stats">
						<uni-icons type="person" size="14" color="#999999"></uni-icons>
						<text class="stats-text">{{ item.students }}人学习</text>
					</view>
					<view class="card-footer">
						<text class="price">¥{{ item.price }}</text>
						<button class="signup-btn">立即报名</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 分页器 -->
		<view class="pagination">
			<view class="page-btn prev">
				<uni-icons type="left" size="14" color="#666666"></uni-icons>
			</view>
			<view class="page-btn active">1</view>
			<view class="page-btn">2</view>
			<view class="page-btn">3</view>
			<view class="page-btn">4</view>
			<view class="page-btn">5</view>
			<view class="page-btn next">
				<uni-icons type="right" size="14" color="#666666"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: 20, // 默认值
				currentTab: 0,
				tabs: ['全部课程', '跨境电商', '海外营销', '外贸合规', '融资财税', '物流仓储'],
				courseList: [
					{
						image: '/static/Country/china.jpg',
						tag: '国际贸易',
						tagColor: '#1e90ff',
						tagBg: '#e6f7ff',
						title: '进阶必修八门必修课：跨境电商运营',
						desc: '跨境电商运营全流程解析',
						students: '1.2k',
						price: '免费'
					},
					{
						image: '/static/Country/china.jpg',
						tag: '平台运营',
						tagColor: '#9c27b0',
						tagBg: '#f3e5f5',
						title: '亚马逊全球开店实战：从注册到...',
						desc: '新手卖家快速入门指南',
						students: '865',
						price: '免费'
					},
					{
						image: '/static/Country/china.jpg',
						tag: '数字营销',
						tagColor: '#009688',
						tagBg: '#e0f2f1',
						title: '海外独立站引流策略：Google与...',
						desc: 'Facebook广告投放技巧',
						students: '2.5k',
						price: '459'
					},
					{
						image: '/static/Country/china.jpg',
						tag: '物流运输',
						tagColor: '#2196f3',
						tagBg: '#e3f2fd',
						title: '国际物流与供应链管理：海运空运...',
						desc: '降低物流成本的实战技巧',
						students: '980',
						price: '329'
					},
					{
						image: '/static/Country/china.jpg',
						tag: '法律法规',
						tagColor: '#ff5722',
						tagBg: '#fbe9e7',
						title: '跨境电商法律合规：知识产权与税...',
						desc: '规避出海风险的必修课',
						students: '750',
						price: '279'
					},
					{
						image: '/static/Country/china.jpg',
						tag: '语言学习',
						tagColor: '#673ab7',
						tagBg: '#ede7f6',
						title: '商务英语实战：商务谈判与邮件写...',
						desc: '提升跨文化沟通能力',
						students: '1.5k',
						price: '199'
					}
				]
			}
		},
		onLoad() {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;
		},
		methods: {
			switchTab(index) {
				this.currentTab = index;
			}
		}
	}
</script>

<style lang="scss">
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding-bottom: 30rpx;
	}

	/* Tab Header */
	.custom-nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #ffffff;
		z-index: 101;
	}

	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
	}

	.nav-left {
		display: flex;
		align-items: center;
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333333;
		margin-left: 10rpx;
	}

	.nav-right {
		display: flex;
		align-items: center;
	}

	.nav-icon {
		margin-left: 30rpx;
	}

	.tab-header {
		background-color: #ffffff;
		padding: 20rpx 0;
		position: fixed;
		width: 100%;
		z-index: 100;
	}

	.tab-scroll {
		width: 100%;
		white-space: nowrap;
	}

	.tab-content {
		display: flex;
		padding: 0 20rpx;
	}

	.tab-item {
		padding: 20rpx 25rpx;
		background-color: #f5f5f5;
		border-radius: 50rpx;
		gap:10px;
		margin-right: 20rpx;
		font-size: 28rpx;
		color: #666666;
		transition: all 0.3s;
		/* 垂直文本布局 - 双字换行 */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1.4;
		text-align: center;
		flex-shrink: 0; /* 防止挤压 */
	}

	.tab-text {
		/* 移除之前的垂直排版样式 */
	}

	.tab-item.active {
		background-color: #e6f7ff;
		color: #1e90ff;
		font-weight: bold;
	}

	/* Course List */
	.course-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: 20rpx;
	}

	.course-card {
		width: 48%; /* 两列布局 */
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
		display: flex;
		flex-direction: column;
	}

	.card-img-box {
		width: 100%;
		height: 200rpx;
	}

	.card-img {
		width: 100%;
		height: 100%;
	}

	.card-content {
		padding: 20rpx;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-tag-row {
		margin-bottom: 12rpx;
	}

	.card-tag {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		display: inline-block;
	}

	.card-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		line-height: 1.4;
		margin-bottom: 10rpx;
		/* 限制两行 */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		height: 80rpx; /* 固定高度保持对齐 */
	}

	.card-desc {
		font-size: 22rpx;
		color: #999999;
		margin-bottom: 16rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-stats {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.stats-text {
		font-size: 22rpx;
		color: #999999;
		margin-left: 8rpx;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto; /* 推到底部 */
	}

	.price {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}

	.signup-btn {
		margin: 0;
		padding: 0 20rpx;
		height: 50rpx;
		line-height: 50rpx;
		font-size: 22rpx;
		background-color: #1e90ff;
		color: #ffffff;
		border-radius: 25rpx;
		border: none;
	}

	.signup-btn:after {
		border: none;
	}

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0;
	}

	.page-btn {
		width: 70rpx;
		height: 70rpx;
		background-color: #f5f7fa;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 10rpx;
		font-size: 28rpx;
		color: #606266;
		transition: all 0.3s;
	}

	.page-btn.active {
		background-color: #1e90ff;
		color: #ffffff;
		font-weight: bold;
		box-shadow: 0 4rpx 12rpx rgba(30, 144, 255, 0.3);
	}

	.page-btn.prev, .page-btn.next {
		background-color: #f5f7fa;
	}
</style>
