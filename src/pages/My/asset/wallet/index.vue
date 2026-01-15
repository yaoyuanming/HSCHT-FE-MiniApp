<template>
	<view class="page">
		<view class="card total-card">
			<view class="total-card__content">
				<view class="total-label">总资产（元）</view>
				<view class="total-value">{{ totalAsset }}</view>
			</view>
		</view>

		<view class="recharge-btn" @click="onRecharge">
			<view class="recharge-plus">
				<text class="recharge-plus__text">+</text>
			</view>
			<text class="recharge-text">充值</text>
		</view>

		<view class="card bill-card">
			<view class="bill-card__content">
				<view class="bill-header">
					<view class="bill-title">账单详情</view>
					<view class="bill-tag">本月</view>
				</view>

				<view class="bill-list">
					<view class="bill-item" v-for="(item, idx) in billPreviewList" :key="idx">
						<view class="bill-left">
							<view class="bill-icon" :class="item.iconClass">
								<text class="bill-icon-text">{{ item.iconText }}</text>
							</view>
							<view class="bill-info">
								<view class="bill-name-row">
									<view class="bill-name">{{ item.name }}</view>
									<view v-if="item.statusText" class="bill-status" :class="item.statusClass">{{ item.statusText }}</view>
								</view>
								<view class="bill-time">{{ item.time }}</view>
							</view>
						</view>
						<view class="bill-amount" :class="item.amountClass">{{ item.consumptionAmount }}</view>
					</view>
				</view>

				<view class="bill-more" @click="onViewMore">查看更多消费记录</view>
			</view>
		</view>

		<uni-popup ref="billPopup" type="bottom" :safe-area="false">
			<view class="bill-popup">
				<view class="bill-popup__header">
					<view class="bill-popup__title">消费记录</view>
					<view class="bill-popup__close" @click="closeBillPopup">关闭</view>
				</view>
				<scroll-view class="bill-popup__list" scroll-y @scrolltolower="onBillPopupReachBottom">
					<view class="bill-item" v-for="(item, idx) in billPopupList" :key="idx">
						<view class="bill-left">
							<view class="bill-icon" :class="item.iconClass">
								<text class="bill-icon-text">{{ item.iconText }}</text>
							</view>
							<view class="bill-info">
								<view class="bill-name-row">
									<view class="bill-name">{{ item.name }}</view>
									<view v-if="item.statusText" class="bill-status" :class="item.statusClass">{{ item.statusText }}</view>
								</view>
								<view class="bill-time">{{ item.time }}</view>
							</view>
						</view>
						<view class="bill-amount" :class="item.amountClass">{{ item.consumptionAmount }}</view>
					</view>

					<view class="bill-popup__footer" v-if="billPopupLoading">加载中...</view>
					<view class="bill-popup__footer" v-else-if="billPopupTotal && billPopupList.length >= billPopupTotal">没有更多了</view>
				</scroll-view>
			</view>
		</uni-popup>

		<RechargePopup ref="rechargePopup" @confirm="onRechargeConfirm" />
	</view>
</template>


