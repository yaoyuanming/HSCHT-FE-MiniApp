<template>
	<view class="container">
		<!-- 活动卡片列表 -->
		<view class="activity-list">
			<!-- 骨架屏：首次加载时显示 -->
			<view v-if="isLoading && activities.length === 0 && isFirstLoad" class="skeleton-list">
				<view v-for="i in 3" :key="i" class="skeleton-card">
					<view class="skeleton-image"></view>
					<view class="skeleton-info">
						<view class="skeleton-title"></view>
						<view class="skeleton-meta">
							<view class="skeleton-price"></view>
							<view class="skeleton-btn"></view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 内容列表 -->
			<template v-else>
				<view class="activity-card" v-for="item in activities" :key="item.id" @click="handleCardClick(item)">
					<image class="card-image" :src="item.imageUrl" mode="aspectFill"></image>
					<view class="card-info">
						<text class="card-title">{{item.packageName}}</text>
						<view class="card-meta">
							<view class="meta-item">¥{{item.discountPrice}}</view>
							<button class="reserve-btn">购买</button>
						</view>
					</view>
				</view>
			</template>
			
			<!-- 空状态 -->
			<view v-if="!activities.length && !isLoading && !isFirstLoad" class="empty-state">
				<text>暂无项目，敬请期待</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		computed,
		onMounted,
		ref
	} from 'vue';
	import {
		MyPorjectList
	} from '@/api/project.js'
	import {
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import {
		DecryptionMobilePhone
	} from '@/api/user.js'

	const activities = ref([])
	const pageList = ref({
		pageNum: 1,
		pageSize: 10,
		status: 0
	})
	const totalCount = ref(0)
	const isLoading = ref(false)
	const isFirstLoad = ref(true)


	function handleCardClick(items) {
		uni.navigateTo({
			url: `/pages/project/info?id=${items.id}`
		});
	}

	// 请求列表接口
	const getList = async (reset = false, silent = false) => {
		if (isLoading.value) return;
		
		// 只有首次加载且非静默模式时显示骨架屏
		if (reset && isFirstLoad.value && !silent) {
			isLoading.value = true;
		} else if (!silent && !reset) {
			// 加载更多时显示加载状态
			isLoading.value = true;
		} else {
			// 静默刷新时不显示 loading
			isLoading.value = false;
		}

		try {
			if (reset) {
				pageList.value.pageNum = 1;
				isFirstLoad.value = false;
				// 注意：刷新时不要先清空数据，等新数据回来后再替换
			}
			
			let res = await MyPorjectList(pageList.value)
			if (res.code === 200) {
				totalCount.value = res.total || 0;
				const rows = res.rows || [];
				
				if (reset) {
					// 直接替换，不清空旧数据，利用 Vue 响应式实现无感更新
					activities.value = rows;
				} else {
					// 加载更多：合并数据
					activities.value = [...activities.value, ...rows];
				}
			}
		} catch (err) {
			console.error('列表请求失败：', err);
			// 请求失败时，如果是刷新才清空数据
			if (reset) activities.value = [];
		} finally {
			isLoading.value = false;
		}
	}


	onPullDownRefresh(async () => {
		// 下拉刷新时使用静默刷新，不显示骨架屏
		await getList(true, true)
		uni.stopPullDownRefresh()
	})

	onMounted(async () => {
		await getList(true)
	})

	onReachBottom(async () => {
		if (activities.value.length < totalCount.value && !isLoading.value) {
			pageList.value.pageNum++;
			await getList();
		} else {
			uni.showToast({
				title: '已加载全部数据',
				icon: 'none',
				duration: 1000
			});
		}
	})
</script>

<style scoped>
	.container {
		background-color: #f7f7f7;
		padding-bottom: 24rpx;
		min-height: 100vh;
	}

	/* 活动卡片列表 */
	.activity-list {
		padding: 22rpx;
	}

	.activity-card {
		background-color: #fff;
		border-radius: 18rpx;
		overflow: hidden;
		margin-bottom: 30rpx;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.card-image {
		width: 100%;
		height: 400rpx;
	}

	.card-info {
		padding: 24rpx;
	}

	.card-title {
		display: block;
		font-size: 30rpx;
		color: #333;
		margin-bottom: 16rpx;
		font-weight: bold;
	}

	.card-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.meta-item {
		font-size: 13px;
		color: red;
	}

	.reserve-btn {
		background-color: #5278FF;
		color: #fff;
		font-size: 28rpx;
		border-radius: 20px;
		min-width: 140rpx;
		margin: 0;
	}

	.empty-state {
		padding: 120rpx 0;
		text-align: center;
		color: #b0b0c3;
		font-size: 28rpx;
	}

	/* 骨架屏样式 */
	.skeleton-list {
		padding: 22rpx;
	}

	.skeleton-card {
		background-color: #fff;
		border-radius: 18rpx;
		overflow: hidden;
		margin-bottom: 30rpx;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.skeleton-image {
		width: 100%;
		height: 400rpx;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
	}

	.skeleton-info {
		padding: 24rpx;
	}

	.skeleton-title {
		height: 30rpx;
		width: 70%;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		border-radius: 6rpx;
		margin-bottom: 16rpx;
		animation: skeleton-loading 1.5s ease-in-out infinite;
	}

	.skeleton-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.skeleton-price {
		height: 26rpx;
		width: 100rpx;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		border-radius: 6rpx;
		animation: skeleton-loading 1.5s ease-in-out infinite;
	}

	.skeleton-btn {
		height: 68rpx;
		width: 140rpx;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		border-radius: 20px;
		animation: skeleton-loading 1.5s ease-in-out infinite;
	}

	@keyframes skeleton-loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>