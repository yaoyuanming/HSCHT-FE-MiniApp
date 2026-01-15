
import request from '@/utils/request'

export const getConsumptionRecordClientList = (params) => {
	return request('get', '/hospital/consumptionRecord/client/list', params)
}

