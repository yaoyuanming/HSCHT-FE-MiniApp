<template>
	<view class="container">
		<!-- 更多国家列表 -->
		<view class="country-grid">
			<view class="country-item" v-for="(item, index) in countryList" :key="index" @click="openPopup">
				<image class="country-img" :src="item.image" mode="aspectFill"></image>
				<view class="country-overlay">
					<text class="country-name">{{ item.name }}</text>
				</view>
			</view>
		</view>

		<!-- 底部弹窗 -->
		<uni-popup ref="popup" type="bottom" :safe-area="false">
			<HomeService @close="closePopup"></HomeService>
		</uni-popup>
	</view>
</template>

<script>
	import HomeService from '@/pages/Home/Component/Home_Service.vue'

	export default {
		components: {
			HomeService
		},
		data() {
			return {
				// 模拟更多国家数据，全部使用占位图
				countryList: Array.from({ length: 15 }).map((_, i) => ({
					name: '国家名称',
					image: '/static/Country/china.jpg'
				}))
			}
		},
		methods: {
			openPopup() {
				this.$refs.popup.open()
			},
			closePopup() {
				this.$refs.popup.close()
			}
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 20rpx;
		background-color: #ffffff;
		min-height: 100vh;
	}

	.country-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.country-item {
		width: 30%; /* 三列布局，留出间隙 */
		height: 200rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		position: relative;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	}

	.country-img {
		width: 100%;
		height: 100%;
	}

	.country-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.country-name {
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.5);
	}
</style>
