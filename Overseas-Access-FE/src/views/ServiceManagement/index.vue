<template>
  <div class="service-management">
    <h2 class="page-title">服务管理</h2>
    
    <div class="filter-container">
      <!-- 国家/地区筛选 -->
      <div class="filter-block">
        <div class="filter-header">
          <span class="label">国家/地区</span>
          <el-button type="primary" bg text class="add-btn" @click="goToAddCountry">
            <el-icon class="mr-1"><Plus /></el-icon>添加国家
          </el-button>
        </div>
        <div class="tags-wrapper">
          <div
            v-for="country in countries"
            :key="country"
            class="custom-tag"
            :class="{ active: selectedCountry === country }"
            @click="selectedCountry = country"
          >
            <span class="dot"></span>
            {{ country }}
          </div>
        </div>
      </div>

      <!-- 服务类型筛选 -->
      <div class="filter-block mt-4">
        <div class="filter-header">
          <span class="label">服务类型</span>
          <el-button type="primary" bg text class="add-btn" @click="goToAddType">
            <el-icon class="mr-1"><Plus /></el-icon>添加类型
          </el-button>
        </div>
        <div class="tags-wrapper">
          <div
            v-for="(type, index) in serviceTypes"
            :key="index"
            class="custom-tag"
            :class="{ active: selectedType === type }"
            @click="selectedType = type"
          >
            <span class="dot"></span>
            {{ type }}
          </div>
        </div>
      </div>
    </div>

    <el-card class="list-card mt-4" shadow="never">
      <div class="card-header">
        <span>文章列表</span>
        <el-button type="primary" icon="Plus" round @click="goToAddArticle">新建文章</el-button>
      </div>
      
      <el-table :data="tableData" style="width: 100%" class="mt-4" :header-cell-style="{ background: '#F5F7FA', color: '#606266' }">
        <el-table-column prop="name" label="文章名称" />
        <el-table-column prop="type" label="服务类型" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已发布' ? 'success' : 'danger'" effect="light" round size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="创建时间" />
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button link type="info" icon="Edit" />
            <el-button link type="info" icon="Delete" />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="total-text">显示 1 至 4，共 4 条</span>
        <el-pagination background layout="prev, pager, next" :total="4" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countries = ['中国', '美国', '日本', '德国', '英国']
const selectedCountry = ref('中国')

const serviceTypes = ['投资架构', '投资架构设计', '投资架构', '投资架构', '投资架构']
const selectedType = ref('投资架构')

const tableData = [
  { name: '投资架构设计1', type: '投资架构设计', status: '已发布', date: '2023-10-15' },
  { name: '投资架构设计2', type: '投资架构设计', status: '已发布', date: '2023-10-10' },
  { name: '投资架构设计3', type: '投资架构设计', status: '已发布', date: '2023-10-05' },
  { name: '投资架构设计4', type: '投资架构设计', status: '已禁用', date: '2023-09-28' },
]

const goToAddCountry = () => {
  router.push('/service/add-country')
}

const goToAddType = () => {
  router.push('/service/add-type')
}

const goToAddArticle = () => {
  router.push('/service/add-article')
}
</script>

<style scoped>
.service-management {
  padding: 0;
}
.page-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.filter-block {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}
.add-btn {
  background-color: #E6F7FF;
  border-color: #E6F7FF;
  color: #1890FF;
  border-radius: 18px;
  padding: 8px 16px;
  height: auto;
  font-weight: normal;
}
.add-btn:hover {
  background-color: #d1f0ff;
  border-color: #d1f0ff;
  color: #1890FF;
}
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.custom-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  background-color: #F5F7FA;
  color: #606266;
  transition: all 0.3s;
}
.custom-tag .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #C0C4CC; /* Default gray dot */
}
.custom-tag.active {
  background-color: #E6F7FF;
  color: #1890FF;
  font-weight: 500;
}
.custom-tag.active .dot {
  background-color: #1890FF; /* Active blue dot */
}
.custom-tag:hover:not(.active) {
  background-color: #EBEEF5;
}

.list-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}
.mt-4 {
  margin-top: 24px;
}
.mr-1 {
  margin-right: 4px;
}
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  color: #909399;
  font-size: 14px;
}
</style>
