<template>
	<view class="container">
		<!-- 顶部Banner -->
		<view class="banner">
			<image class="banner-img" :src="detail.imageUrl || '/static/Country/china.jpg'" mode="widthFix"></image>
			<view class="banner-overlay" v-if="type === 'service'">
				<text class="banner-title">{{ detail.title || '全球出海服务解决方案' }}</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content">
			<!-- 指南模式下的标题 -->
			<view class="guide-title-box" v-if="type === 'guide'">
				<text class="guide-main-title">{{ detail.title }}</text>
			</view>

			<!-- 价格展示 (仅服务) -->
			<view class="price-block" v-if="type === 'service' && detail.price">
				<text class="price-symbol">¥</text>
				<text class="price-value">{{ detail.price }}</text>
			</view>
			
			<!-- 富文本内容 -->
			<rich-text :nodes="detail.content" class="rich-text"></rich-text>
			
			<!-- 如果没有富文本内容，显示默认文本 -->
			<block v-if="!detail.content">
				<view class="text-block">
					<rich-text :nodes="detail.intro || '我们提供全方位的出海服务，帮助中国企业顺利进入全球市场，实现品牌国际化和业务增长。'" class="rich-text"></rich-text>
				</view>
			</block>
		</view>

		<!-- 底部按钮 (仅服务) -->
		<view class="footer" v-if="type === 'service'">
			<button class="submit-btn" @click="consult">下单咨询</button>
		</view>
	</view>
</template>

<script>
	import { getServiceArticleDetail, getGuideDetail } from '@/api/service.js'

	export default {
		data() {
			return {
				detail: {},
				type: 'service' // service | guide
			}
		},
		onLoad(options) {
			if (options.type) {
				this.type = options.type
			}
			if (options.id) {
				this.getDetail(options.id)
			}
		},
		methods: {
			async getDetail(id) {
				try {
					uni.showLoading({
						title: '加载中...'
					})
					let res = {}
					if (this.type === 'guide') {
						res = await getGuideDetail(id)
					} else {
						res = await getServiceArticleDetail(id)
					}

					if (res.code === 200) {
						const data = res.data || {}
						
						// 数据标准化
						if (this.type === 'guide') {
							this.detail = {
								...data,
								title: data.guideName,
								imageUrl: data.guideImageUrl,
								content: data.content,
								intro: ''
							}
							uni.setNavigationBarTitle({
								title: '指南详情'
							})
						} else {
							this.detail = {
								...data,
								title: data.articleName,
								imageUrl: data.articleImageUrl,
								content: data.content,
								intro: data.articleIntro,
								price: data.price
							}
							uni.setNavigationBarTitle({
								title: this.detail.title || '服务详情'
							})
						}
						
						// 处理富文本图片宽度和换行
						if (this.detail.content) {
							this.detail.content = this.detail.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto;display:block;"')
							this.detail.content = this.detail.content.replace(/\n/g, '<br/>')
						}
						
						// 处理简介换行
						if (this.detail.intro) {
							this.detail.intro = this.detail.intro.replace(/\n/g, '<br/>')
						}
					}
				} catch (e) {
					console.error('获取详情失败', e)
					uni.showToast({
						title: '获取详情失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			consult() {
				// 跳转到咨询页面，传递服务名称和类型(1:服务工单)
				uni.navigateTo({
					url: `/pages/Home/Component/consult?category=1&service=${encodeURIComponent(this.detail.title || '')}`
				})
			}
		}
	}
</script>

<style lang="scss">
	.container {
		background-color: #ffffff;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	.banner {
		width: 100%;
		position: relative;
	}

	.banner-img {
		width: 100%;
		display: block; /* 消除图片底部间隙 */
	}

	.banner-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 30rpx;
		background: linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0));
		box-sizing: border-box;
	}

	.banner-title {
		color: #ffffff;
		font-size: 36rpx;
		font-weight: bold;
	}

	.content {
		padding: 40rpx 30rpx;
	}
	
	.guide-title-box {
		margin-bottom: 30rpx;
	}
	
	.guide-main-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333333;
		line-height: 1.4;
	}
	
	.price-block {
		margin-bottom: 30rpx;
		color: #ff4d4f;
		font-weight: bold;
	}
	
	.price-symbol {
		font-size: 28rpx;
	}
	
	.price-value {
		font-size: 40rpx;
	}

	.text-block {
		margin-bottom: 30rpx;
		font-size: 28rpx;
		color: #666666;
		line-height: 1.8;
		text-align: justify;
	}
	
	.rich-text {
		font-size: 28rpx;
		color: #333333;
		line-height: 1.8;
	}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
		box-sizing: border-box;
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}

	.submit-btn {
		background-color: #1e90ff;
		color: #ffffff;
		border-radius: 44rpx;
		font-size: 32rpx;
		height: 88rpx;
		line-height: 88rpx;
		border: none;
		
		&:after {
			border: none;
		}
	}
</style>