<script setup>
	import { ref, computed } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import { useStore } from 'vuex'
	import { getObtainUserBalance } from '@/api/user.js'
	import { getConsumptionRecordClientList } from '@/api/my/consumption.js'
	import RechargePopup from './RechargePopup.vue'

	const store = useStore()
	const customerId = computed(() => store.state.userId)
	const billPopup = ref(null)
	const rechargePopup = ref(null)

	const totalAsset = ref('0')
	const billList = ref([])
	const billPreviewList = computed(() => billList.value.slice(0, 7))

	const billPopupLoading = ref(false)
	const billPopupPageNum = ref(1)
	const billPopupPageSize = ref(10)
	const billPopupTotal = ref(0)
	const billPopupList = ref([])

	const formatMoney = (value) => {
		const num = Number(value)
		if (!Number.isFinite(num)) return '0.00'
		return num.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})
	}

	const refreshBalance = async () => {
		try {
			const res = await getObtainUserBalance()
			if (res && res.code === 200) {
				const cents = Number(res.data?.availableBalance || 0)
				totalAsset.value = formatMoney(cents / 100)
				return
			}
			uni.showToast({
				title: res?.msg || '余额获取失败',
				icon: 'none'
			})
		} catch (e) {
			uni.showToast({ title: '余额获取失败', icon: 'none' })
		}
	}

	const normalizeAmount = (val) => {
		if (val === undefined || val === null) return undefined
		if (typeof val === 'number') return val
		const n = Number(val)
		if (Number.isNaN(n)) return undefined
		return n
	}

	const getItemType = (recordType) => {
		// type: 0套餐 1充值 2退款 3ai 4课程
		if (recordType === 1 || recordType === 2) return 'income'
		return 'expense'
	}

	const formatSignedAmount = (amountYuan, itemType) => {
		if (amountYuan === undefined) return ''
		const abs = Math.abs(amountYuan)
		return itemType === 'income' ? `+¥${formatMoney(abs)}` : `-¥${formatMoney(abs)}`
	}

	const getMappedTitleByConsumerContent = (consumerContent) => {
		const content = typeof consumerContent === 'string' ? consumerContent.trim() : ''
		if (!content) return ''
		const [prefixRaw] = content.split(',')
		const prefix = (prefixRaw || '').trim()
		const prefixMap = {
			AI_CHAT: '对话',
			AI_IMAGE: '图片生成',
			AI_VIDEO: '视频生成'
		}
		return prefixMap[prefix] || ''
	}

	const getTitle = (r) => {
		const recordType = Number(r?.type)
		// type: 0套餐 1充值 2退款 3ai 4课程
		if (recordType === 1) return '充值'
		if (recordType === 2) return '退款'
		if (recordType === 3) {
			return getMappedTitleByConsumerContent(r?.consumerContent) || 'AI'
		}
		if (recordType === 0) {
			const pkg0 = Array.isArray(r?.packageInfoList) ? r.packageInfoList[0] : null
			return pkg0?.packageName || '套餐'
		}
		if (recordType === 4) {
			return r?.entCourse?.courseName || '课程'
		}
		return '消费记录'
	}

	const getStatusText = (status) => {
		if (status === undefined || status === null || status === '') return ''
		const n = Number(status)
		if (Number.isNaN(n)) return ''
		const map = {
			[-1]: '待支付',
			0: '未预约',
			1: '已预约',
			2: '使用中',
			3: '已完成',
			4: '已退款',
			5: '已取消',
			6: '已过期'
		}
		return map[n] || `状态${n}`
	}

	const getStatusClass = (status) => {
		if (status === undefined || status === null || status === '') return ''
		const n = Number(status)
		if (Number.isNaN(n)) return ''
		if (n === 3) return 'is-success'
		if (n === 5 || n === 6) return 'is-muted'
		if (n === -1) return 'is-warning'
		if (n === 4) return 'is-info'
		if (n === 2) return 'is-primary'
		if (n === 0 || n === 1) return 'is-processing'
		return 'is-default'
	}

	const mapBillItem = (r) => {
		const itemType = getItemType(Number(r?.type))
		const amountNumber = normalizeAmount(r?.consumptionAmount)
		const amountYuan = amountNumber === undefined ? undefined : amountNumber
		const title = getTitle(r)
		const statusText = getStatusText(r?.status)
		const statusClass = getStatusClass(r?.status)
		return {
			name: title,
			time: String(r?.consumeTime ?? r?.createTime ?? ''),
			consumptionAmount: formatSignedAmount(amountYuan, itemType),
			amountClass: itemType === 'income' ? 'amount-in' : 'amount-out',
			iconText: String(title || '').slice(0, 1),
			iconClass: itemType === 'income' ? 'icon-green' : 'icon-red',
			statusText: statusText || '',
			statusClass: statusClass || ''
		}
	}

	const fetchBillList = async () => {
		try {
			if (!customerId.value) return
			const res = await getConsumptionRecordClientList({
				customerId: customerId.value,
				pageNum: 1,
				pageSize: 10,
				orderByColumn: 'createTime',
				isAsc: 'desc'
			})
			if (!res || res.code !== 200) return
			const rows = res.rows || []
			if (!Array.isArray(rows)) return
			billList.value = rows.map(mapBillItem)
		} catch (e) {
			console.error('getConsumptionRecordClientList error:', e)
		}
	}

	const fetchBillPopupList = async (reset = false) => {
		if (billPopupLoading.value) return
		if (!customerId.value) return
		if (reset) {
			billPopupPageNum.value = 1
			billPopupTotal.value = 0
			billPopupList.value = []
		}
		if (!reset && billPopupTotal.value && billPopupList.value.length >= billPopupTotal.value) return

		billPopupLoading.value = true
		try {
			const res = await getConsumptionRecordClientList({
				customerId: customerId.value,
				pageNum: billPopupPageNum.value,
				pageSize: billPopupPageSize.value,
				orderByColumn: 'createTime',
				isAsc: 'desc'
			})
			if (!res || res.code !== 200) return
			const rows = res.rows || []
			if (!Array.isArray(rows)) return
			billPopupTotal.value = Number(res.total || 0) || 0
			billPopupList.value = billPopupList.value.concat(rows.map(mapBillItem))
			billPopupPageNum.value += 1
		} catch (e) {
			console.error('getConsumptionRecordClientList popup error:', e)
		} finally {
			billPopupLoading.value = false
		}
	}

	const openBillPopup = async () => {
		billPopup.value?.open?.()
		await fetchBillPopupList(true)
	}

	const closeBillPopup = () => {
		billPopup.value?.close?.()
	}

	const onBillPopupReachBottom = () => {
		fetchBillPopupList(false)
	}

	const onRecharge = () => {
		rechargePopup.value?.openModal?.()
	}

	const onRechargeConfirm = async () => {
		await refreshBalance()
		await fetchBillList()
	}

	const onViewMore = () => {
		openBillPopup()
	}

	onShow(() => {
		refreshBalance()
		fetchBillList()
	})
</script>

