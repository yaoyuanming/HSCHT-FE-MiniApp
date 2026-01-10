import {
	ref,
	computed
} from 'vue'
import {
	getObtainUserBalance,
	UserBalancePayment,
	UserConsumptionRecord
} from '@/api/user.js'
import {
	purchaseCourse
} from '@/api/Curriculum'
import {
	weixinPlay
} from '@/api/user.js'
import {
	completeLoginFlow
} from '@/utils/auth.js'

const CENT_MULTIPLIER = 100

export const requestWxPayment = (params = {}) => new Promise((resolve, reject) => {
	wx.requestPayment({
		...params,
		success(res) {
			if (res.errMsg === 'requestPayment:ok') {
				resolve(true)
			} else {
				reject(new Error('支付失败'))
			}
		},
		fail(err) {
			reject(new Error(err.errMsg || '支付失败或已取消'))
		}
	})
})

export function usePhoneAuthorization() {
	const phoneShow = ref(false)
	const userPhone = ref(
		uni.getStorageSync('userPhone') ||
		uni.getStorageSync('userInfo')?.user?.phonenumber ||
		null
	)

	const openPhonePopup = () => {
		phoneShow.value = true
	}

	const closePhonePopup = () => {
		phoneShow.value = false
	}

	const applyPhoneNumber = (phone) => {
		if (!phone) return
		userPhone.value = phone
		uni.setStorageSync('userPhone', phone)
		closePhonePopup()
	}

	const hasPhone = computed(() => !!userPhone.value)

	return {
		phoneShow,
		userPhone,
		hasPhone,
		openPhonePopup,
		closePhonePopup,
		applyPhoneNumber
	}
}

export function usePurchaseFlow() {
	const paymentOptions = ref([{
			name: '余额支付',
			value: 'balance'
		},
		{
			name: '微信支付',
			value: 'weixin'
		}
	])
	const paymentMethod = ref('balance')
	const balanceInfo = ref({})
	const isPaying = ref(false)

	const ensureLoggedIn = async () => {
		const token = uni.getStorageSync('token')
		if (token) return true
		return completeLoginFlow()
	}

	const refreshBalance = async (expectedCostYuan = 0) => {
		const res = await getObtainUserBalance()
		if (res.code === 200) {
			balanceInfo.value = res.data || {}
			const available = Number(balanceInfo.value.availableBalance || 0)
			if (available === 0 || available < Number(expectedCostYuan) * CENT_MULTIPLIER) {
				paymentMethod.value = 'weixin'
			} else {
				paymentMethod.value = 'balance'
			}
		}
	}

	const selectPaymentMethod = (value, amount) => {
		if (value === 'balance') {
			const available = Number(balanceInfo.value.availableBalance || 0)
			if (available === 0 || available < Number(amount) * CENT_MULTIPLIER) {
				uni.showToast({
					title: '余额不足，请选择微信支付',
					icon: 'none',
					duration: 2000
				})
				return
			}
		}
		paymentMethod.value = value
	}

	const pay = async ({
		amount,
		description = '',
		orderPayload = {},
		onAfterPay,
		useCourseApi = false, // 是否使用课程购买接口
		allowZeroAmount = false // 是否允许 0 元（线下支付等场景）
	}) => {
		if (isPaying.value) return false
		const normalizedAmount = Number(amount) || 0
		if (!allowZeroAmount && normalizedAmount <= 0) {
			uni.showToast({
				title: '金额异常',
				icon: 'none',
				duration: 2000
			})
			return false
		}

		const hasLogin = await ensureLoggedIn()
		if (!hasLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none',
				duration: 2000
			})
			return false
		}

		isPaying.value = true
		try {
			const isZeroOrder = normalizedAmount <= 0
			const currentMethod = paymentMethod.value
			const payType = currentMethod === 'weixin' ? 'WECHAT' : 'BALANCE'
			const payload = {
				customerName: uni.getStorageSync('userInfo')?.user?.nickName,
				contactPhone: uni.getStorageSync('userPhone'),
				consumptionAmount: normalizedAmount * CENT_MULTIPLIER,
				payType,
				...orderPayload
			}
			// 根据 useCourseApi 参数选择使用哪个接口
			const commitOrder = useCourseApi ? purchaseCourse : UserConsumptionRecord
			const consumptionRes = await commitOrder(payload)
			if (consumptionRes.code !== 200) throw new Error(consumptionRes.msg || '创建订单失败')

			// 获取订单号，兼容不同的字段名
			const consumptionCode = consumptionRes.data?.consumptionCode || consumptionRes.data?.consumption_code

			// 免费 / 线下（0 元）直接视为成功
			if (allowZeroAmount || isZeroOrder) {
				onAfterPay && (await onAfterPay(consumptionRes.data))
				return true
			}

			if (currentMethod === 'weixin') {
				// 检查课程购买接口是否直接返回支付参数
				const payParams = consumptionRes.data?.payParams || consumptionRes.data?.pay_params
				if (payParams && useCourseApi) {
					// 课程购买接口直接返回支付参数
					await requestWxPayment(payParams)
				} else {
					// 需要调用 weixinPlay 获取支付参数
					const weixinPlayRes = await weixinPlay({
						description,
						totalAmount: normalizedAmount * CENT_MULTIPLIER,
						openid: uni.getStorageSync('openId'),
						outTradeNo: consumptionCode
					})
					if (weixinPlayRes.code !== 200) throw new Error(weixinPlayRes.msg || '获取支付参数失败')
					await requestWxPayment(weixinPlayRes.data.pay_params)
				}
			} else {
				const available = Number(balanceInfo.value.availableBalance || 0)
				if (available < normalizedAmount * CENT_MULTIPLIER) {
					uni.showToast({
						title: '账户可用余额不足',
						icon: 'none'
					})
					return false
				}
				const balancePayRes = await UserBalancePayment({
					userId: uni.getStorageSync('userId'),
					amount: normalizedAmount,
					transactionNo: consumptionCode
				})
				if (balancePayRes.code !== 200) throw new Error(balancePayRes.msg || '余额支付失败')
				await refreshBalance(normalizedAmount)
			}

			onAfterPay && (await onAfterPay(consumptionRes.data))
			return true
		} catch (error) {
			console.error('支付异常', error)
			const errorMsg = error.message || error.msg || ''
			// 检查是否是用户取消支付（包含 cancel 关键字）
			if (!/cancel/i.test(errorMsg)) {
				uni.showToast({
					title: errorMsg || '支付失败，请稍后再试',
					icon: 'none',
					duration: 2000
				})
			}
			return false
		} finally {
			isPaying.value = false
		}
	}

	const readableBalance = computed(() => {
		const cents = Number(balanceInfo.value.availableBalance || 0)
		return `余额￥${(cents / CENT_MULTIPLIER).toFixed(2)}`
	})

	return {
		paymentOptions,
		paymentMethod,
		balanceInfo,
		readableBalance,
		isPaying,
		refreshBalance,
		selectPaymentMethod,
		pay,
		ensureLoggedIn
	}
}