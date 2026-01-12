<template>
	<up-popup :show="innerVisible" :title="packageName" :custom-style="{ padding: '0', borderRadius: '16rpx' }"
		@close="handleClose" :mask-click="false">
		<view class="date-popup">
			<!-- 套餐信息 -->
			<view class="package-info">
				<text class="package-name">{{ packageName }}</text>
				<!-- <text class="package-desc">支持最近一周预约 · 请选择具体项目及时段</text> -->
			</view>

			<!-- 日期列表 -->
			<scroll-view class="week-scroll" scroll-x="true" scroll-with-animation="true" show-scrollbar="false">
				<view class="date-container">
					<view v-for="(dateItem, index) in weekDateList" :key="index" class="date-item"
						:class="{ active: activeDateIndex === index }" @click="activeDateIndex = index">
						<text class="date-week">{{ dateItem.week }}</text>
						<text class="date-day">{{ dateItem.day }}</text>
						<text class="date-month">{{ dateItem.month }}</text>
					</view>
				</view>
			</scroll-view>

			<scroll-view class="time-scroll" scroll-y="true" scroll-with-animation="true" show-scrollbar="false">
				<view class="time-section">
					<view class="time-title">可预约项目及时段</view>
					<view v-if="selectedDateItem?.timeSlots?.length" class="date-time-group">
						<view class="group-date">
							{{ selectedDateItem.month }} {{ selectedDateItem.day }}（{{ selectedDateItem.week }}）
						</view>
						<view class="time-slots">
							<view v-for="(slot, slotIndex) in selectedDateItem.timeSlots" :key="slotIndex"
								class="time-slot"
								:class="{ disabled: Number(slot.reservedCount) >= Number(slot.remain)}">
								<view class="slot-info">
									<!-- <text class="slot-project">{{ slot.projectName }}</text> -->
									<text class="slot-time">{{ slot.time }}</text>
								</view>
								<view class="slot-right">
									<text class="slot-remain">
										{{
										      Number(slot.reservedCount) >= Number(slot.remain) 
										        ? '已满' 
										        : `${slot.reservedCount}/${slot.remain}个名额` 
										    }}
									</text>
									<button :disabled="Number(slot.reservedCount) >= Number(slot.remain)"
										class="reserve-btn"
										:style="{background:slot.remain == slot.reservedCount ? '#5278FF' :'#A5A5B6'}"
										@click.stop="handleReserve(selectedDateItem, slot)">
										预约
									</button>
								</view>
							</view>
						</view>
					</view>

					<!-- 空状态 -->
					<view v-else class="empty-tip">
						暂无可预约项目及时段
					</view>
				</view>
			</scroll-view>
		</view>
	</up-popup>

</template>

