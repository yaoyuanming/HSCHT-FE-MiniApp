<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="nav-left" @click="goBack">
					<image src="/static/back.png" mode="aspectFit" class="nav-back-icon"></image>
				</view>
				<text class="nav-title">涉外政务</text>
				<view class="nav-right"></view> <!-- 占位，保持标题居中 -->
			</view>
		</view>

		<!-- 内容区域 -->
		<scroll-view scroll-y class="main-content" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
			<view class="section" v-for="(section, index) in sections" :key="index">
				<view class="section-header">
					<view class="header-left">
						<!-- 简单的图标装饰 -->
						<uni-icons v-if="index === 0" type="paperplane-filled" size="20" color="#1e90ff"></uni-icons>
						<text class="section-title">{{ section.title }}</text>
					</view>
					<text class="collapse-text">收起</text>
				</view>

				<view class="grid-container">
					<view class="grid-item" v-for="(item, idx) in section.items" :key="idx" @click="handleItemClick(item)">
						<view class="item-icon-box" :class="'bg-' + (idx % 4)">
							<uni-icons :type="item.icon" size="28" :color="item.color || '#1e90ff'"></uni-icons>
						</view>
						<text class="item-text">{{ item.name }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'

	export default {
		components: {
			UniIcons
		},
		data() {
			return {
				statusBarHeight: 20, // 默认状态栏高度
				sections: [{
						title: '出口贸易服务',
						items: [{
								name: '报关报检服务',
								icon: 'checkbox-filled',
								color: '#1e90ff'
							},
							{
								name: '国际物流安排',
								icon: 'paperplane-filled',
								color: '#1e90ff'
							},
							{
								name: '外汇结算服务',
								icon: 'wallet-filled',
								color: '#1e90ff'
							},
							{
								name: '出口退税办理',
								icon: 'compose',
								color: '#1e90ff'
							}
						]
					},
					{
						title: '境外投资服务',
						items: [{
								name: '投资环境评估',
								icon: 'globe-filled',
								color: '#1e90ff'
							},
							{
								name: '项目可行性研究',
								icon: 'list',
								color: '#1e90ff'
							},
							{
								name: '海外公司注册',
								icon: 'shop-filled',
								color: '#1e90ff'
							},
							{
								name: '投资融资服务',
								icon: 'vip-filled',
								color: '#1e90ff'
							}
						]
					},
					{
						title: '综合支持服务',
						items: [{
								name: '多语言翻译服务',
								icon: 'chat-filled',
								color: '#1e90ff'
							},
							{
								name: '法律文书公证',
								icon: 'folder-add-filled',
								color: '#1e90ff'
							},
							{
								name: '商务谈判支持',
								icon: 'staff-filled',
								color: '#1e90ff'
							},
							{
								name: '市场调研报告',
								icon: 'bars',
								color: '#1e90ff'
							}
						]
					}
				]
			}
		},
		onLoad() {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			handleItemClick(item) {
				uni.navigateTo({
					url: `/pages/Home/Component/consult?service=${item.name}`
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
	}

	/* 自定义导航栏 */
	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #1e90ff;
		z-index: 999;
	}

	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 15px;
	}

	.nav-left,
	.nav-right {
		width: 40px;
		display: flex;
		align-items: center;
	}

	.nav-title {
		color: #ffffff;
		font-size: 18px;
		font-weight: 500;
	}

	.nav-back-icon {
		width: 24px;
		height: 24px;
		/* 如果图标是黑色的，反转为白色以适应蓝色背景 */
		filter: brightness(0) invert(1);
	}

	/* 内容区域 */
	.main-content {
		padding-bottom: 30px;
	}

	.section {
		background-color: #ffffff;
		margin: 15px;
		border-radius: 12px;
		padding: 15px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.section-title {
		font-size: 16px;
		font-weight: bold;
		color: #333333;
	}

	.collapse-text {
		font-size: 12px;
		color: #999999;
	}

	/* 网格布局 */
	.grid-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 15px;
	}

	.grid-item {
		background-color: #ffffff;
		border: 1px solid #eeeeee;
		border-radius: 12px;
		padding: 20px 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		transition: all 0.2s;
	}

	.grid-item:active {
		background-color: #f9f9f9;
	}

	.item-icon-box {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #e6f7ff;
	}

	.item-text {
		font-size: 14px;
		color: #333333;
		text-align: center;
	}
</style>