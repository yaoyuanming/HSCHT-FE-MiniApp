<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="nav-left" @click="goBack">
					<image src="/static/back.png" mode="widthFix" style="width: 24px; height: 24px;"></image>
				</view>
				<text class="nav-title">指南</text>
				<view class="nav-right"></view>
			</view>
		</view>

		<!-- 内容区域 -->
		<scroll-view scroll-y class="main-content" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
			<!-- 选择国家 -->
			<view class="section-card">
				<text class="section-title">选择国家</text>
				<scroll-view scroll-x class="country-scroll" :show-scrollbar="false">
					<view class="country-list">
						<view class="country-item" :class="{ active: currentCountryId === item.id }"
							v-for="(item, index) in countries" :key="index" @click="selectCountry(item)">
							<view class="country-img-box" :class="{ active: currentCountryId === item.id }">
								<image class="country-img" :src="item.nationalFlagUrl" mode="aspectFill"></image>
							</view>
							<text class="country-name">{{ item.countryName }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 指南列表 -->
			<view class="guide-list">
				<view class="guide-item" v-for="(item, index) in guideList" :key="index" @click="goToDetail(item)">
					<image class="guide-img" :src="item.guideImageUrl" mode="aspectFill"></image>
					<view class="guide-info">
						<text class="guide-title">{{ item.guideName }}</text>
						<text class="guide-desc">{{ formatContent(item.content) }}</text>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view v-if="guideList.length === 0" class="empty-state">
					<text>暂无相关指南</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	import {
		getCountryList
	} from '@/api/country.js'
	import {
		getGuideList,
		getServiceTypeList
	} from '@/api/service.js'

	export default {
		components: {
			UniIcons
		},
		data() {
			return {
				statusBarHeight: 20,
				countries: [],
				currentCountryId: null,
				guideList: []
			}
		},
		onLoad() {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;
			this.fetchData();
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			async fetchData() {
				await this.fetchCountries();
			},
			async fetchCountries() {
				try {
					const res = await getCountryList();
					const list = res.data?.rows || res.rows || res.data || [];
					this.countries = list;
					if (this.countries.length > 0) {
						// 默认选中第一个
						this.selectCountry(this.countries[0]);
					}
				} catch (e) {
					console.error('获取国家列表失败', e);
				}
			},
			selectCountry(item) {
				this.currentCountryId = item.id;
				this.fetchGuides(item.id);
			},
			async fetchGuides(countryId) {
				try {
					uni.showLoading({
						title: '加载中...'
					});
					
					// 1. 获取该国家下的服务类型ID列表，用于后续辅助筛选
					let validServiceTypeIds = [];
					try {
						const typeRes = await getServiceTypeList({ countryId });
						const types = typeRes.data?.rows || typeRes.rows || typeRes.data || [];
						validServiceTypeIds = types.map(t => t.serviceTypeId || t.id || t.typeId).filter(id => id);
					} catch (e) {
						console.error('获取服务类型失败', e);
					}

					// 2. 获取指南列表
					const res = await getGuideList({
						countryId,
						country_id: countryId // 尝试多种参数格式
					});
					let list = res.data?.rows || res.rows || res.data || [];
					
					// 过滤未发布的文章 (status: 0 草稿, 1 已发布)
					list = list.filter(item => item.status == 1);

					// 3. 前端兜底筛选 - 暂时移除，信任后端接口返回的数据
					/*
					if (list.length > 0) {
						const firstItem = list[0];
						
						// 优先使用 countryId/country_id 筛选
						if (firstItem.countryId !== undefined) {
							list = list.filter(item => item.countryId == countryId);
						} else if (firstItem.country_id !== undefined) {
							list = list.filter(item => item.country_id == countryId);
						} 
						// 如果没有国家字段，但有 servicesTypeId
						else if (firstItem.servicesTypeId !== undefined) {
							// 筛选条件：servicesTypeId 等于当前国家ID，或者属于该国家下的服务类型ID
							list = list.filter(item => item.servicesTypeId == countryId || validServiceTypeIds.includes(item.servicesTypeId));
						}
					}
					*/
					
					this.guideList = list;
				} catch (e) {
					console.error('获取指南列表失败', e);
				} finally {
					uni.hideLoading();
				}
			},
			formatContent(content) {
				if (!content) return '';
				// 去除HTML标签
				let text = content.replace(/<[^>]+>/g, "");
				// 截取前50个字符
				return text.length > 40 ? text.substring(0, 40) + '...' : text;
			},
			goToDetail(item) {
				uni.navigateTo({
					url: `/pages/Service/funtion/detail?id=${item.id}&type=guide`
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
	.custom-header {
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

	/* 内容区域 */
	.main-content {
		padding: 15px;
		box-sizing: border-box;
	}

	/* 国家选择区域 */
	.section-card {
		background-color: #ffffff;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
	}

	.section-title {
		font-size: 18px;
		font-weight: bold;
		color: #333333;
		margin-bottom: 15px;
		display: block;
	}

	.country-scroll {
		width: 100%;
		white-space: nowrap;
	}

	.country-list {
		display: flex;
		align-items: flex-start;
	}

	.country-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 20px;
		opacity: 0.6;
		transition: all 0.3s;
	}
	
	.country-item.active {
		opacity: 1;
	}

	.country-img-box {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 8px;
		border: 2px solid transparent;
		transition: all 0.3s;
	}
	
	.country-img-box.active {
		border-color: #1e90ff;
		box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3);
	}

	.country-img {
		width: 100%;
		height: 100%;
	}

	.country-name {
		font-size: 14px;
		color: #333333;
	}
	
	.country-item.active .country-name {
		color: #1e90ff;
		font-weight: bold;
	}

	/* 指南列表区域 */
	.guide-list {
		background-color: #ffffff;
		border-radius: 12px;
		padding: 0 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
	}

	.guide-item {
		display: flex;
		padding: 20px 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.guide-item:last-child {
		border-bottom: none;
	}

	.guide-img {
		width: 80px;
		height: 80px;
		border-radius: 50%; /* 圆形图片 */
		margin-right: 15px;
		flex-shrink: 0;
		background-color: #f5f5f5;
	}

	.guide-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.guide-title {
		font-size: 16px;
		font-weight: bold;
		color: #333333;
		margin-bottom: 8px;
		line-height: 1.4;
	}

	.guide-desc {
		font-size: 13px;
		color: #999999;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2; /* 限制显示两行 */
		overflow: hidden;
	}
	
	.empty-state {
		padding: 40px 0;
		text-align: center;
		color: #999999;
		font-size: 14px;
	}
</style>