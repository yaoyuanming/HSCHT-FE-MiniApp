<template>
	<view class="pages">
		<!-- 骨架屏 -->
		<view v-if="loading" class="loading-skeleton">
			<view class="skeleton-swiper"></view>
			<view class="skeleton-actions">
				<view class="skeleton-action" v-for="item in 4" :key="item">
					<view class="skeleton-icon"></view>
					<view class="skeleton-label"></view>
				</view>
			</view>
			<view class="skeleton-content">
				<view class="skeleton-title"></view>
				<view
					v-for="(line, index) in skeletonLines"
					:key="line"
					class="skeleton-text"
					:class="{ short: index === skeletonLines.length - 1 }"
				></view>
			</view>
		</view>

		<!-- 实际内容 -->
		<view v-else>
			<view class="swiper-item">
				<up-swiper :list="swiper" keyName="imageUrl" height="162" @click="handelChange" :autoplay="false"
					circular></up-swiper>
			</view>
			<view class="item-colmn">
				<view class="clomn-flex" v-for="item in pageConfig?.actionsList" @click="goToDialogue(item)">
					<image :src="item.iconUrl" mode=""></image>
					<text class="col-title">{{item.actionName}}</text>
				</view>
			</view>

			<view class="spce-info">
				<p class="info-title">公司介绍</p>
				<p class="arter-content">
					<up-markdown :content="pageConfig.content"></up-markdown>
				</p>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		watch
	} from 'vue'
	import { useStore } from 'vuex'
	import {
		onPullDownRefresh
	} from '@/utils/refresh.js'
	import { HomeConfig } from '@/api/home'
	import {
		onShow
	} from '@dcloudio/uni-app'

const pageConfig = ref([])
const swiper = ref([]);
const loading = ref(true)
const skeletonLines = [1, 2, 3, 4]

const store = useStore()
const token = () => store.getters?.token

const tabPages = new Set([
	'pages/Homeconfig/Homeconfig',
	'pages/project/index',
	'pages/Curriculum/index',
	'pages/My/My'
])

const normalizePagePath = (url = '') => {
	if (!url) return ''
	const cleaned = String(url).split('?')[0].split('#')[0]
	return cleaned.startsWith('/') ? cleaned.slice(1) : cleaned
}

const navigateByUrl = (url) => {
	const pagePath = normalizePagePath(url)
	if (!pagePath) return

	if (tabPages.has(pagePath)) {
		uni.switchTab({
			url: `/${pagePath}`
		})
		return
	}

	uni.navigateTo({
		url
	})
}

	// 页面方法
	const goToDialogue = (rows) => {
		if (rows.linkType == 1) {
			navigateByUrl(rows.linkUrl)
		} else {
			uni.openUrl({
				url: rows.linkUrl
			})
		}
	}

	const handelChange = (index) => {
		if (swiper.value[index]?.linkType == 1) {
			navigateByUrl(swiper.value[index]?.linkUrl)
		} else {
			uni.openUrl({
				url: swiper.value[index]?.linkUrl
			})
		}
	}

	async function getConfig() {
		try {
			let res = await HomeConfig()
			if (res.code === 200) {
				swiper.value = res.data?.carouselList
				pageConfig.value = res.data
			}
		} catch (error) {
			console.error('获取配置失败:', error)
		} finally {
			loading.value = false
		}
	}

	onPullDownRefresh(async () => {
		try {
			await getConfig()
			uni.stopPullDownRefresh()
		} catch {
			uni.stopPullDownRefresh()
		}
	})

	watch(
		token,
		(newToken, oldToken) => {
			if (newToken && newToken !== oldToken) {
				getConfig();
			}
		}, {
			immediate: true,
		}
	);
</script>

<style>
	page {
		background-color: #F8F8F8;
	}
</style>