<style scoped>
	.page {
		min-height: 100vh;
		padding: 30rpx;
		background-color: #f5f7fa;
	}

	.card {
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.total-card {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-start;
		padding: 0;
		width: 686rpx;
		height: 314rpx;
		border-radius: 40rpx;
		box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05);
		background: #ffffff;
		margin-top: 10rpx;
		margin-bottom: 24rpx;
	}

	.total-card__content {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		padding: 32rpx;
		width: 100%;
	}

	.total-label {
		font-size: 28rpx;
		font-family: "Alibaba PuHuiTi 2.0";
		font-weight: 400;
		color: #666666;
		line-height: 40rpx;
		text-align: left;
		vertical-align: middle;
		margin-bottom: 32rpx;
	}

	.total-value {
		font-size: 64rpx;
		font-family: "Alibaba PuHuiTi 2.0";
		font-weight: 700;
		color: #333333;
		line-height: 90rpx;
		text-align: left;
		vertical-align: middle;
	}

	.recharge-btn {
		width: 686rpx;
		height: 88rpx;
		border-radius: 16rpx;
		background: #1890ff;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		margin-top: 48rpx;
		margin-bottom: 64rpx;
	}

	.recharge-plus {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.recharge-plus__text {
		font-size: 24rpx;
		font-weight: 700;
		color: #1890ff;
		line-height: 1;
	}

	.recharge-text {
		font-size: 32rpx;
		font-family: "Alibaba PuHuiTi 2.0";
		font-weight: 500;
		color: #ffffff;
		line-height: 44rpx;
		text-align: left;
		vertical-align: middle;
	}

	.bill-card {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-start;
		padding: 0;
		width: 686rpx;
		height: 858rpx;
		border-radius: 40rpx;
		box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05);
		background: #ffffff;
	}

	.bill-card__content {
		padding: 40rpx 40rpx 0 40rpx;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.bill-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18rpx;
	}

	.bill-list {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.bill-title {
		font-size: 40rpx;
		font-family: "Alibaba PuHuiTi 2.0";
		font-weight: 500;
		color: #333333;
		line-height: 56rpx;
		text-align: left;
		vertical-align: middle;
	}

	.bill-tag {
		font-size: 22rpx;
		color: #1e88ff;
		background: rgba(30, 136, 255, 0.12);
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
	}

	.bill-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 22rpx 0;
		border-top: 1rpx solid #f2f3f5;
	}

	.bill-left {
		display: flex;
		align-items: center;
		gap: 18rpx;
	}

	.bill-icon {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bill-icon-text {
		font-size: 26rpx;
		color: #fff;
		font-weight: 700;
	}

	.icon-red {
		background: #ff6b6b;
	}
	.icon-blue {
		background: #4c8dff;
	}
	.icon-green {
		background: #5ad37a;
	}
	.icon-purple {
		background: #a56bff;
	}

	.bill-info {
		display: flex;
		flex-direction: column;
	}

	.bill-name-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.bill-status {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 999rpx;
		line-height: 1.4;
	}

	.bill-status.is-success {
		background: rgba(34, 197, 94, 0.12);
		color: #22c55e;
	}
	.bill-status.is-muted {
		background: rgba(156, 163, 175, 0.16);
		color: #9aa0a6;
	}
	.bill-status.is-warning {
		background: rgba(245, 158, 11, 0.16);
		color: #f59e0b;
	}
	.bill-status.is-info {
		background: rgba(59, 130, 246, 0.14);
		color: #3b82f6;
	}
	.bill-status.is-primary {
		background: rgba(30, 136, 255, 0.12);
		color: #1e88ff;
	}
	.bill-status.is-processing {
		background: rgba(168, 85, 247, 0.12);
		color: #a855f7;
	}
	.bill-status.is-default {
		background: rgba(107, 114, 128, 0.12);
		color: #6b7280;
	}

	.bill-name {
		font-size: 28rpx;
		color: #2c2c2c;
		font-weight: 600;
		margin-bottom: 6rpx;
	}

	.bill-time {
		font-size: 22rpx;
		color: #9aa0a6;
	}

	.bill-amount {
		font-size: 28rpx;
		font-weight: 700;
	}

	.amount-out {
		color: #ff3b30;
	}

	.amount-in {
		color: #22c55e;
	}

	.bill-tip {
		font-size: 22rpx;
		color: #ff3b30;
		text-align: center;
		padding-top: 18rpx;
	}

	.bill-more {
		font-size: 24rpx;
		color: #1e88ff;
		text-align: center;
		margin-top: auto;
		padding-top: 10rpx;
		margin-bottom: 10rpx;
	}

	.bill-popup {
		background: #ffffff;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		padding: 24rpx;
	}

	.bill-popup__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 16rpx;
		border-bottom: 1rpx solid #f2f3f5;
	}

	.bill-popup__title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
	}

	.bill-popup__close {
		font-size: 28rpx;
		color: #1e88ff;
	}

	.bill-popup__list {
		height: 70vh;
		padding-top: 12rpx;
	}

	.bill-popup__footer {
		font-size: 24rpx;
		color: #9aa0a6;
		text-align: center;
		padding: 20rpx 0;
	}
</style>
