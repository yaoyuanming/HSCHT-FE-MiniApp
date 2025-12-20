<template>
	<view class="container">
		<!-- 更多国家列表 -->
		<view class="country-grid">
			<view class="country-item" v-for="(item, index) in countryList" :key="index" @click="openPopup(item)">
				<image class="country-img" :src="item.nationalFlagUrl" mode="aspectFill"></image>
				<view class="country-overlay">
					<text class="country-name">{{ item.countryName }}</text>
				</view>
			</view>
		</view>

		<!-- 底部弹窗 -->
		<uni-popup ref="popup" type="bottom" :safe-area="false">
			<HomeService ref="homeService" @close="closePopup" :initial-country="selectedCountry"
				:all-countries="countryList"></HomeService>
		</uni-popup>
	</view>
</template>

<script>
	import HomeService from '@/pages/Home/Component/Home_Service.vue'
	import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
	import {
		getCountryList
	} from '@/api/country.js'

	export default {
		components: {
			HomeService,
			UniPopup
		},
		data() {
			return {
				countryList: [],
				selectedCountry: {}
			}
		},
		mounted() {
			this.fetchCountryList()
		},
		methods: {
			async fetchCountryList() {
				try {
					const res = await getCountryList()
					this.countryList = res.data?.rows || res.rows || res.data || []
				} catch (e) {
					console.error('获取国家列表失败', e)
				}
			},
			openPopup(item) {
				this.selectedCountry = item
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