<style scoped lang="scss">
	.pages {
		display: flex;
		flex: 1;
		flex-direction: column;
		height: 100vh;
		padding: 24rpx;
	}

	// 骨架屏样式
	.loading-skeleton {
		.skeleton-swiper {
			height: 320rpx;
			background-color: #e5e5e5;
			border-radius: 16rpx;
			margin-bottom: 24rpx;
			animation: flash 1.5s infinite;
		}

		.skeleton-actions {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 24rpx;
			padding: 16rpx 24rpx;
			background-color: #fff;
			border-radius: 16rpx;

			.skeleton-action {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				gap: 12rpx;
				flex: 1;

				.skeleton-icon {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					background-color: #e5e5e5;
					animation: flash 1.5s infinite;
				}

				.skeleton-label {
					width: 80rpx;
					height: 24rpx;
					border-radius: 999rpx;
					background-color: #e5e5e5;
					animation: flash 1.5s infinite;
				}
			}
		}

		.skeleton-content {
			background-color: #fff;
			padding: 32rpx 48rpx;
			border-radius: 16rpx;

			.skeleton-title {
				height: 40rpx;
					width: 40%;
					margin: 0 auto 32rpx;
				background-color: #e5e5e5;
				border-radius: 8rpx;
				animation: flash 1.5s infinite;
			}

			.skeleton-text {
				height: 30rpx;
					width: 100%;
				background-color: #e5e5e5;
				border-radius: 6rpx;
				margin-bottom: 20rpx;
				animation: flash 1.5s infinite;

				&.short {
						width: 60%;
				}
			}
		}
	}

	@keyframes flash {
		0% {
			opacity: 1;
		}

		50% {
			opacity: 0.5;
		}

		100% {
			opacity: 1;
		}
	}

	.swiper-item {
		/* 轮播区域占满容器宽度，不留内边距，由轮播图自身控制圆角 */
		padding: 0;
		background-color: transparent;
		border-radius: 0;
		height: 162px;
	}

	.item-colmn {
		/* 中间快捷入口卡片：一行图标，白色背景 */
		margin-top: 24rpx;
		background-color: #ffffff;
		border-radius: 16rpx; /* ≈ 8px */
		padding: 16rpx 24rpx; /* 上下 16rpx ≈ 8px，总高度约 96px */
		box-shadow:
			0 2rpx 8rpx rgba(255, 255, 255, 0.9),
			0 4rpx 12rpx rgba(0, 0, 0, 0.08),
			0 8rpx 20rpx rgba(0, 0, 0, 0.03);

		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.item-colmn .clomn-flex {
		/* 每个入口：纵向布局，图标上方、标题下方 */
		flex: 1;
		min-width: 0;
		height: 160rpx; 
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
		border: none;
	}

	.item-colmn .clomn-flex image {
		/* 图标约 30px，整体居中 */
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 8rpx;
	}

	.item-colmn .clomn-flex .col-title {
		font-size: 26rpx; /* ≈ 13px */
		font-weight: 500;
		color: #000000;
		line-height: 40rpx; /* ≈ 20px */
		text-align: center;
		max-width: 140rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.spce-info {
		/* 下方公司介绍卡片 */
		background-color: #ffffff;
		padding: 32rpx 32rpx 40rpx;
		margin-top: 24rpx;
		border-radius: 8rpx 8rpx 0 0;
		flex: 1;
		padding-bottom: 50px;
		box-shadow:
			0 2rpx 8rpx rgba(255, 255, 255, 0.9),
			0 4rpx 12rpx rgba(0, 0, 0, 0.08),
			0 8rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.spce-info .info-title {
		font-size: 30rpx; /* ≈ 15px */
		font-weight: 600;
		text-align: center;
		color: #000000;
	}

	.spce-info .arter-content {
		color: #515163;
		font-size: 26rpx; /* ≈ 13px */
		margin-top: 20rpx;
		line-height: 40rpx; /* ≈ 20px */
		display: block;
		padding: 0;
		border-radius: 0;
		background: transparent;
	}

	.spce-info .arter-content :deep(.u-markdown) {
		padding: 0;
		background: transparent;
		line-height: 1.8;
		color: inherit;
	}

	.spce-info .arter-content :deep(.u-markdown p) {
		text-align: justify;
		text-justify: inter-ideograph;
		word-break: break-all;
		margin: 0 0 20rpx;
		/* text-indent: 2em; // optional */
	}
</style>