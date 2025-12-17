<template>
	<view class="container">
		<!-- Custom Header -->
		<view class="custom-header">
			<view class="status-bar"></view>
			<view class="nav-bar">
				<view class="left-icon" @click="goBack">
					<uni-icons type="arrowleft" size="20" color="#fff"></uni-icons>
				</view>
				<view class="title">涉外政务</view>
				<view class="right-placeholder"></view>
			</view>
		</view>

		<!-- Content Area -->
		<scroll-view scroll-y class="content" :style="{ paddingTop: headerHeight + 'px' }">
			<view class="section" v-for="(section, index) in sections" :key="index">
				<view class="section-header" @click="toggleSection(index)">
					<view class="header-left">
						<uni-icons :type="section.icon" size="24" color="#333" class="section-icon"></uni-icons>
						<text class="section-title">{{ section.title }}</text>
					</view>
					<view class="header-right">
						<text class="collapse-text">{{ section.collapsed ? '展开' : '收起' }}</text>
					</view>
				</view>
				
				<view class="section-body" v-if="!section.collapsed">
					<view class="grid-container">
						<view class="grid-item" v-for="(item, idx) in section.items" :key="idx">
							<view class="card">
								<view class="icon-wrapper">
									<uni-icons :type="item.icon" size="24" color="#1e90ff"></uni-icons>
								</view>
								<text class="card-text">{{ item.name }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<!-- Bottom spacing -->
			<view style="height: 40rpx;"></view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				headerHeight: 0,
				statusBarHeight: 0,
				sections: [
					{
						title: '出口贸易服务',
						icon: 'paperplane-filled', // Placeholder for Ship icon
						collapsed: false,
						items: [
							{ name: '报关报检服务', icon: 'list' },
							{ name: '国际物流安排', icon: 'map-filled' },
							{ name: '外汇结算服务', icon: 'wallet-filled' },
							{ name: '出口退税办理', icon: 'compose' }
						]
					},
					{
						title: '境外投资服务',
						icon: 'world-filled', // Placeholder for Globe icon
						collapsed: false,
						items: [
							{ name: '投资环境评估', icon: 'globe-filled' },
							{ name: '项目可行性研究', icon: 'checkbox-filled' },
							{ name: '海外公司注册', icon: 'home-filled' },
							{ name: '投资融资服务', icon: 'vip-filled' }
						]
					},
					{
						title: '综合支持服务',
						icon: 'staff-filled', // Placeholder for Support icon
						collapsed: false,
						items: [
							{ name: '多语言翻译服务', icon: 'chat-filled' },
							{ name: '法律文书公证', icon: 'auth-filled' },
							{ name: '商务谈判支持', icon: 'chatboxes-filled' },
							{ name: '市场调研报告', icon: 'search' }
						]
					}
				]
			}
		},
		onLoad() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			// Navbar height usually 44px
			this.headerHeight = this.statusBarHeight + 44;
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			toggleSection(index) {
				this.sections[index].collapsed = !this.sections[index].collapsed;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
	}

	.custom-header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #1e90ff;
		z-index: 999;
		color: #fff;
		
		.status-bar {
			height: var(--status-bar-height);
		}
		
		.nav-bar {
			height: 44px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 20rpx;
			
			.left-icon {
				width: 60rpx;
				height: 60rpx;
				background-color: rgba(255, 255, 255, 0.2);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			
			.title {
				font-size: 34rpx;
				font-weight: bold;
			}
			
			.right-placeholder {
				width: 60rpx;
			}
		}
	}

	.content {
		padding: 20rpx;
		box-sizing: border-box;
		height: 100vh;
	}

	.section {
		background-color: #fff;
		margin-bottom: 20rpx;
		border-radius: 12rpx;
		padding: 0 20rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1px solid #f0f0f0;
		
		.header-left {
			display: flex;
			align-items: center;
			gap: 10rpx;
			
			.section-icon {
				color: #1e90ff !important; 
			}
			
			.section-title {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}
		}
		
		.header-right {
			.collapse-text {
				font-size: 24rpx;
				color: #999;
			}
		}
	}

	.section-body {
		padding: 20rpx 0;
	}

	.grid-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.grid-item {
		width: 48%;
		margin-bottom: 20rpx;
	}

	.card {
		background-color: #fff;
		border: 1px solid #ebeef5;
		border-radius: 16rpx;
		padding: 40rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 12rpx 0 rgba(0, 0, 0, 0.05);
		
		.icon-wrapper {
			width: 80rpx;
			height: 80rpx;
			background-color: #e6f1fc;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 20rpx;
		}
		
		.card-text {
			font-size: 26rpx;
			color: #333;
			font-weight: 500;
		}
	}
</style>