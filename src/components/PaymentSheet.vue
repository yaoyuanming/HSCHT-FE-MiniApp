<template>
	<up-popup :show="innerShow" mode="bottom" :round="topRound" @close="handleClose">
		<view class="pay-sheet">
			<view class="header">
				<view class="title">{{ title }}</view>
				<view class="close" @click="handleClose">关闭</view>
			</view>

			<view class="pay-options">
				<view v-for="option in options" :key="option.value" class="pay-item"
					:class="{ active: option.value === current }" @click="handleSelect(option)">
					<view class="name">{{ option.name }}</view>
					<view class="balance" v-if="option.value === 'balance'">{{ balanceStatus || '余额不足' }}</view>
				</view>
			</view>

			<button class="pay-btn" :loading="confirmLoading" @click="handleConfirm">
				{{ confirmText }}
			</button>
		</view>
	</up-popup>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: '选择支付方式'
	},
	options: {
		type: Array,
		default: () => []
	},
	current: {
		type: String,
		default: ''
	},
	balanceStatus: {
		type: String,
		default: ''
	},
	confirmText: {
		type: String,
		default: '确认支付'
	},
	confirmLoading: {
		type: Boolean,
		default: false
	},
	topRound: {
		type: Number,
		default: 20
	}
})

const emit = defineEmits(['update:show', 'select', 'confirm'])

const innerShow = ref(props.show)

watch(() => props.show, (val) => {
	innerShow.value = val
})

watch(innerShow, (val) => {
	emit('update:show', val)
})

const handleClose = () => {
	innerShow.value = false
}

const handleSelect = (option) => {
	emit('select', option)
}

const handleConfirm = () => {
	if (props.confirmLoading) return
	emit('confirm')
}
</script>

<style scoped lang="scss">
.pay-sheet {
	padding: 32rpx;
	background: #fff;
	border-radius: 32rpx 32rpx 0 0;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.close {
	font-size: 26rpx;
	color: #999;
}

.pay-options {
	margin-bottom: 20rpx;
}

.pay-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 48rpx 24rpx;
	border-radius: 20rpx;
	border: 1rpx solid #dedfe8;
	margin-bottom: 16rpx;
}

.pay-item.active {
	border-color: #5278ff;
	background: rgba(82, 120, 255, 0.08);
}

.name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.balance {
	font-size: 26rpx;
	color: #999;
}

.pay-btn {
	width: 100%;
	height: 86rpx;
	line-height: 86rpx;
	background: #5278ff;
	color: #fff;
	border: none;
	border-radius: 999rpx;
	font-size: 30rpx;
}
</style>

