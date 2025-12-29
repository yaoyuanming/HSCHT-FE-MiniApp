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
			<view class="tab-item" :class="{ active: currentTab === index }" v-for="(item, index) in allCountries"
				:key="index" @click="selectTab(index)">
				<view class="tab-dot" :class="{ 'active-dot': currentTab === index }"></view>
				<text class="tab-text">{{ item.countryName }}</text>
			</view>
		</view>

		<!-- 服务图标网格 -->
		<view class="service-grid">
			<view class="service-item" v-for="(item, index) in services" :key="index" @click="selectService(index)">
				<view class="icon-box" :class="{ 'active-icon': currentService === index }">
					<image class="service-icon" :src="item.iconUrl" mode="aspectFit" v-if="item.iconUrl"></image>
					<uni-icons type="help" size="30" color="#666666" v-else></uni-icons>
				</view>
				<text class="service-name">{{ item.typeName }}</text>
			</view>
		</view>

		<!-- 底部详情列表 (使用scroll-view) -->
		<scroll-view scroll-y="true" class="detail-list-scroll">
			<block v-if="articles && articles.length > 0">
				<view class="detail-list">
					<view class="detail-item" v-for="(item, index) in articles" :key="index" @click="goToDetail(item)">
						<image class="detail-img" :src="item.articleImageUrl" mode="aspectFill"></image>
						<text class="detail-title">{{ item.articleName }}</text>
					</view>
				</view>
			</block>
			<view class="empty-state" v-else>
				<uni-icons type="info" size="60" color="#e0e0e0"></uni-icons>
				<text class="empty-text">暂无相关服务</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	import {
		getServiceTypeList,
		getServiceArticleList
	} from '@/api/service.js'

	export default {
		components: {
			UniIcons
		},
		props: {
			initialCountry: {
				type: Object,
				default: () => ({})
			},
			allCountries: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				currentTab: 0,
				currentService: -1,
				services: [],
				articles: [],
			}
		},
		watch: {
			allCountries: {
				handler(newVal) {
					// 
				},
				immediate: true
			},
			initialCountry: {
				handler(newVal) {
					this.initDataByCountry(newVal)
				},
				immediate: true,
				deep: true
			}
		},
		mounted() {
			// 如果有初始国家，watch 会处理；如果没有，可以加载默认数据
			if (!this.initialCountry || !this.initialCountry.id) {
				this.fetchServiceTypes()
			}
		},
		methods: {
			/**
			 * 基于ID关联的多级数据筛选方法
			 * 输入：国家对象 (包含 id, continent)
			 * 逻辑：
			 * 1. 确定所属洲 -> 切换Tab
			 * 2. 筛选服务类型 -> fetchServiceTypes({ countryId })
			 * 3. 筛选文章 -> selectService(0) -> fetchArticles({ servicesTypeId })
			 */
			initDataByCountry(country) {
				if (!country || !country.id) return

				// 1. 根据 country.id 自动选中对应Tab
				if (this.allCountries && this.allCountries.length > 0) {
					const index = this.allCountries.findIndex(item => item.id === country.id)
					if (index !== -1) {
						this.currentTab = index
					}
				}

				// 2. 根据 countryId 筛选服务类型
				this.fetchServiceTypes({
					countryId: country.id
				})
			},
			async fetchServiceTypes(params = {}) {
				try {
					// 重置选中状态
					this.currentService = -1
					this.services = []
					this.articles = []
					
					const res = await getServiceTypeList(params)
					this.services = res.data?.rows || res.rows || res.data || []
					
					// 默认不选中服务，直接加载该国家的所有文章
					if (params.countryId) {
						this.fetchArticles({
							countryId: params.countryId
						})
					}
				} catch (e) {
					console.error('获取服务类型失败', e)
				}
			},
			async fetchArticles(params = {}) {
				try {
					uni.showLoading({
						title: '加载中...'
					})
					const res = await getServiceArticleList(params)
					let list = res.data?.rows || res.rows || res.data || []
					// 过滤未发布的文章 (status: 0 草稿, 1 已发布)
					this.articles = list.filter(item => item.status == 1)
				} catch (e) {
					console.error('获取文章列表失败', e)
				} finally {
					uni.hideLoading()
				}
			},
			close() {
				this.$emit('close');
			},
			selectTab(index) {
				this.currentTab = index;
				const country = this.allCountries[index];
				if (country) {
					this.fetchServiceTypes({
						countryId: country.id
					})
				}
			},
			selectService(index) {
				// 如果点击已选中的服务，则取消选中并显示全部
				if (this.currentService === index) {
					this.currentService = -1;
					const country = this.allCountries[this.currentTab];
					if (country) {
						this.fetchArticles({
							countryId: country.id
						})
					}
					return;
				}

				this.currentService = index;
				const service = this.services[index];
				// console.log('Selected service:', service)
				if (service) {
					// 尝试获取 ID，优先 serviceTypeId，其次 id
					const id = service.serviceTypeId || service.id || service.typeId
					// console.log('Using Type ID:', id)
					
					if (!id) {
						console.warn('未找到服务类型ID', service)
						return
					}

					// 先清空列表，给予视觉反馈
					this.articles = []
					
					// 使用 servicesTypeId 作为参数名，并再次确认
					console.log('Fetching articles for servicesTypeId:', id)
					this.fetchArticles({
						servicesTypeId: id
					})
				}
			},
			goToDetail(item) {
				uni.navigateTo({
					url: `/pages/Service/funtion/detail?id=${item.id}`
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
		overflow-x: auto; /* 允许横向滚动 */
		white-space: nowrap;
	}

	.tab-item {
		display: flex;
		align-items: center;
		padding: 12rpx 30rpx;
		border-radius: 30rpx;
		margin-right: 20rpx;
		transition: all 0.3s;
		flex-shrink: 0;
	}

	.tab-item.active {
		background-color: #ffffff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.tab-dot {
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		background-color: #cccccc;
		margin-right: 10rpx;
	}

	.tab-dot.active-dot {
		background-color: #1e90ff;
		/* 选中时的蓝色 */
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
		width: 25%;
		/* 4列 */
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
		overflow: hidden; 
	}

	.service-icon {
		width: 60%;
		height: 60%;
	}

	.icon-box.active-icon {
		background-color: #8bbdf9;
		/* 浅蓝色背景 */
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
		height: 0;
		/* 配合flex:1 撑开 */
		overflow: hidden;
	}

	.detail-list {
		padding: 0 30rpx;
		border-top: 2rpx solid #f0f0f0;
		padding-top: 30rpx;
		padding-bottom: 100rpx;
		/* 增加底部留白，防止内容被遮挡 */
	}

	.detail-item {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		/* 增加列表项间距 */
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
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 100rpx;
	}
	
	.empty-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #999999;
	}
</style>
