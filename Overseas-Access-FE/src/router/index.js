import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import ServiceManagement from '../views/ServiceManagement/index.vue'
import AddCountry from '../views/ServiceManagement/funtion/Add_Country.vue'
import AddType from '../views/ServiceManagement/funtion/ADD_Type.vue'
import AddArticle from '../views/ServiceManagement/funtion/Add_Article.vue'
import CourseManagement from '../views/CourseManagement/index.vue'
import GuideManagement from '../views/GuideManagement/index.vue'
import ServiceLogs from '../views/ServiceLogs/index.vue'
import ServiceConfig from '../views/ServiceConfig/index.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/service',
    children: [
      {
        path: 'service',
        name: 'ServiceManagement',
        component: ServiceManagement,
        meta: { title: '服务管理', icon: 'Menu' }
      },
      {
        path: 'service/add-country',
        name: 'AddCountry',
        component: AddCountry,
        meta: { title: '新建国家', hidden: true, activeMenu: '/service' }
      },
      {
        path: 'service/add-type',
        name: 'AddType',
        component: AddType,
        meta: { title: '新建类型', hidden: true, activeMenu: '/service' }
      },
      {
        path: 'service/add-article',
        name: 'AddArticle',
        component: AddArticle,
        meta: { title: '新建文章', hidden: true, activeMenu: '/service' }
      },
      {
        path: 'course',
        name: 'CourseManagement',
        component: CourseManagement,
        meta: { title: '课程管理', icon: 'List' }
      },
      {
        path: 'guide',
        name: 'GuideManagement',
        component: GuideManagement,
        meta: { title: '指南管理', icon: 'TrendCharts' }
      },
      {
        path: 'logs',
        name: 'ServiceLogs',
        component: ServiceLogs,
        meta: { title: '服务日志', icon: 'Timer' }
      },
      {
        path: 'config',
        name: 'ServiceConfig',
        component: ServiceConfig,
        meta: { title: '服务配置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
