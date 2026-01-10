<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="left-icon" @click="goBack">
					<uni-icons type="back" size="24" color="#fff"></uni-icons>
				</view>
				<text class="nav-title">健康档案详情</text>
				<view class="right-placeholder"></view>
			</view>
		</view>
		<!-- 占位符 -->
		<view class="nav-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

		<scroll-view scroll-y class="content-scroll" v-if="detail">
			<view class="content-wrapper">
				<!-- 基本信息卡片 -->
				<view class="info-card">
					<view class="card-header">基本信息</view>
					
					<view class="info-grid">
						<view class="info-item">
							<view class="label-row">
								<uni-icons type="person-filled" size="18" color="#2b85e4"></uni-icons>
								<text class="label" :class="{ required: isEditing }">姓名</text>
							</view>
							<text class="value" v-if="!isEditing">{{ detail.name }}</text>
							<input class="input" type="text" v-model="editForm.name" placeholder="请输入姓名" placeholder-class="placeholder" v-else />
						</view>
						
						<view class="info-item">
							<view class="label-row">
								<!-- 性别图标需要根据性别显示 -->
								<uni-icons :type="(isEditing ? editForm.sex : detail.sex) === '0' ? 'staff-filled' : 'staff'" size="18" color="#2b85e4"></uni-icons>
								<text class="label">性别</text>
							</view>
							<text class="value" v-if="!isEditing">{{ detail.sex === '0' ? '男' : '女' }}</text>
							<view class="radio-group" v-else>
								<view class="radio-item" :class="{ active: editForm.sex === '0' }" @click="editForm.sex = '0'">
									<view class="radio-circle">
										<view class="radio-inner" v-if="editForm.sex === '0'"></view>
									</view>
									<text>男</text>
								</view>
								<view class="radio-item" :class="{ active: editForm.sex === '1' }" @click="editForm.sex = '1'">
									<view class="radio-circle">
										<view class="radio-inner" v-if="editForm.sex === '1'"></view>
									</view>
									<text>女</text>
								</view>
							</view>
						</view>
						
						<view class="info-item">
							<view class="label-row">
								<uni-icons type="calendar-filled" size="18" color="#2b85e4"></uni-icons>
								<text class="label">年龄</text>
							</view>
							<text class="value" v-if="!isEditing">{{ detail.age }}岁</text>
							<input class="input" type="number" v-model="editForm.age" placeholder="请输入年龄" placeholder-class="placeholder" v-else />
						</view>
						
						<view class="info-item">
							<view class="label-row">
								<image src="/static/my/height.png" class="custom-icon" mode="aspectFit" v-if="false"></image>
								<uni-icons type="compose" size="18" color="#2b85e4"></uni-icons>
								<text class="label">身高(cm)</text>
							</view>
							<text class="value" v-if="!isEditing">{{ detail.height }}</text>
							<input class="input" type="digit" v-model="editForm.height" placeholder="请输入身高" placeholder-class="placeholder" @input="calculateBMI" v-else />
						</view>
						
						<view class="info-item">
							<view class="label-row">
								<uni-icons type="info-filled" size="18" color="#2b85e4"></uni-icons>
								<text class="label">体重(kg)</text>
							</view>
							<text class="value" v-if="!isEditing">{{ detail.weight }}</text>
							<input class="input" type="digit" v-model="editForm.weight" placeholder="请输入体重" placeholder-class="placeholder" @input="calculateBMI" v-else />
						</view>
						
						<view class="info-item">
							<view class="label-row">
								<uni-icons type="heart-filled" size="18" color="#2b85e4"></uni-icons>
								<text class="label">BMI</text>
							</view>
							<view class="value-row" v-if="!isEditing">
								<text class="value">{{ detail.bim }}</text>
								<text class="bmi-status" :class="getBMIStatusClass(detail.bim)">({{ getBMIStatus(detail.bim) }})</text>
							</view>
							<input class="input disabled" type="text" v-model="editForm.bmi" placeholder="自动计算" disabled placeholder-class="placeholder" v-else />
						</view>
						
						<view class="info-item full-width">
							<view class="label-row">
								<uni-icons type="phone-filled" size="18" color="#2b85e4"></uni-icons>
								<text class="label" :class="{ required: isEditing }">电话号</text>
							</view>
							<text class="value" v-if="!isEditing">{{ detail.phone }}</text>
							<input class="input" type="number" v-model="editForm.phone" placeholder="请输入电话号" placeholder-class="placeholder" v-else />
						</view>
						
						<view class="info-item full-width">
							<view class="label-row">
								<uni-icons type="contact-filled" size="18" color="#2b85e4"></uni-icons>
								<text class="label">身份证号</text>
							</view>
							<text class="value" v-if="!isEditing">{{ maskIdCard(detail.idCard) }}</text>
							<input class="input" type="idcard" v-model="editForm.idCard" placeholder="请输入身份证号" placeholder-class="placeholder" v-else />
						</view>
						
						<view class="info-item full-width">
							<view class="label-row">
								<uni-icons type="list" size="18" color="#2b85e4"></uni-icons>
								<text class="label">建档日期</text>
							</view>
							<text class="value" v-if="!isEditing">{{ formatDate(detail.createTime) }}</text>
							<picker mode="date" :value="editForm.createDate" @change="onDateChange" v-else>
								<view class="picker-view input" :class="{ 'has-value': editForm.createDate }">
									{{ editForm.createDate || '请选择建档日期' }}
								</view>
							</picker>
						</view>
						
						<view class="info-item full-width">
							<view class="label-row">
								<uni-icons type="staff-filled" size="18" color="#2b85e4"></uni-icons>
								<text class="label">紧急联系人</text>
							</view>
							<view class="contact-col" v-if="!isEditing">
								<text class="value">{{ detail.emergencyContact }}</text>
							</view>
							<input class="input" type="text" v-model="editForm.emergencyContact" placeholder="请输入紧急联系人" placeholder-class="placeholder" v-else />
						</view>
						
						<view class="info-item full-width">
							<view class="label-row">
								<uni-icons type="location-filled" size="18" color="#2b85e4"></uni-icons>
								<text class="label">家庭住址</text>
							</view>
							<text class="value address-text" v-if="!isEditing">{{ detail.address }}</text>
							<textarea class="textarea input" v-model="editForm.address" placeholder="请输入家庭住址" placeholder-class="placeholder" auto-height v-else />
						</view>
					</view>
				</view>

				<!-- 基础病症卡片 -->
				<view class="info-card">
					<view class="card-header space-between">
						<view class="header-left">
							<uni-icons type="heart-filled" size="20" color="#2b85e4" style="margin-right: 10rpx;"></uni-icons>
							基础病症
						</view>
						<view class="add-btn" @click="addDisease" v-if="isEditing">
							<text class="plus">+</text>
							<text>添加病症</text>
						</view>
					</view>
					
					<view class="disease-list" v-if="!isEditing">
						<block v-if="diseaseList.length > 0">
							<view class="disease-item" v-for="(item, index) in diseaseList" :key="index">
								<text class="disease-name">{{ item.symptomsName }}</text>
								<text class="disease-desc">描述：{{ item.symptomsDescription }}</text>
							</view>
						</block>
						<view class="empty-disease" v-else>
							<text>暂无基础病症记录</text>
						</view>
					</view>

					<view class="disease-list" v-else>
						<view class="disease-card-edit" v-for="(item, index) in editForm.diseaseList" :key="index">
							<view class="disease-header-edit">
								<text class="disease-index">病症 {{ index + 1 }}</text>
								<view class="delete-btn" @click="removeDisease(index)">
									<uni-icons type="closeempty" size="16" color="#ff4d4f"></uni-icons>
								</view>
							</view>
							
							<view class="form-item-edit">
								<text class="label-edit">病症名称</text>
								<input class="input-edit" type="text" v-model="item.symptomsName" placeholder="请输入病症名称" placeholder-class="placeholder" />
							</view>
							
							<view class="form-item-edit no-border">
								<text class="label-edit">描述</text>
								<textarea class="textarea-edit" v-model="item.symptomsDescription" placeholder="请输入病症描述" placeholder-class="placeholder" auto-height />
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="footer-actions" v-if="!isEditing">
				<button class="action-btn edit" @click="handleEdit">
					<uni-icons type="compose" size="16" color="#fff"></uni-icons>
					<text>编辑档案</text>
				</button>
				<button class="action-btn share" @click="handleShare">
					<uni-icons type="redo" size="16" color="#2b85e4"></uni-icons>
					<text>分享档案</text>
				</button>
			</view>

			<view class="footer-actions" v-else>
				<button class="action-btn cancel" @click="cancelEdit">
					<text>取消</text>
				</button>
				<button class="action-btn save" @click="handleSave">
					<uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
					<text>保存修改</text>
				</button>
			</view>
			
			<view class="safe-area-bottom"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { 
		getHealthRecordList, 
		getUnderlyingMedicalConditionList,
		updateHealthRecord,
		updateUnderlyingMedicalCondition,
		addUnderlyingMedicalCondition
	} from '@/api/health_record.js'

	export default {
		data() {
			return {
				statusBarHeight: 20,
				detail: null,
				diseaseList: [],
				isEditing: false,
				editForm: {
					name: '',
					sex: '0',
					age: '',
					height: '',
					weight: '',
					bmi: '',
					phone: '',
					idCard: '',
					createDate: '',
					emergencyContact: '',
					address: '',
					diseaseList: []
				}
			}
		},
		onLoad(options) {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;
			
			this.fetchData();
		},
		methods: {
			goBack() {
				if (this.isEditing) {
					uni.showModal({
						title: '提示',
						content: '当前正在编辑，确定要放弃修改并退出吗？',
						success: (res) => {
							if (res.confirm) {
								uni.navigateBack();
							}
						}
					});
				} else {
					uni.navigateBack();
				}
			},
			async fetchData() {
				uni.showLoading({ title: '加载中...' });
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						uni.hideLoading();
						uni.showToast({ title: '用户未登录', icon: 'none' });
						return;
					}

					// 1. 获取健康档案详情
					const recordRes = await getHealthRecordList({ userId: userId });
					if (recordRes && recordRes.rows && recordRes.rows.length > 0) {
						// 取最新一条
						this.detail = recordRes.rows[0];
						
						// 2. 获取基础病症
						const diseaseRes = await getUnderlyingMedicalConditionList({ healthRecordsId: this.detail.id });
						if (diseaseRes && diseaseRes.rows) {
							this.diseaseList = diseaseRes.rows;
						} else {
							this.diseaseList = [];
						}
					} else {
						// 无档案，理论上不应该进入此页面，但作为防守
						uni.showToast({ title: '未找到健康档案', icon: 'none' });
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				} catch (error) {
					console.error('加载失败:', error);
					uni.showToast({ title: '加载失败', icon: 'none' });
				} finally {
					uni.hideLoading();
				}
			},
			getBMIStatus(bmi) {
				if (!bmi) return '';
				const val = parseFloat(bmi);
				if (val < 18.5) return '偏瘦';
				if (val < 24) return '正常';
				if (val < 28) return '超重';
				return '肥胖';
			},
			getBMIStatusClass(bmi) {
				if (!bmi) return '';
				const val = parseFloat(bmi);
				if (val < 18.5) return 'status-warning';
				if (val < 24) return 'status-success';
				if (val < 28) return 'status-warning';
				return 'status-danger';
			},
			maskIdCard(idCard) {
				if (!idCard || idCard.length < 10) return idCard;
				return idCard.replace(/^(.{6})(?:\d+)(.{4})$/, "$1********$2");
			},
			formatDate(dateStr) {
				if (!dateStr) return '';
				return dateStr.split(' ')[0];
			},
			handleEdit() {
				// 进入编辑模式，复制数据
				this.editForm = {
					id: this.detail.id, // 保留ID
					userId: this.detail.userId,
					name: this.detail.name,
					sex: this.detail.sex,
					age: this.detail.age,
					height: this.detail.height,
					weight: this.detail.weight,
					bmi: this.detail.bim, // API is bim, UI is bmi
					phone: this.detail.phone,
					idCard: this.detail.idCard,
					createDate: this.formatDate(this.detail.createTime),
					emergencyContact: this.detail.emergencyContact,
					address: this.detail.address,
					diseaseList: JSON.parse(JSON.stringify(this.diseaseList)) // 深拷贝
				};
				this.isEditing = true;
			},
			cancelEdit() {
				uni.showModal({
					title: '提示',
					content: '确定要放弃修改吗？',
					success: (res) => {
						if (res.confirm) {
							this.isEditing = false;
						}
					}
				});
			},
			onDateChange(e) {
				this.editForm.createDate = e.detail.value;
			},
			calculateBMI() {
				const h = parseFloat(this.editForm.height);
				const w = parseFloat(this.editForm.weight);
				if (h > 0 && w > 0) {
					// 身高单位转为米
					const hMeter = h / 100;
					const bmi = w / (hMeter * hMeter);
					this.editForm.bmi = bmi.toFixed(1);
				} else {
					this.editForm.bmi = '';
				}
			},
			addDisease() {
				this.editForm.diseaseList.push({ symptomsName: '', symptomsDescription: '' });
			},
			removeDisease(index) {
				// 这里暂时只是从UI列表中移除，真正删除需要API支持
				// 如果是已有记录，删除可能需要DELETE API，目前只处理不保存
				this.editForm.diseaseList.splice(index, 1);
			},
			async handleSave() {
				// 校验
				if (!this.editForm.name) {
					uni.showToast({ title: '请输入姓名', icon: 'none' });
					return;
				}
				if (!this.editForm.phone) {
					uni.showToast({ title: '请输入电话号', icon: 'none' });
					return;
				}

				uni.showLoading({ title: '保存中...' });
				try {
					// 1. 更新档案
					const updateParams = {
						id: this.editForm.id,
						userId: this.editForm.userId,
						name: this.editForm.name,
						sex: this.editForm.sex,
						age: this.editForm.age ? parseInt(this.editForm.age) : 0,
						height: this.editForm.height ? parseFloat(this.editForm.height) : 0,
						weight: this.editForm.weight ? parseFloat(this.editForm.weight) : 0,
						bim: this.editForm.bmi ? parseFloat(this.editForm.bmi) : 0, // Map bmi -> bim
						phone: this.editForm.phone,
						idCard: this.editForm.idCard,
						emergencyContact: this.editForm.emergencyContact,
						address: this.editForm.address,
						// createTime: this.editForm.createDate // 通常创建时间不更新，或需要带时分秒
					};
					
					await updateHealthRecord(updateParams);
					
					// 2. 更新病症
					// 策略：遍历 editForm.diseaseList
					// 有 ID 的 -> updateUnderlyingMedicalCondition
					// 无 ID 的 -> addUnderlyingMedicalCondition
					// 被删除的 -> 暂时无法处理 (无 DELETE API)
					
					const diseasePromises = this.editForm.diseaseList
						.filter(item => item.symptomsName && item.symptomsName.trim() !== '')
						.map(item => {
							if (item.id) {
								return updateUnderlyingMedicalCondition(item);
							} else {
								return addUnderlyingMedicalCondition({
									healthRecordsId: this.editForm.id,
									symptomsName: item.symptomsName,
									symptomsDescription: item.symptomsDescription
								});
							}
						});
					
					if (diseasePromises.length > 0) {
						await Promise.all(diseasePromises);
					}
					
					uni.hideLoading();
					uni.showToast({ title: '保存成功', icon: 'success' });
					this.isEditing = false;
					this.fetchData(); // 刷新数据
					
				} catch (error) {
					console.error('保存失败:', error);
					uni.hideLoading();
					uni.showToast({ title: '保存失败', icon: 'none' });
				}
			},
			handleShare() {
				uni.showToast({ title: '分享功能开发中', icon: 'none' });
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

	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #2b85e4;
		z-index: 999;
		
		.nav-content {
			height: 44px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 20rpx;
			
			.left-icon {
				width: 60rpx;
				height: 44px;
				display: flex;
				align-items: center;
				justify-content: flex-start;
			}
			
			.nav-title {
				color: #fff;
				font-size: 34rpx;
				font-weight: bold;
			}
			
			.right-placeholder {
				width: 60rpx;
			}
		}
	}

	.content-scroll {
		flex: 1;
		width: 100%;
	}
	
	.content-wrapper {
		padding: 30rpx;
	}

	.info-card {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
		
		.card-header {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 30rpx;
			display: flex;
			align-items: center;
			
			&.space-between {
				justify-content: space-between;
			}
			
			.header-left {
				display: flex;
				align-items: center;
			}
			
			.add-btn {
				display: flex;
				align-items: center;
				color: #2b85e4;
				font-size: 26rpx;
				font-weight: normal;
				
				.plus {
					font-size: 32rpx;
					margin-right: 4rpx;
					font-weight: bold;
				}
			}
		}
	}

	.info-grid {
		display: flex;
		flex-wrap: wrap;
		
		.info-item {
			width: 50%;
			display: flex;
			flex-direction: column;
			margin-bottom: 40rpx;
			padding-right: 20rpx;
			box-sizing: border-box;
			
			&.full-width {
				width: 100%;
				padding-right: 0;
			}
			
			.label-row {
				display: flex;
				align-items: center;
				margin-bottom: 12rpx;
				
				.label {
					font-size: 26rpx;
					color: #999;
					margin-left: 10rpx;
					
					&.required::before {
						content: '*';
						color: #ff4d4f;
						margin-right: 4rpx;
					}
				}
			}
			
			.value {
				font-size: 30rpx;
				color: #333;
				font-weight: 500;
				padding-left: 46rpx;
			}
			
			.value-row {
				display: flex;
				align-items: center;
				
				.bmi-status {
					font-size: 26rpx;
					margin-left: 10rpx;
					font-weight: bold;
					
					&.status-success { color: #52c41a; }
					&.status-warning { color: #faad14; }
					&.status-danger { color: #ff4d4f; }
				}
			}
			
			.address-text {
				line-height: 1.5;
			}
			
			.contact-col {
				display: flex;
				flex-direction: column;
			}
			
			/* 输入框样式 */
			.input {
				height: 60rpx;
				border: 2rpx solid #e8e8e8;
				border-radius: 8rpx;
				padding: 0 20rpx;
				font-size: 28rpx;
				color: #333;
				margin-top: 6rpx;
				
				&.disabled {
					background-color: #f5f5f5;
					color: #999;
				}
			}
			
			.textarea {
				border: 2rpx solid #e8e8e8;
				border-radius: 8rpx;
				padding: 16rpx 20rpx;
				font-size: 28rpx;
				color: #333;
				margin-top: 6rpx;
				min-height: 120rpx;
			}
			
			.picker-view {
				line-height: 60rpx;
				color: #ccc;
				
				&.has-value {
					color: #333;
				}
			}
		}
	}
	
	/* 单选框样式 */
	.radio-group {
		display: flex;
		align-items: center;
		margin-top: 10rpx;
		padding-left: 10rpx;
		
		.radio-item {
			display: flex;
			align-items: center;
			margin-right: 40rpx;
			font-size: 28rpx;
			color: #666;
			
			.radio-circle {
				width: 32rpx;
				height: 32rpx;
				border: 2rpx solid #ccc;
				border-radius: 50%;
				margin-right: 10rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			
			&.active {
				color: #333;
				
				.radio-circle {
					border-color: #2b85e4;
					background-color: #2b85e4;
					
					.radio-inner {
						width: 12rpx;
						height: 12rpx;
						background-color: #fff;
						border-radius: 50%;
					}
				}
			}
		}
	}

	.disease-list {
		.disease-item {
			background-color: #fff;
			border: 2rpx solid #eee;
			border-radius: 16rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			
			.disease-name {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				display: block;
				margin-bottom: 10rpx;
			}
			
			.disease-desc {
				font-size: 26rpx;
				color: #666;
				line-height: 1.4;
			}
		}
		
		/* 编辑模式下的病症卡片 */
		.disease-card-edit {
			background-color: #f8f9fb;
			border-radius: 16rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			border: 2rpx solid #eee;
			
			.disease-header-edit {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				
				.disease-index {
					font-size: 26rpx;
					color: #999;
					font-weight: bold;
				}
				
				.delete-btn {
					padding: 10rpx;
				}
			}
			
			.form-item-edit {
				margin-bottom: 20rpx;
				
				&.no-border {
					margin-bottom: 0;
				}
				
				.label-edit {
					font-size: 26rpx;
					color: #666;
					margin-bottom: 10rpx;
					display: block;
				}
				
				.input-edit {
					height: 68rpx;
					background-color: #fff;
					border: 2rpx solid #e0e0e0;
					border-radius: 8rpx;
					padding: 0 20rpx;
					font-size: 28rpx;
				}
				
				.textarea-edit {
					background-color: #fff;
					border: 2rpx solid #e0e0e0;
					border-radius: 8rpx;
					padding: 16rpx 20rpx;
					font-size: 28rpx;
					min-height: 100rpx;
					width: auto;
				}
			}
		}
	}
	
	.empty-disease {
		text-align: center;
		padding: 40rpx 0;
		color: #999;
		font-size: 26rpx;
	}

	.footer-actions {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 30rpx 40rpx;
		background-color: #f5f7fa; /* Match container bg */
		
		.action-btn {
			flex: 1;
			height: 88rpx;
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			margin: 0 15rpx;
			border: none;
			
			&.edit, &.save {
				background-color: #2b85e4;
				color: #fff;
			}
			
			&.share {
				background-color: #fff;
				color: #2b85e4;
				border: 2rpx solid #2b85e4;
			}
			
			&.cancel {
				background-color: #fff;
				color: #666;
				border: 2rpx solid #ccc;
			}
			
			text {
				margin-left: 10rpx;
			}
			
			&:active {
				opacity: 0.9;
			}
		}
	}
	
	.safe-area-bottom {
		height: env(safe-area-inset-bottom);
		height: constant(safe-area-inset-bottom);
	}
</style>