<script setup>
	import {
		ref,
		computed,
		defineProps,
		defineEmits,
		defineExpose,
		watch,
		onMounted
	} from 'vue'
	import {
		ShiftScheduling
	} from '@/api/project.js'


	const emit = defineEmits(['confirm', 'close'])

	// 内部状态
	const innerVisible = ref(false)
	const scheduleData = ref([])
	const weekDateList = ref([])
	const activeDateIndex = ref(0)
	const loading = ref(false)
	const showRemark = ref(false)
	const projectIds = ref(null)
	const info = ref({})
	const remark = ref(null)

	const cumspeioIds = ref(null)

	const packageName = ref(null)

	// 选中日期数据
	const selectedDateItem = computed(() => {
		return weekDateList.value[activeDateIndex.value] || {}
	})

	// 打开弹窗
	const openModal = async (rows) => {
		if (!rows) {
			uni.showToast({
				title: '请传入项目ID',
				icon: 'none'
			});
			return;
		}
		packageName.value = rows.projectName
		loading.value = true;
		innerVisible.value = true;
		await getScheduleData(rows.projectId);
		cumspeioIds.value = rows.customerReservationId
		loading.value = false;
	}

	// 获取排班数据
	const getScheduleData = async (Ids) => {
		try {
			projectIds.value = Ids
			const res = await ShiftScheduling(Ids);
			if (res.code === 200) {
				scheduleData.value = res.data;
				formatScheduleData();
			} else {
				uni.showToast({
					title: res.msg || '获取预约数据失败',
					icon: 'none'
				});
			}
		} catch (error) {
			uni.showToast({
				title: '网络错误，无法加载预约数据',
				icon: 'none'
			});
		}
	}

	// 备注框
	const handelConfirm = () => {
		info.value.remark = remark.value

	}

	// 处理数据格式
	const formatScheduleData = () => {
		const weekMap = {
			1: '周一',
			2: '周二',
			3: '周三',
			4: '周四',
			5: '周五',
			6: '周六',
			7: '周日'
		};
		const formattedList = [];

		scheduleData.value.forEach(dateItem => {
			const date = new Date(dateItem.scheduleDate);
			const month = `${date.getMonth() + 1}月`;
			const day = `${date.getDate()}日`;
			const week = weekMap[dateItem.weekDay];
			const fullDate =
				`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

			// 遍历时间段→项目，生成每个预约项
			const allTimeSlots = [];
			dateItem.scheduleDetails.forEach(detail => {
				detail.projectInfo.forEach(project => {
					allTimeSlots.push({
						time: detail.timeSlot,
						projectId: project.projectId,
						projectName: project.projectName,
						remain: project.availableCount,
						slotId: project.id || '',
						sortOrder: detail.sortOrder,
						reservedCount: project.reservedCount
					});
				});
			});

			// 按时段排序
			allTimeSlots.sort((a, b) => a.sortOrder - b.sortOrder);

			formattedList.push({
				month,
				day,
				week,
				fullDate,
				timeSlots: allTimeSlots
			});
		});

		weekDateList.value = formattedList;
		activeDateIndex.value = 0;
	}

	// 关闭弹窗
	const handleClose = () => {
		innerVisible.value = false;
		emit('close');
	}

	// 处理预约
	const handleReserve = (date, slot) => {
		console.log(date, slot);
		const timeParts = slot.time.split('-');
		const [reservationStartTime, reservationEndTime] = timeParts;

		info.value = {
			customerReservationId: cumspeioIds.value,
			entScheduleDetailRecordId: slot.slotId,
		}
		emit('confirm', info.value)
		innerVisible.value = false
		showRemark.value = false
	}

	// 暴露函数给父组件
	defineExpose({
		openModal
	})

	// 监听弹窗关闭重置状态
	watch(innerVisible, (newVal) => {
		if (!newVal) {
			activeDateIndex.value = 0;
		}
	})
</script>

<style scoped>
	.remark-textarea {
		width: 100%;
		height: 100%;
	}

	.date-popup {
		width: 100vw;
	}

	.week-scroll {
		width: 100%;
		height: auto;
		background-color: #f9f9f9;
	}

	.date-container {
		display: flex;
		padding: 20rpx 10rpx;
	}

	.date-item {
		flex: 0 0 auto;
		width: 100rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 15rpx 0;
		margin: 0 10rpx;
		background-color: #fff;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		transition: all 0.2s;
	}

	.date-item.active {
		background-color: #5278FF;
	}

	.date-item.active .date-week,
	.date-item.active .date-day,
	.date-item.active .date-month {
		color: #fff;
	}

	.date-week {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 8rpx;
	}

	.date-day {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 5rpx;
	}

	.date-month {
		font-size: 22rpx;
		color: #999;
	}

	.package-info {
		padding: 30rpx 30rpx 10rpx;
		border-bottom: 1rpx solid #f1f1f1;
	}

	.package-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}

	.package-desc {
		font-size: 24rpx;
		color: #666;
	}

	.time-scroll {
		width: 100%;
		max-height: 500rpx;
	}

	.time-section {
		padding: 0 30rpx 20rpx;
	}

	.time-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f1f1f1;
		margin-bottom: 15rpx;
	}

	.group-date {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 15rpx;
		padding-left: 10rpx;
		border-left: 4rpx solid #5278FF;
	}

	.time-slots {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	.time-slot {
		padding: 20rpx;
		background-color: #f7f7f7;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: all 0.2s;
	}

	.time-slot.disabled {
		background-color: #f1f1f1;
		opacity: 0.7;
	}

	.slot-info {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.slot-project {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
	}

	.slot-time {
		font-size: 22rpx;
		color: #666;
	}

	.slot-remain {
		font-size: 22rpx;
		color: #5278FF;
		margin-right: 15rpx;
		min-width: 120rpx;
		text-align: right;
	}

	.slot-right {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.time-slot.disabled .slot-remain {
		color: #f53f3f;
	}

	.reserve-btn {
		width: 100rpx !important;
		height: 58rpx !important;
		background: #5278FF !important;
		border-radius: 20px !important;
		border: none !important;
		color: #fff !important;
		font-size: 28rpx !important;
		line-height: 58rpx !important;
		padding: 0 !important;
		margin: 0;
	}

	.confirm-btn {
		margin-top: 20rpx;
		width: 100% !important;
		height: 68rpx !important;
		background: #5278FF !important;
		border-radius: 20px !important;
		border: none !important;
		color: #fff !important;
		font-size: 28rpx !important;
		line-height: 68rpx !important;
		padding: 0 !important;
		margin: 0;
	}

	.reserve-btn::after {
		border: none !important;
	}

	/* 空状态样式 */
	.empty-tip {
		font-size: 26rpx;
		color: #999;
		text-align: center;
		padding: 60rpx 0;
	}
</style>