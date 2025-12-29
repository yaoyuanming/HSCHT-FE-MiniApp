<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="nav-left" @click="goBack">
					<image src="/static/back.png" mode="aspectFit" class="nav-back-icon"></image>
				</view>
				<text class="nav-title">{{ pageTitle }}</text>
				<view class="nav-right"></view>
			</view>
		</view>

		<!-- 表单内容 -->
		<scroll-view scroll-y class="form-content" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
			<view class="form-container">
				<!-- 咨询内容 -->
				<view class="form-item">
					<view class="label-row">
						<text class="required">*</text>
						<text class="label">咨询内容</text>
					</view>
					<textarea class="textarea" placeholder-style="color:#cccccc"
						placeholder="请输入你要咨询的内容" v-model="formData.intention" />
				</view>

				<!-- 公司名称 -->
				<view class="form-item">
					<view class="label-row">
						<text class="required">*</text>
						<text class="label">公司名称</text>
					</view>
					<input class="input" placeholder-style="color:#cccccc" placeholder="请输入您的公司全称"
						v-model="formData.company" />
				</view>

				<!-- 联系人姓名 -->
				<view class="form-item">
					<view class="label-row">
						<text class="required">*</text>
						<text class="label">联系人姓名</text>
					</view>
					<input class="input" placeholder-style="color:#cccccc" placeholder="请输入联系人姓名"
						v-model="formData.name" />
				</view>

				<!-- 联系人电话 -->
				<view class="form-item">
					<view class="label-row">
						<text class="required">*</text>
						<text class="label">联系人电话</text>
					</view>
					<input class="input" type="number" placeholder-style="color:#cccccc" placeholder="请输入联系人电话"
						v-model="formData.phone" />
				</view>
			</view>
		</scroll-view>

		<!-- 底部提交按钮 -->
		<view class="footer">
			<button class="submit-btn" @click="submit">
				<text>提交咨询</text>
				<uni-icons type="arrowright" size="18" color="#ffffff" style="margin-left: 5px;"></uni-icons>
			</button>
		</view>
	</view>
</template>

<script>
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	import { submitTicket } from '@/api/ticket.js'
	import { utilsConfig } from '@/config/utils.js'

	export default {
		components: {
			UniIcons
		},
		data() {
			return {
				statusBarHeight: 20,
				formData: {
					intention: '',
					company: '',
					name: '',
					phone: ''
				},
				serviceName: '',
				category: 0, // 0:咨询工单, 1:服务工单
				pageTitle: '我要咨询'
			}
		},
		onLoad(options) {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;

			if (options.category) {
				this.category = Number(options.category);
				if (this.category === 1) {
					this.pageTitle = '服务咨询';
				}
			}

			if (options.service) {
				this.serviceName = options.service;
				// 用户要求不再自动填充咨询内容，留空让用户自己输入
				// if (this.category === 1) {
				// 	this.formData.intention = `我对【${options.service}】很感兴趣，想了解更多详情。`;
				// }
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			async submit() {
				// 简单校验
				if (!this.formData.intention) return uni.showToast({
					title: '请填写咨询内容',
					icon: 'none'
				});
				if (!this.formData.company) return uni.showToast({
					title: '请填写公司名称',
					icon: 'none'
				});
				if (!this.formData.name) return uni.showToast({
					title: '请填写联系人姓名',
					icon: 'none'
				});
				if (!this.formData.phone) return uni.showToast({
					title: '请填写联系人电话',
					icon: 'none'
				});

				uni.showLoading({
					title: '提交中...'
				});
				
				try {
					const params = {
						description: this.formData.intention,
						companyName: this.formData.company,
						contactName: this.formData.name,
						contactPhone: this.formData.phone,
						category: this.category, // 使用动态分类
						status: 0, // 0:待处理
						assignTenantId: utilsConfig.tenantId // 传递租户ID
					}
					
					await submitTicket(params)
					
					uni.hideLoading();
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} catch (e) {
					uni.hideLoading();
					console.error('Submit ticket failed:', e)
					uni.showToast({
						title: '提交失败，请重试',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		display: flex;
		flex-direction: column;
	}

	/* 自定义导航栏 */
	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #3b82f6;
		/* 使用更亮的蓝色，接近图示 */
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
		filter: brightness(0) invert(1);
	}

	/* 表单内容 */
	.form-content {
		flex: 1;
		padding-bottom: 100px;
		/* 为底部按钮留出空间 */
	}

	.form-container {
		padding: 20px;
	}

	.form-item {
		margin-bottom: 25px;
	}

	.label-row {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}

	.required {
		color: #ff4d4f;
		margin-right: 4px;
		font-weight: bold;
	}

	.label {
		font-size: 16px;
		color: #333333;
		font-weight: 500;
	}

	.textarea {
		width: 100%;
		height: 120px;
		background-color: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 15px;
		font-size: 14px;
		box-sizing: border-box;
	}

	.input {
		width: 100%;
		height: 50px;
		background-color: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 25px;
		/* 圆角输入框 */
		padding: 0 20px;
		font-size: 14px;
		box-sizing: border-box;
	}

	.example-text {
		display: block;
		margin-top: 10px;
		font-size: 12px;
		color: #9ca3af;
		line-height: 1.5;
	}

	/* 底部按钮 */
	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #ffffff;
		padding: 15px 20px;
		padding-bottom: calc(15px + constant(safe-area-inset-bottom));
		padding-bottom: calc(15px + env(safe-area-inset-bottom));
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
	}

	.submit-btn {
		background-color: #3b82f6;
		color: #ffffff;
		height: 50px;
		border-radius: 4px;
		/* 稍微直角一点，或者是全圆角？图里看起来是方形背景全宽按钮 */
		/* 图里是全宽蓝色背景，文字居中，带箭头 */
		/* 修正：图里是全宽蓝色条，文字居中。 */
		border-radius: 0;
		/* 如果是全宽贴底 */
		/* 等等，图2底部是一个悬浮的蓝色长条按钮，还是贴底的bar？ */
		/* 看图2底部，是一条蓝色的条，上面写着“提交咨询 ->”。这通常是贴底的footer bar。 */
		/* 所以我把 footer padding 去掉，让按钮填满 */
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: bold;
		border: none;
	}

	/* 重新调整 footer 样式以匹配全宽按钮 */
	.footer {
		padding: 0;
		/* 移除内边距 */
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		background-color: #3b82f6;
		/* 背景色直接设为蓝色 */
	}

	.submit-btn {
		background-color: transparent;
		/* 按钮背景透明 */
		border-radius: 0;
	}

	/* 去除按钮默认边框 */
	.submit-btn::after {
		border: none;
	}
</style>