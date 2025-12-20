<template>
	<view class="container">
		<!-- 顶部Banner -->
		<view class="banner">
			<image class="banner-img" :src="detail.articleImageUrl || '/static/Country/china.jpg'" mode="aspectFill"></image>
			<view class="banner-overlay">
				<text class="banner-title">{{ detail.articleName || '全球出海服务解决方案' }}</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content">
			<!-- 价格展示 -->
			<view class="price-block" v-if="detail.price">
				<text class="price-symbol">¥</text>
				<text class="price-value">{{ detail.price }}</text>
			</view>
			
			<!-- 富文本内容 -->
			<rich-text :nodes="detail.content" class="rich-text"></rich-text>
			
			<!-- 如果没有富文本内容，显示默认文本 -->
			<block v-if="!detail.content">
				<view class="text-block">
					<text>{{ detail.articleIntro || '我们提供全方位的出海服务，帮助中国企业顺利进入全球市场，实现品牌国际化和业务增长。' }}</text>
				</view>
			</block>
		</view>

		<!-- 底部按钮 -->
		<view class="footer">
			<button class="submit-btn" @click="consult">下单咨询</button>
		</view>
	</view>
</template>

<script>
	import { getServiceArticleDetail } from '@/api/service.js'

	export default {
		data() {
			return {
				detail: {}
			}
		},
		onLoad(options) {
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
					const res = await getServiceArticleDetail(id)
					if (res.code === 200) {
						this.detail = res.data || {}
						
						// 处理富文本图片宽度
						if (this.detail.content) {
							this.detail.content = this.detail.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto;display:block;"')
						}
						
						// 设置标题
						uni.setNavigationBarTitle({
							title: this.detail.articleName || '服务详情'
						})
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
				uni.showToast({
					title: '咨询功能开发中',
					icon: 'none'
				});
			}
		}
	}
</script>

<style lang="scss">
	.container {
		background-color: #ffffff;
		min-height: 100vh;
		padding-bottom: 120rpx; /* 为底部按钮留出空间 */
	}

	.banner {
		width: 100%;
		height: 400rpx;
		position: relative;
	}

	.banner-img {
		width: 100%;
		height: 100%;
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