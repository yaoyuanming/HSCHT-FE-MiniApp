import request from '@/utils/request'

// 分页获取课程
export const fetchCourseList = (params) => request('get', '/hospital/courses/list', params)

// 课程详情
export const fetchCourseDetail = (id) => request('get', `/hospital/courses/${id}`)

// 课程购买/报名
export const purchaseCourse = (data) => request('post', '/hospital/consumptionRecord/client/enroll-course', data)