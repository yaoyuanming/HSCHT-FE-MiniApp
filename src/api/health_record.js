import request from '@/utils/request'

// 新增健康档案
export const addHealthRecord = (data) => request('post', '/services/healthRecords', data)

// 查询健康档案列表
export const getHealthRecordList = (params) => request('get', '/services/healthRecords/list', params)

// 新增基础病症
export const addUnderlyingMedicalCondition = (data) => request('post', '/services/underlyingMedicalConditions', data)

// 查询基础病症列表
export const getUnderlyingMedicalConditionList = (params) => request('get', '/services/underlyingMedicalConditions/list', params)

// 修改健康档案
export const updateHealthRecord = (data) => request('put', '/services/healthRecords', data)

// 修改基础病症
export const updateUnderlyingMedicalCondition = (data) => request('put', '/services/underlyingMedicalConditions', data)
